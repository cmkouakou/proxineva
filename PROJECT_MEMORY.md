# PROJECT MEMORY — PROXINEVA

## 🎯 Vision
Proxineva : plateforme de proximité numérique (Canada & Côte d’Ivoire)
- Dépannage informatique
- Formation Excel / PowerPoint
- Sécurité anti-arnaques
- Support à distance ou à domicile

Objectif futur : base SaaS / gestion structurée des demandes.

---

## 🧱 Stack technique

- Next.js (App Router)
- Supabase (Postgres + Auth + Storage)
- Resend (emails)
- Vercel (hébergement)

---

## 📁 Structure principale

Pages publiques :
- `/`
- `/canada`
- `/cote-ivoire`
- `/offres`
- `/demande`
- `/rdv`

Admin :
- `/admin/login`
- `/admin/demandes`

API :
- POST `/api/service-requests`
- PATCH `/api/admin/requests/[id]`
- GET `/api/admin/export`

---

## 🗄 Base de données

Table : `service_requests`

Champs :
- id (uuid)
- created_at
- zone (CANADA | CIV)
- category (DEPANNAGE | EXCEL | ...)
- mode (DOMICILE | EN_LIGNE)
- priority (NORMAL | EXPRESS)
- full_name
- email
- phone
- description
- status (NEW | IN_PROGRESS | DONE)
- internal_notes

---

## 🔐 Sécurité (MVP)

- Validation serveur Zod
- Rate limiting API
- Protection /admin via middleware
- Service role key uniquement côté serveur

---

## 🚀 Roadmap

Phase 1 :
- Landing
- Formulaire connecté DB
- Admin minimal

Phase 2 :
- Emails automatiques
- Calendrier RDV
- Export CSV

Phase 3 :
- RLS avancé
- Logs
- RBAC
- Automatisation
