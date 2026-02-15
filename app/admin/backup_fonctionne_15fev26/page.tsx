// C:\src\proxineva\app\admin\page.tsx
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import AdminClient from "./AdminClient";

export type ServiceRequest = {
  id: string;
  created_at: string;
  zone: string;
  category: string;
  mode: string;
  priority: string;
  full_name: string;
  email: string;
  phone: string | null;
  description: string;
  status: string;
  internal_notes: string | null;
};

function isAllowedEmail(email: string | null | undefined) {
  const allowed = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  if (allowed.length === 0) return true;
  return !!email && allowed.includes(email.toLowerCase());
}

async function getRequestsFromDb(): Promise<ServiceRequest[]> {
  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("service_requests")
    .select(
      "id, created_at, zone, category, mode, priority, full_name, email, phone, description, status, internal_notes"
    )
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as ServiceRequest[];
}

export default async function AdminPage() {
  const supabase = await createSupabaseServer();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user || !isAllowedEmail(user.email)) {
    redirect("/login?next=/admin");
  }

  const requests = await getRequestsFromDb();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Admin — Demandes</h1>
      <p className="mt-2 text-gray-600">Total: {requests.length}</p>

      <AdminClient initialRequests={requests} />
    </main>
  );
}
