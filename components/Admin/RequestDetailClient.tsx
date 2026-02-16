// C:\src\proxineva\components\Admin\RequestDetailClient.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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
  internal_notes: string | null; // NOTE COURANTE (summary)
};

type EventRow = {
  id: string;
  request_id: string;
  created_at: string;
  actor_email: string | null;
  event_type: "NOTE" | "STATUS_CHANGE" | "SUMMARY_UPDATE" | string;
  note: string | null;
  from_status: string | null;
  to_status: string | null;
};

const STATUS = ["NEW", "IN_PROGRESS", "DONE"] as const;

function fmtDate(v: string) {
  try {
    return new Date(v).toLocaleString();
  } catch {
    return v;
  }
}

export default function RequestDetailClient({
  request,
  events,
}: {
  request: RequestRow;
  events: EventRow[];
}) {
  const router = useRouter();

  const [status, setStatus] = useState<RequestRow["status"]>(request.status);

  // Note courante (summary) => reste affichée après save
  const [summary, setSummary] = useState<string>(request.internal_notes ?? "");

  /**
   * Champ "Ajouter une note"
   * UX souhaitée :
   * - Au clic => vide le champ pour saisir une nouvelle note
   * - Si on quitte sans rien écrire => on restaure le contenu affiché
   * - Après sauvegarde => on vide le champ + refresh
   *
   * Ici, on utilise:
   * - newNote: valeur affichée dans le textarea
   * - originalNewNote: valeur à restaurer si l'utilisateur n'écrit rien
   * - hasEditedNewNote: permet de savoir si on a déjà "touché" au champ
   */
  const lastHistoryNote = useMemo(() => {
    const last = events.find((e) => e.event_type === "NOTE" && (e.note ?? "").trim().length > 0);
    return last?.note ?? "";
  }, [events]);

  // Au chargement: on peut afficher la dernière note historique comme "info".
  // Si tu préfères que ce soit vide dès le départ, remplace lastHistoryNote par "".
  const [newNote, setNewNote] = useState<string>(lastHistoryNote);
  const [originalNewNote, setOriginalNewNote] = useState<string>(lastHistoryNote);
  const [hasEditedNewNote, setHasEditedNewNote] = useState(false);

  const [loading, setLoading] = useState(false);

  const createdAt = useMemo(() => fmtDate(request.created_at), [request.created_at]);

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
        return false;
      }

      return true;
    } catch (e: any) {
      alert(`Erreur réseau: ${e?.message ?? "inconnue"}`);
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function saveStatus() {
    const ok = await patch({ id: request.id, status });
    if (ok) {
      alert("Statut mis à jour ✅");
      router.refresh();
    }
  }

  async function saveSummary() {
    const ok = await patch({ id: request.id, internal_notes: summary });
    if (ok) {
      alert("Note courante mise à jour ✅");
      router.refresh();
    }
  }

  async function addHistoryNote() {
    const text = newNote.trim();
    if (!text) {
      alert("Écris une note avant de sauvegarder.");
      return;
    }

    const ok = await patch({ id: request.id, add_note: text });
    if (ok) {
      alert("Note ajoutée à l'historique ✅");

      // ✅ Après sauvegarde:
      // - on vide le champ (prêt pour une prochaine note)
      // - on met l'original à vide aussi (sinon blur pourrait restaurer)
      setNewNote("");
      setOriginalNewNote("");
      setHasEditedNewNote(false);

      // ✅ recharge l’historique + lastHistoryNote
      router.refresh();
    }
  }

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
      <div style={{ display: "grid", gap: 8 }}>
        <div>
          <strong>Créée :</strong> {createdAt}
        </div>
        <div>
          <strong>Zone :</strong> {request.zone} · <strong>Catégorie :</strong> {request.category} ·{" "}
          <strong>Canal :</strong> {request.mode} · <strong>Priorité :</strong> {request.priority}
        </div>
        <div>
          <strong>Client :</strong> {request.full_name} — {request.email} {request.phone ? `— ${request.phone}` : ""}
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

      <div style={{ marginTop: 16, display: "grid", gap: 14 }}>
        {/* STATUT */}
        <div>
          <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>Statut</label>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
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
              onClick={saveStatus}
              disabled={loading}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #ccc",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              Mettre à jour statut
            </button>
          </div>
        </div>

        {/* NOTE COURANTE (SUMMARY) */}
        <div>
          <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>
            Note courante (résumé)
          </label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            disabled={loading}
            rows={4}
            placeholder="Résumé actuel : ce qui est en cours / prochaine étape…"
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 10,
              border: "1px solid #ddd",
            }}
          />
          <button
            onClick={saveSummary}
            disabled={loading}
            style={{
              marginTop: 8,
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #ccc",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            Sauver note courante
          </button>
        </div>

        {/* AJOUTER UNE NOTE (HISTORIQUE) */}
        <div>
          <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>
            Ajouter une note (historique)
          </label>

          <textarea
            value={newNote}
            onFocus={() => {
              // ✅ au clic => on vide le champ pour saisir une nouvelle note
              // mais seulement si on n'a pas déjà commencé à éditer
              if (!hasEditedNewNote) {
                setNewNote("");
              }
            }}
            onChange={(e) => {
              setHasEditedNewNote(true);
              setNewNote(e.target.value);
            }}
            onBlur={() => {
              // ✅ si l'utilisateur sort sans rien écrire => on restaure ce qui était affiché
              if (!newNote.trim()) {
                setNewNote(originalNewNote);
                setHasEditedNewNote(false);
              }
            }}
            disabled={loading}
            rows={3}
            placeholder="Nouvelle action / info / échange…"
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 10,
              border: "1px solid #ddd",
            }}
          />

          <button
            onClick={addHistoryNote}
            disabled={loading}
            style={{
              marginTop: 8,
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #ccc",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            Ajouter à l’historique
          </button>
        </div>
      </div>

      {/* HISTORIQUE */}
      <div style={{ marginTop: 22 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800 }}>Historique</h2>
        <p style={{ marginTop: 6, opacity: 0.8 }}>Notes et changements (le plus récent en haut).</p>

        <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
          {events.length === 0 ? (
            <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 12, background: "#fafafa" }}>
              Aucun événement.
            </div>
          ) : (
            events.map((ev) => (
              <div key={ev.id} style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ fontWeight: 800 }}>{ev.event_type}</span>
                  <span style={{ opacity: 0.75 }}>{fmtDate(ev.created_at)}</span>
                  <span style={{ opacity: 0.75 }}>{ev.actor_email ? `par ${ev.actor_email}` : ""}</span>
                </div>

                {ev.event_type === "STATUS_CHANGE" ? (
                  <div style={{ marginTop: 8 }}>
                    <strong>Statut :</strong> {ev.from_status ?? "?"} → {ev.to_status ?? "?"}
                  </div>
                ) : (
                  <div style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>{ev.note ?? ""}</div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
