"use client";

// C:\src\proxineva\app\admin\AdminClient.tsx

import Link from "next/link";
import { useMemo, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export type ServiceRequest = {
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
type Status = (typeof STATUS)[number];

function supabaseBrowser() {
  // côté navigateur, on peut créer un client "anon" pour signOut
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function fmtAge(createdAt: string) {
  const t = new Date(createdAt).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - t);
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `${hours} h`;
  const days = Math.floor(hours / 24);
  return `${days} j`;
}

function safeTrim(s: string) {
  return (s ?? "").trim();
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // fallback
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }
}

export default function AdminClient({ initialRequests }: { initialRequests: ServiceRequest[] }) {
  const [requests, setRequests] = useState<ServiceRequest[]>(initialRequests ?? []);
  const [statusFilter, setStatusFilter] = useState<"ALL" | Status>("ALL");
  const [query, setQuery] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({});

  // ✅ UX export
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1800);
  }

  const filtered = useMemo(() => {
    const q = safeTrim(query).toLowerCase();

    let list = requests;

    if (statusFilter !== "ALL") {
      list = list.filter((r) => r.status === statusFilter);
    }

    if (q) {
      list = list.filter((r) => {
        const hay = [
          r.full_name,
          r.email,
          r.phone ?? "",
          r.description,
          r.category,
          r.zone,
          r.mode,
          r.priority,
          r.status,
          r.internal_notes ?? "",
          r.id,
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }

    // Tri "métier":
    // 1) NEW -> IN_PROGRESS -> DONE
    // 2) EXPRESS avant NORMAL
    // 3) plus récent
    const statusRank: Record<Status, number> = { NEW: 0, IN_PROGRESS: 1, DONE: 2 };
    const priorityRank: Record<"EXPRESS" | "NORMAL", number> = { EXPRESS: 0, NORMAL: 1 };

    return [...list].sort((a, b) => {
      const s = statusRank[a.status] - statusRank[b.status];
      if (s !== 0) return s;

      const p = priorityRank[a.priority] - priorityRank[b.priority];
      if (p !== 0) return p;

      const ta = new Date(a.created_at).getTime();
      const tb = new Date(b.created_at).getTime();
      return tb - ta;
    });
  }, [requests, statusFilter, query]);

  const counts = useMemo(() => {
    const c = { NEW: 0, IN_PROGRESS: 0, DONE: 0, ALL: requests.length, EXPRESS: 0 };
    for (const r of requests) {
      c[r.status] += 1;
      if (r.priority === "EXPRESS") c.EXPRESS += 1;
    }
    return c;
  }, [requests]);

  async function refresh() {
    try {
      const url = new URL("/api/service-requests", window.location.origin);
      if (statusFilter !== "ALL") url.searchParams.set("status", statusFilter);
      url.searchParams.set("limit", "200");

      const res = await fetch(url.toString(), { cache: "no-store" });
      const json = await res.json();

      if (!res.ok || !json?.ok) {
        alert(json?.error ?? "Erreur lors du refresh");
        return;
      }

      setRequests(json.data ?? []);
      showToast("Données rafraîchies ✅");
    } catch (e: any) {
      alert(e?.message ?? "Erreur réseau");
    }
  }

  async function save(id: string, patch: Partial<Pick<ServiceRequest, "status" | "internal_notes">>) {
    setLoadingId(id);
    try {
      const res = await fetch("/api/service-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...patch }),
      });
      const json = await res.json();

      if (!res.ok || !json?.ok) {
        alert(json?.error ?? "Erreur mise à jour");
        return;
      }

      const updated = json.request as { id: string; status?: Status; internal_notes?: string | null };
      setRequests((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status: (updated.status ?? r.status) as Status,
                internal_notes: updated.internal_notes ?? r.internal_notes,
              }
            : r
        )
      );

      showToast("Mis à jour ✅");
    } catch (e: any) {
      alert(e?.message ?? "Erreur réseau");
    } finally {
      setLoadingId(null);
    }
  }

  async function setStatus(id: string, status: Status) {
    await save(id, { status });
  }

  async function saveNoteOnly(id: string) {
    const v = noteDraft[id];
    const val = typeof v === "string" ? v : "";
    await save(id, { internal_notes: val });
  }

  async function logout() {
    const supabase = supabaseBrowser();
    await supabase.auth.signOut();
    window.location.assign("/login");
  }

  // ✅ Export CSV (download) + feedback + anti double-clic
  function exportCsv() {
    if (exporting) return;
    setExporting(true);

    // Téléchargement direct
    window.open("/api/admin/export", "_blank", "noopener,noreferrer");

    showToast("Export lancé ✅");

    // Anti double-clic (2s)
    window.setTimeout(() => setExporting(false), 2000);
  }

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      {/* Toast */}
      {toast ? (
        <div
          style={{
            position: "fixed",
            right: 18,
            bottom: 18,
            background: "#111",
            color: "#fff",
            padding: "10px 14px",
            borderRadius: 12,
            fontWeight: 700,
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            zIndex: 50,
          }}
        >
          {toast}
        </div>
      ) : null}

      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 36, margin: 0 }}>Admin — Demandes</h1>
          <div style={{ marginTop: 6, color: "#444" }}>
            Affichées: <b>{filtered.length}</b> / Total: <b>{counts.ALL}</b>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            <span style={badgeStyle("#eaf2ff", "#1f57c3")}>NEW: {counts.NEW}</span>
            <span style={badgeStyle("#fff6df", "#7a5a00")}>IN_PROGRESS: {counts.IN_PROGRESS}</span>
            <span style={badgeStyle("#eaffe8", "#176b2c")}>DONE: {counts.DONE}</span>
            <span style={badgeStyle("#ffe9e9", "#b00020")}>EXPRESS en haut</span>
          </div>
        </div>

        <div style={{ minWidth: 360 }}>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, alignItems: "center" }}>
            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontWeight: 600 }}>Statut</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                style={selectStyle}
              >
                <option value="ALL">ALL ({counts.ALL})</option>
                <option value="NEW">NEW ({counts.NEW})</option>
                <option value="IN_PROGRESS">IN_PROGRESS ({counts.IN_PROGRESS})</option>
                <option value="DONE">DONE ({counts.DONE})</option>
              </select>
            </label>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 10, justifyContent: "flex-end" }}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher: nom, email, message…"
              style={inputStyle}
            />
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
            <button onClick={exportCsv} style={{ ...btnStyleStrong, opacity: exporting ? 0.6 : 1 }} disabled={exporting}>
              {exporting ? "Export…" : "Exporter CSV"}
            </button>
            <button onClick={refresh} style={btnStyle}>
              Rafraîchir
            </button>
            <button onClick={logout} style={btnStyle}>
              Se déconnecter
            </button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 18, borderTop: "1px solid #eee" }} />

      <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 16 }}>
        {filtered.map((r) => {
          const isExpress = r.priority === "EXPRESS";
          const draft = noteDraft[r.id];
          const noteValue = typeof draft === "string" ? draft : (r.internal_notes ?? "");

          return (
            <div
              key={r.id}
              style={{
                border: `2px solid ${isExpress ? "#ffb4b4" : "#e8e8e8"}`,
                borderRadius: 14,
                padding: 18,
                background: "#fff",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span style={pill(r.status)}>{r.status}</span>
                  {isExpress ? <span style={pill("EXPRESS")}>EXPRESS</span> : null}
                  <b>{fmtAge(r.created_at)}</b>
                  <span style={{ color: "#666" }}>·</span>
                  <span style={{ color: "#333" }}>
                    {r.zone} · {r.category} · {r.mode}
                  </span>
                </div>

                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <button style={btnMini} onClick={() => copyToClipboard(r.email)} title="Copier l'email">
                    Copier email
                  </button>
                  <button style={btnMini} onClick={() => copyToClipboard(r.id)} title="Copier l'ID">
                    Copier ID
                  </button>

                  <Link href={`/admin/requests/${r.id}`} style={{ fontWeight: 700 }}>
                    Ouvrir →
                  </Link>
                </div>
              </div>

              <div style={{ marginTop: 10, fontSize: 18, fontWeight: 700 }}>
                {r.full_name} — <span style={{ fontWeight: 500 }}>{r.email}</span>
              </div>

              <div style={{ marginTop: 6, fontSize: 16 }}>{r.description}</div>

              <div style={{ marginTop: 8, color: "#666", fontSize: 13 }}>ID: {r.id}</div>

              <div style={{ marginTop: 14 }}>
                <div style={{ fontWeight: 700 }}>Note interne (optionnel)</div>
                <textarea
                  value={noteValue}
                  onChange={(e) =>
                    setNoteDraft((prev) => ({
                      ...prev,
                      [r.id]: e.target.value,
                    }))
                  }
                  placeholder="Ex: Assigné à un agent, rappel client, etc."
                  style={textareaStyle}
                />
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
                <button disabled={loadingId === r.id} onClick={() => setStatus(r.id, "NEW")} style={btnStyle}>
                  Mettre NEW
                </button>
                <button
                  disabled={loadingId === r.id}
                  onClick={() => setStatus(r.id, "IN_PROGRESS")}
                  style={btnStyle}
                >
                  Mettre IN_PROGRESS
                </button>
                <button disabled={loadingId === r.id} onClick={() => setStatus(r.id, "DONE")} style={btnStyle}>
                  Mettre DONE
                </button>

                <button disabled={loadingId === r.id} onClick={() => saveNoteOnly(r.id)} style={btnStyleStrong}>
                  Sauver note
                </button>

                {loadingId === r.id ? <span style={{ alignSelf: "center" }}>…</span> : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function badgeStyle(bg: string, color: string) {
  return {
    background: bg,
    color,
    border: `1px solid ${color}33`,
    padding: "3px 10px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 700,
  } as const;
}

function pill(kind: string) {
  const base = {
    padding: "2px 10px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 800,
    border: "1px solid #ddd",
  } as const;

  if (kind === "NEW") return { ...base, background: "#eaf2ff", color: "#1f57c3", borderColor: "#cfe0ff" };
  if (kind === "IN_PROGRESS") return { ...base, background: "#fff6df", color: "#7a5a00", borderColor: "#f0db9a" };
  if (kind === "DONE") return { ...base, background: "#eaffe8", color: "#176b2c", borderColor: "#bfeac8" };
  if (kind === "EXPRESS") return { ...base, background: "#ffe9e9", color: "#b00020", borderColor: "#ffb4b4" };
  return { ...base, background: "#f5f5f5", color: "#333" };
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #dcdcdc",
  outline: "none",
};

const selectStyle: React.CSSProperties = {
  padding: "9px 10px",
  borderRadius: 10,
  border: "1px solid #dcdcdc",
  outline: "none",
};

const textareaStyle: React.CSSProperties = {
  marginTop: 8,
  width: "100%",
  minHeight: 90,
  padding: 12,
  borderRadius: 12,
  border: "1px solid #dcdcdc",
  outline: "none",
  resize: "vertical",
};

const btnStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #cfcfcf",
  background: "#fff",
  cursor: "pointer",
  fontWeight: 700,
};

const btnStyleStrong: React.CSSProperties = {
  ...btnStyle,
  borderColor: "#bfbfbf",
  background: "#f6f6f6",
};

const btnMini: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 12,
  border: "1px solid #d7d7d7",
  background: "#fff",
  cursor: "pointer",
  fontWeight: 700,
};
