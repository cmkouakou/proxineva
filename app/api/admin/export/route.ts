import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("service_requests")
    .select("id, created_at, zone, category, mode, priority, full_name, email, phone, description, status, internal_notes")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: "Export error" }, { status: 500 });

  const header = Object.keys(data?.[0] ?? {}).join(",");
  const rows = (data ?? []).map(r =>
    Object.values(r).map(v => {
      const s = v === null || v === undefined ? "" : String(v);
      return `"${s.replaceAll('"', '""')}"`;
    }).join(",")
  );

  const csv = [header, ...rows].join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="service_requests.csv"`,
    },
  });
}
