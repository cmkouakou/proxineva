// C:\src\proxineva\app\api\service-requests\route.ts
import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServer } from "@/lib/supabase/server";
import { ServiceRequestSchema } from "@/lib/validators/serviceRequest";

const STATUS_ALLOWED = new Set(["NEW", "IN_PROGRESS", "DONE"]);

function isAllowedEmail(email: string | null | undefined) {
  const allowed = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  // si vide => pas de filtre
  if (allowed.length === 0) return true;

  return !!email && allowed.includes(email.toLowerCase());
}

async function requireAdmin() {
  const supabaseServer = await createSupabaseServer();
  const { data: authData } = await supabaseServer.auth.getUser();
  const user = authData.user;

  if (!user) {
    return { ok: false as const, res: NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }) };
  }
  if (!isAllowedEmail(user.email)) {
    return { ok: false as const, res: NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 }) };
  }

  return { ok: true as const, user };
}

// ✅ PUBLIC: création d'une demande (demandeur)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = ServiceRequestSchema.parse(body);

    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase
      .from("service_requests")
      .insert({
        zone: input.zone,
        category: input.category,
        mode: input.mode,
        priority: input.priority,
        full_name: input.full_name,
        email: input.email,
        phone: input.phone || null,
        description: input.description,
      })
      .select("id, created_at")
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, request: data }, { status: 201 });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json(
        { ok: false, error: "Validation error", issues: err.issues },
        { status: 422 }
      );
    }

    return NextResponse.json({ ok: false, error: err?.message ?? "Server error" }, { status: 500 });
  }
}

// 🔒 ADMIN: lecture des demandes
export async function GET(req: Request) {
  try {
    const gate = await requireAdmin();
    if (!gate.ok) return gate.res;

    const url = new URL(req.url);

    const statusParam = url.searchParams.get("status");
    const status = statusParam && STATUS_ALLOWED.has(statusParam) ? statusParam : null;

    const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 200);
    const offset = Number(url.searchParams.get("offset") ?? 0);

    const supabase = createSupabaseAdmin();

    let query = supabase
      .from("service_requests")
      .select(
        "id, created_at, zone, category, mode, priority, full_name, email, phone, description, status, internal_notes"
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) query = query.eq("status", status);

    const { data: rows, error } = await query;

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, count: rows?.length ?? 0, data: rows ?? [] }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? "Server error" }, { status: 500 });
  }
}

// 🔒 ADMIN: mise à jour status / internal_notes
export async function PATCH(req: Request) {
  try {
    const gate = await requireAdmin();
    if (!gate.ok) return gate.res;

    const body = await req.json();
    const { id, status, internal_notes } = body ?? {};

    if (!id || typeof id !== "string") {
      return NextResponse.json({ ok: false, error: "Missing or invalid id" }, { status: 400 });
    }

    const update: Record<string, any> = {};

    if (status !== undefined) {
      if (typeof status !== "string" || !STATUS_ALLOWED.has(status)) {
        return NextResponse.json(
          { ok: false, error: "Invalid status. Use NEW | IN_PROGRESS | DONE" },
          { status: 422 }
        );
      }
      update.status = status;
    }

    if (internal_notes !== undefined) {
      if (typeof internal_notes !== "string") {
        return NextResponse.json({ ok: false, error: "internal_notes must be a string" }, { status: 422 });
      }
      update.internal_notes = internal_notes;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { ok: false, error: "Nothing to update. Provide status and/or internal_notes." },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase
      .from("service_requests")
      .update(update)
      .eq("id", id)
      .select("id, status, internal_notes, created_at")
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, request: data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? "Server error" }, { status: 500 });
  }
}
