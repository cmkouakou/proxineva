// C:\src\proxineva\app\api\service-request-events\route.ts

import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServer } from "@/lib/supabase/server";

function isAllowedEmail(email: string | null | undefined) {
  const allowed = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

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

// 🔒 ADMIN: liste des events d'une demande
export async function GET(req: Request) {
  try {
    const gate = await requireAdmin();
    if (!gate.ok) return gate.res;

    const url = new URL(req.url);
    const requestId = url.searchParams.get("request_id");

    if (!requestId) {
      return NextResponse.json({ ok: false, error: "Missing request_id" }, { status: 400 });
    }

    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase
      .from("service_request_events")
      .select("id, created_at, event_type, note, from_status, to_status, mail, request_id")
      .eq("request_id", requestId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, data: data ?? [] }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? "Server error" }, { status: 500 });
  }
}
