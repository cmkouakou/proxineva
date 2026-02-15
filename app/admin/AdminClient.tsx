// C:\src\proxineva\app\admin\AdminClient.tsx
"use client";

import { useMemo, useState } from "react";
import type { ServiceRequest } from "./page";
import { createBrowserClient } from "@supabase/ssr";

const STATUS = ["NEW", "IN_PROGRESS", "DONE"] as const;

type PatchBody = {
  id: string;
  status?: (typeof STATUS)[number];
  internal_notes?: string | null;
};

function supabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default function AdminClient({
  initialRequests,
}: {
  initialRequests: ServiceRequest[];
}) {
  const [requests, setRequests] = useState<ServiceRequest[]>(initialRequests);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({});

  const total = useMemo(() => requests.length, [requests.length]);

  async function logout() {
    const supabase = supabaseBrowser();
    await supabase.auth.signOut();
    window.location.assign("/login");
  }

  async function refresh() {
    // ⚠️ /api/service-requests est protégé, mais ici on est admin connecté → OK
    const res = await fetch("/api/service-requests", { cache: "no-store" });
    const json = await res.json();
    setRequests(json.data ?? []);
  }

  async function patchRequest(body: PatchBody) {
    setLoadingId(body.id);
    try {
      const res = await fetch("/api/service-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (!res.ok) {
        alert(json?.error ?? "Erreur PATCH");
        return;
      }

      await refresh();
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="mt-6">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm text-gray-600">Total: {total}</div>

        <button onClick={logout} className="border rounded-md px-3 py-2 text-sm">
          Se déconnecter
        </button>
      </div>

      <div className="space-y-3">
        {requests.map((r) => {
          const isLoading = loadingId === r.id;

          return (
            <div key={r.id} className="rounded-xl border p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold">{r.status}</span>
                <span className="text-sm text-gray-500">
                  {new Date(r.created_at).toLocaleString()}
                </span>
                <span className="text-sm">• {r.zone}</span>
                <span className="text-sm">• {r.category}</span>
                <span className="text-sm">• {r.mode}</span>
                <span className="text-sm">• {r.priority}</span>
              </div>

              <div className="mt-2 font-medium">
                {r.full_name} — {r.email}
              </div>

              <p className="mt-2 text-gray-700">{r.description}</p>

              <div className="mt-3">
                <label className="block text-xs text-gray-500 mb-1">
                  Note interne (optionnel)
                </label>
                <textarea
                  className="w-full rounded-lg border p-2 text-sm"
                  rows={2}
                  placeholder="Ex: Assigné à un agent, rappel client, etc."
                  value={noteDraft[r.id] ?? r.internal_notes ?? ""}
                  onChange={(e) =>
                    setNoteDraft((prev) => ({ ...prev, [r.id]: e.target.value }))
                  }
                />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  className="rounded-lg border px-3 py-1 text-sm"
                  disabled={isLoading}
                  onClick={() =>
                    patchRequest({
                      id: r.id,
                      status: "NEW",
                      internal_notes: noteDraft[r.id] ?? r.internal_notes ?? null,
                    })
                  }
                >
                  Mettre NEW
                </button>

                <button
                  className="rounded-lg border px-3 py-1 text-sm"
                  disabled={isLoading}
                  onClick={() =>
                    patchRequest({
                      id: r.id,
                      status: "IN_PROGRESS",
                      internal_notes: noteDraft[r.id] ?? r.internal_notes ?? null,
                    })
                  }
                >
                  Mettre IN_PROGRESS
                </button>

                <button
                  className="rounded-lg border px-3 py-1 text-sm"
                  disabled={isLoading}
                  onClick={() =>
                    patchRequest({
                      id: r.id,
                      status: "DONE",
                      internal_notes: noteDraft[r.id] ?? r.internal_notes ?? null,
                    })
                  }
                >
                  Mettre DONE
                </button>

                <button
                  className="rounded-lg border px-3 py-1 text-sm"
                  disabled={isLoading}
                  onClick={() =>
                    patchRequest({
                      id: r.id,
                      internal_notes: noteDraft[r.id] ?? "",
                    })
                  }
                >
                  Sauver note seulement
                </button>

                {isLoading && (
                  <span className="text-sm text-gray-500">Mise à jour…</span>
                )}
              </div>

              <div className="mt-2 text-xs text-gray-400">ID: {r.id}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
