"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

function supabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [ready, setReady] = useState(false);

  // 🔐 Important: sur une page recovery, Supabase peut mettre la session via le hash.
  // On laisse le client Supabase “absorber” l’URL et on vérifie qu’il y a une session.
  useEffect(() => {
    (async () => {
      const supabase = supabaseBrowser();
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        setMsg("Lien invalide ou expiré. Recommence 'Mot de passe oublié'.");
        setReady(true);
        return;
      }

      setReady(true);
    })();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready) return;

    setMsg(null);

    if (password.length < 8) return setMsg("Mot de passe trop court (min 8).");
    if (password !== password2) return setMsg("Les mots de passe ne correspondent pas.");

    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) return setMsg(error.message);

    setOk(true);
    setMsg("Mot de passe mis à jour. Tu peux te reconnecter.");
    setTimeout(() => window.location.assign("/login"), 800);
  }

  return (
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold">Nouveau mot de passe</h1>

      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <input
          className="w-full border rounded-md p-2"
          placeholder="Nouveau mot de passe"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={ok || !ready}
        />

        <input
          className="w-full border rounded-md p-2"
          placeholder="Confirmer le mot de passe"
          type="password"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          disabled={ok || !ready}
        />

        <button className="border rounded-md px-4 py-2" type="submit" disabled={ok || !ready}>
          Mettre à jour
        </button>

        {msg && <p className={`text-sm ${ok ? "text-green-700" : "text-red-600"}`}>{msg}</p>}
      </form>
    </main>
  );
}
