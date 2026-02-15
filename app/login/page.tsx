// C:\src\proxineva\app\login\page.tsx
"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useSearchParams } from "next/navigation";

function supabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default function LoginPage() {
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [msg, setMsg] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setInfo(null);
    setLoading(true);

    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) return setMsg(error.message);

    const next = searchParams.get("next") ?? "/admin";
    window.location.assign(next);
  }

  async function onForgotPassword() {
    setMsg(null);
    setInfo(null);

    if (!email) return setMsg("Entre ton email d’abord.");

    setLoading(true);

    // reset: redirige direct vers /reset-password
    const redirectTo = `${window.location.origin}/reset-password`;

    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

    setLoading(false);
    if (error) return setMsg(error.message);

    setInfo("Email envoyé. Vérifie ta boîte de réception (et indésirables).");
  }

  return (
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold">Connexion Admin</h1>

      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <input
          className="w-full border rounded-md p-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />

        <input
          className="w-full border rounded-md p-2"
          placeholder="Mot de passe"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        <div className="flex items-center gap-3">
          <button className="border rounded-md px-4 py-2" type="submit" disabled={loading}>
            {loading ? "..." : "Se connecter"}
          </button>

          <button
            type="button"
            className="text-sm underline"
            onClick={onForgotPassword}
            disabled={loading}
          >
            Mot de passe oublié
          </button>
        </div>

        {msg && <p className="text-sm text-red-600">{msg}</p>}
        {info && <p className="text-sm text-green-700">{info}</p>}
      </form>
    </main>
  );
}
