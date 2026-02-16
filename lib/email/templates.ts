import { resend, NOTIFY_EMAIL, FROM_EMAIL } from "@/lib/email/resend";

const SITE_URL =
  (process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.trim()) ||
  "http://localhost:3000";

type Req = {
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
};

export async function sendClientConfirmation(r: Req) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to: r.email,
    subject: "Proxineva — Demande reçue",
    text: `Bonjour ${r.full_name},

Nous avons bien reçu ta demande (${r.zone}).
Résumé:
- Catégorie: ${r.category}
- Canal: ${r.mode}
- Priorité: ${r.priority}

Message:
${r.description}

Référence: ${r.id}

Nous revenons vers toi rapidement.
— Proxineva`,
  });
}

export async function sendAdminNotification(r: Req) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to: NOTIFY_EMAIL,
    subject: `Nouvelle demande — ${r.zone} / ${r.category} / ${r.priority}`,
    text: `Nouvelle demande:
- Nom: ${r.full_name}
- Email: ${r.email}
- Téléphone: ${r.phone ?? "-"}
- Zone: ${r.zone}
- Catégorie: ${r.category}
- Canal: ${r.mode}
- Priorité: ${r.priority}

Message:
${r.description}

ID: ${r.id}
Admin: ${SITE_URL}/admin/requests/${r.id}
`,
  });
}
