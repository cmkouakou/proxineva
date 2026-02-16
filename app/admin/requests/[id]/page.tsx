// C:\src\proxineva\app\admin\requests\[id]\page.tsx

import Link from "next/link";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import RequestDetailClient from "@/components/Admin/RequestDetailClient";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  const supabase = createSupabaseAdmin();
  const { data: request, error } = await supabase
    .from("service_requests")
    .select(
      "id, created_at, zone, category, mode, priority, full_name, email, phone, description, status, internal_notes"
    )
    .eq("id", id)
    .single();

  if (error || !request) {
    return (
      <div style={{ padding: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Demande introuvable</h1>
        <p style={{ marginTop: 8, opacity: 0.85 }}>
          {error?.message ?? "Impossible de charger la demande."}
        </p>
        <div style={{ marginTop: 16 }}>
          <Link href="/admin" style={{ textDecoration: "underline" }}>
            ← Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 980, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>Détail — Demande</h1>
          <p style={{ marginTop: 6, opacity: 0.8 }}>
            ID: <code>{request.id}</code>
          </p>
        </div>

        <Link href="/admin" style={{ textDecoration: "underline", alignSelf: "center" }}>
          ← Retour
        </Link>
      </div>

      <div style={{ marginTop: 18 }}>
        <RequestDetailClient request={request} />
      </div>
    </div>
  );
}
