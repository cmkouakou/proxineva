// C:\src\proxineva\app\api\admin\export\route.ts

import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServer } from "@/lib/supabase/server";

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
    return {
      ok: false as const,
      res: NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (!isAllowedEmail(user.email)) {
    return {
      ok: false as const,
      res: NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true as const, user };
}

function csvEscape(value: unknown) {
  const s = value === null || value === undefined ? "" : String(value);
  // CSV standard: wrap in quotes if contains comma, quote, or newline
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET() {
  try {
    const gate = await requireAdmin();
    if (!gate.ok) return gate.res;

    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase
      .from("service_requests")
      .select(
        "id, created_at, zone, category, mode, priority, full_name, email, phone, description, status, internal_notes"
      )
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    const rows = data ?? [];

    const header = [
      "id",
      "created_at",
      "zone",
      "category",
      "mode",
      "priority",
      "full_name",
      "email",
      "phone",
      "description",
      "status",
      "internal_notes",
    ];

    const lines = [
      header.join(","), // header line
      ...rows.map((r: any) =>
        [
          csvEscape(r.id),
          csvEscape(r.created_at),
          csvEscape(r.zone),
          csvEscape(r.category),
          csvEscape(r.mode),
          csvEscape(r.priority),
          csvEscape(r.full_name),
          csvEscape(r.email),
          csvEscape(r.phone),
          csvEscape(r.description),
          csvEscape(r.status),
          csvEscape(r.internal_notes),
        ].join(",")
      ),
    ];

    const csv = "\uFEFF" + lines.join("\n"); // BOM UTF-8 pour Excel

    const filename = `proxineva_service_requests_${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? "Server error" }, { status: 500 });
  }
}
