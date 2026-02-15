import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const url = new URL(req.url);

  // Supabase renvoie souvent le token dans l'URL.
  // On laisse supabase/ssr gérer l’échange + cookies.
  const next = url.searchParams.get("next") ?? "/";

 const supabase = await createSupabaseServer();


  // Important: échange le code en session + écrit les cookies
  const code = url.searchParams.get("code");
  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
