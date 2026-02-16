// C:\src\proxineva\app\admin\AdminClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";

type ServiceRequest = {
  id: string;
  created_at: string;
  zone: "CANADA" | "CIV";
  category: string;
  mode: "DOMICILE" | "EN_LIGNE";
  priority: "EXPRESS" | "NORMAL";
  full_name: string;
  email: string;
  phone: string | null;
  description: string;
  status: "NEW" | "IN_PROGRESS" | "DONE";
  internal_notes: string | null;
};

const STATUS = ["NEW", "IN_PROGRESS", "DONE"] as const;

function formatAge(created_at: string) {
  const ts = Date.parse(created_at);
  if (Number.isNaN(ts)) return created_at;
  const diff = Date.now() - ts;
  const s = Math.floor(diff / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d} j`;
  if (h > 0) return `${h} h`;
  if (m > 0) return `${m} min`;
  return `${s} s`;
}

export default function AdminClient() {
  const [rows, setRows] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // draft des notes par demande
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});

  const total = rows.length;

  const supabase = useMemo(() => {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/service-requests?limit=200", { cache: "no-store" });
      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.ok) {
        throw new Error(json?.error ?? `Erreur HTTP ${res.status}`);
      }

      const data: ServiceRequest[] = json.data ?? [];
      setRows(data);

      // init drafts
      const init: Record<string, string> = {};
      for (const r of data) init[r.id] = r.internal_notes ?? "";
      setNotesDraft(init);
    } catch (e: any) {
      setError(e?.message ?? "Erreur inconnue");
      setRows([]);
      setNotesDraft({});
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function patch(id: string, body: any) {
    setLoadingId(id);
    try {
      const res = await fetch("/api/service-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...body }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error ?? `Erreur HTTP ${res.status}`);
      }

      // refresh local row (sans recharger toute la page)
      setRows((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r;
          return {
            ...r,
            status: body.status ?? r.status,
            internal_notes: body.internal_notes ?? r.internal_notes,
          };
        })
      );
    } catch (e: any) {
      alert(`Échec mise à jour: ${e?.message ?? "Erreur inconnue"}`);
    } finally {
      setLoadingId(null);
    }
  }

  async function logout() {
    try {
      await supabase.auth.signOut();
      window.location.assign("/login");
    } catch {
      window.location.assign("/login");
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>Admin — Demandes</h1>
          <p style={{ marginTop: 8, opacity: 0.85 }}>
            {loading ? "Chargement…" : error ? `Erreur: ${error}` : `Total: ${total}`}
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            onClick={load}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #ccc",
              cursor: "pointer",
              background: "white",
            }}
          >
            Rafraîchir
          </button>

          <button
            onClick={logout}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #ccc",
              cursor: "pointer",
              background: "white",
            }}
          >
            Se déconnecter
          </button>
        </div>
      </div>

      <div style={{ marginTop: 18, display: "grid", gap: 14 }}>
        {rows.map((r) => {
          const age = formatAge(r.created_at);
          const busy = loadingId === r.id;

          return (
            <div
              key={r.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 14,
                padding: 14,
                background: "white",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div style={{ fontWeight: 800 }}>
                  {r.status}{" "}
                  <span style={{ fontWeight: 400, opacity: 0.8 }}>
                    {age} · {r.zone} · {r.category} · {r.mode} · {r.priority}
                  </span>
                </div>

                <Link href={`/admin/requests/${r.id}`} style={{ textDecoration: "underline" }}>
                  Ouvrir →
                </Link>
              </div>

              <div style={{ marginTop: 8, fontWeight: 700 }}>
                {r.full_name} — {r.email}
              </div>

              <div style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>{r.description}</div>

              <div style={{ marginTop: 10, opacity: 0.75, fontSize: 12 }}>ID: {r.id}</div>

              <div style={{ marginTop: 12 }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Note interne (optionnel)</div>
                <textarea
                  value={notesDraft[r.id] ?? ""}
                  onChange={(e) => setNotesDraft((prev) => ({ ...prev, [r.id]: e.target.value }))}
                  rows={3}
                  style={{
                    width: "100%",
                    padding: 10,
                    borderRadius: 12,
                    border: "1px solid #ddd",
                  }}
                  disabled={busy}
                />
              </div>

              <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                {STATUS.map((s) => (
                  <button
                    key={s}
                    disabled={busy}
                    onClick={() => patch(r.id, { status: s })}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "1px solid #ccc",
                      cursor: busy ? "not-allowed" : "pointer",
                      background: "white",
                    }}
                  >
                    Mettre {s}
                  </button>
                ))}

                <button
                  disabled={busy}
                  onClick={() => patch(r.id, { internal_notes: notesDraft[r.id] ?? "" })}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid #ccc",
                    cursor: busy ? "not-allowed" : "pointer",
                    background: "white",
                  }}
                >
                  Sauver note seulement
                </button>
              </div>
            </div>
          );
        })}

        {!loading && !error && rows.length === 0 && (
          <div style={{ padding: 18, border: "1px dashed #ccc", borderRadius: 14 }}>
            Aucune demande.
          </div>
        )}
      </div>
    </div>
  );
}
