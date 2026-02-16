// C:\src\proxineva\components\Admin\RequestDetailClient.tsx
"use client";

import { useMemo, useState } from "react";

type RequestRow = {
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

export default function RequestDetailClient({ request }: { request: RequestRow }) {
  const [status, setStatus] = useState<RequestRow["status"]>(request.status);
  const [notes, setNotes] = useState<string>(request.internal_notes ?? "");
  const [loading, setLoading] = useState(false);

  const createdAt = useMemo(() => {
    try {
      return new Date(request.created_at).toLocaleString();
    } catch {
      return request.created_at;
    }
  }, [request.created_at]);

  async function patch(body: any) {
    setLoading(true);
    try {
      const res = await fetch("/api/service-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.ok) {
        const msg = json?.error ?? `Erreur HTTP ${res.status}`;
        alert(`Échec mise à jour: ${msg}`);
        return;
      }

      alert("Mise à jour réussie ✅");
    } catch (e: any) {
      alert(`Erreur réseau: ${e?.message ?? "inconnue"}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
      <div style={{ display: "grid", gap: 8 }}>
        <div>
          <strong>Créée :</strong> {createdAt}
        </div>
        <div>
          <strong>Zone :</strong> {request.zone} · <strong>Catégorie :</strong>{" "}
          {request.category} · <strong>Canal :</strong> {request.mode} ·{" "}
          <strong>Priorité :</strong> {request.priority}
        </div>
        <div>
          <strong>Client :</strong> {request.full_name} — {request.email}{" "}
          {request.phone ? `— ${request.phone}` : ""}
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <strong>Message :</strong>
        <div
          style={{
            marginTop: 6,
            whiteSpace: "pre-wrap",
            padding: 12,
            borderRadius: 10,
            border: "1px solid #eee",
            background: "#fafafa",
          }}
        >
          {request.description}
        </div>
      </div>

      <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
        <div>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
            Statut
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            disabled={loading}
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
          >
            {STATUS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <button
            onClick={() => patch({ id: request.id, status })}
            disabled={loading}
            style={{
              marginLeft: 10,
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #ccc",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            Mettre à jour statut
          </button>
        </div>

        <div>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
            Note interne
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={loading}
            rows={4}
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 10,
              border: "1px solid #ddd",
            }}
          />

          <button
            onClick={() => patch({ id: request.id, internal_notes: notes })}
            disabled={loading}
            style={{
              marginTop: 8,
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #ccc",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            Sauver note seulement
          </button>
        </div>
      </div>
    </div>
  );
}
