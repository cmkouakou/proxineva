import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY!);
export const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL!; // l’email qui reçoit les notifs
export const FROM_EMAIL = process.env.FROM_EMAIL!;     // ex: "Proxineva <noreply@tondomaine>"
