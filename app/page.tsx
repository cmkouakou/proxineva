import Link from "next/link";
import Image from "next/image";
import styles from "@/styles/home.module.css";
import { CheckCircle2, Shield, Home, Globe, ArrowRight, PlayCircle, BarChart3 } from "lucide-react";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const year = new Date().getFullYear();

  return (
    <main className={styles.page}>
      {/* “Bloc site” centré + fond blanc */}
      <div className={styles.shell}>
        {/* HEADER */}
        <header className={styles.header}>
          <div className="container">
            <div className={styles.headerInner}>
              <div className={styles.brand}>
                <div className={styles.logo} aria-hidden>
                  P
                </div>
                <div>
                  <div className={styles.brandTitle}>PROXINEVA</div>
                  <div className={styles.brandSub}>Assistance & formations — Québec & Côte d’Ivoire</div>
                </div>
              </div>

              <nav className={styles.nav}>
                <Link className="btn btnPrimary" href="/demande">
                  Décrire mon besoin
                </Link>
                <Link className="btn btnOutline" href="/rdv">
                  Prendre un rendez-vous
                </Link>

                {/* Accès rapide : dropdown (survol OU clic/focus) */}
                <div className={styles.quickMenu}>
                  <button className={`btn btnGhost ${styles.quickMenuBtn}`} type="button">
                    Accès rapide <ArrowRight size={16} />
                  </button>

                  <div className={styles.quickMenuPanel} role="menu" aria-label="Accès rapide">
                    <Link className={styles.quickMenuItem} href="/demande">
                      Envoyer une demande <ArrowRight size={16} />
                    </Link>
                    <Link className={styles.quickMenuItem} href="/rdv">
                      Réserver un rendez-vous <ArrowRight size={16} />
                    </Link>
                    <Link className={styles.quickMenuItem} href="/offres">
                      Voir les offres <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>

                <Link className="btn btnGhost" href="/admin">
                  Admin
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* HERO (bannière plus simple, image à droite) */}
        <section className={styles.hero}>
          <div className="container">
            <div className={styles.heroGrid}>
              <div className={styles.heroLeft}>
                <h1 className={styles.h1}>La proximité numérique, nouvelle génération.</h1>
                <p className={styles.lead}>
                  Dépannage PC, sécurité, Office/Excel/PowerPoint, coaching et accompagnement.
                  Une réponse rapide, en ligne ou à domicile selon la zone.
                </p>

                <div className={styles.heroCtas}>
                  <Link className="btn btnPrimary" href="/rdv">
                    Prendre un rendez-vous
                  </Link>
                  <Link className="btn btnOutline" href="/demande">
                    Décrire mon besoin
                  </Link>
                </div>
              </div>

              <div className={styles.heroRight}>
                <div className={styles.heroImageCard} aria-label="Bannière Proxineva">
                  <Image
                    src="/images/hero.png"
                    alt="Assistance numérique Proxineva"
                    width={900}
                    height={520}
                    priority
                    className={styles.heroImg}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BADGES (barre simple) */}
        <section className={styles.badgesBar}>
          <div className="container">
            <div className={styles.badgesRow}>
              <span className={styles.badgePill}>
                <CheckCircle2 size={16} /> Simple & pédagogique
              </span>
              <span className={styles.badgePill}>
                <Shield size={16} /> Sécurité anti-arnaques
              </span>
              <span className={styles.badgePill}>
                <Home size={16} /> À domicile ou en ligne
              </span>
              <span className={styles.badgePill}>
                <Globe size={16} /> Canada & Côte d’Ivoire
              </span>
            </div>
          </div>
        </section>

        {/* ZONES */}
        <section className={`section ${styles.sectionBlock}`}>
          <div className="container">
            <h2 className="h2">Choisissez votre zone</h2>

            <div className={styles.grid2}>
              <ZoneCard
                title="Canada"
                topColor="linear-gradient(90deg, #0b2a4a, #1f6feb)"
                bullets={["Dépannage & Sécurité", "Excel & PowerPoint"]}
                cta={{ href: "/canada", label: "Services Canada", variant: "blue" }}
              />

              <ZoneCard
                title="Côte d’Ivoire"
                topColor="linear-gradient(90deg, #0b6b3f, #1B8A4C)"
                bullets={["Maintenance Informatique", "Support à Distance • Office 365", "Formations"]}
                cta={{ href: "/cote-ivoire", label: "Formations Côte d’Ivoire", variant: "green" }}
              />
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section className={`section ${styles.sectionBlock}`}>
          <div className="container">
            <h2 className="h2">Nos services phares</h2>

            <div className={styles.grid4}>
              <ServiceCard
                title="Dépannage PC"
                desc="Pannes, lenteurs, installation, Wi-Fi."
                img="/images/services/depannage.png"
              />
              <ServiceCard
                title="Sécurité"
                desc="Arnaques, nettoyage, bonnes pratiques."
                img="/images/services/securite.png"
              />
              <ServiceCard
                title="Formation Excel"
                desc="Formules, tableaux, automatisation."
                img="/images/services/excel.png"
              />
              <ServiceCard
                title="PowerPoint"
                desc="Slides pro, storytelling, modèles."
                img="/images/services/powerpoint.png"
              />
            </div>

            <div className={styles.centerCta}>
              <Link className="btn btnPrimary" href="/demande">
                Commencer maintenant
              </Link>
            </div>
          </div>
        </section>

        {/* NOUVEAUTÉS (fond différent, harmonieux) */}
        <section className={styles.nouveautesSection}>
          <div className="container">
            <h2 className={styles.nouvTitle}>Nouveautés</h2>
            <p className={styles.nouvSub}>Deux services pour prévenir, automatiser et mieux décider.</p>

            <div className={styles.grid2}>
              <div className={`card ${styles.nouvCard}`}>
                <div className={styles.nouvHead}>
                  <div className={styles.nouvIcon}>
                    <PlayCircle size={18} />
                  </div>
                  <div className={styles.nouvName}>Capsules vidéo (prévention & astuces)</div>
                </div>

                <p className={styles.nouvText}>
                  Accès à des capsules courtes : prévention cybersécurité, bonnes pratiques,
                  astuces informatiques inédites. Idéal pour apprendre vite et réduire les risques.
                </p>

                <Link className="btn btnOutline" href="/capsules">
                  Accéder aux capsules
                </Link>
              </div>

              <div className={`card ${styles.nouvCard}`}>
                <div className={styles.nouvHead}>
                  <div className={styles.nouvIcon}>
                    <BarChart3 size={18} />
                  </div>
                  <div className={styles.nouvName}>Informatique décisionnelle</div>
                </div>

                <p className={styles.nouvText}>
                  Diagnostic des procédures, collecte/structuration de données, tableaux de bord décisionnels,
                  automatisation de tâches et aide à la décision.
                </p>

                <Link className="btn btnPrimary" href="/decisionnel">
                  Découvrir le service
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* OFFRES */}
        <section className={`section ${styles.sectionBlock}`}>
          <div className="container">
            <h2 className="h2">Nos Offres</h2>

            <div className={styles.grid3}>
              <OfferCard
                title="Assistance Express"
                bullets={["Décrivez votre besoin", "Réponse rapide", "En ligne ou à domicile"]}
                cta={{ href: "/demande", label: "Demander" }}
              />
              <OfferCard
                title="Forfait Sérénité Sécurité"
                bullets={["Diagnostic sécurité", "Nettoyage / conseils", "Protection anti-arnaques"]}
                cta={{ href: "/demande", label: "Demander" }}
              />
              <OfferCard
                title="Coaching Excel / PPT"
                bullets={["On vous dépanne ou on vous forme", "Support pas à pas", "Résultat concret"]}
                cta={{ href: "/rdv", label: "Réserver" }}
              />
            </div>
          </div>
        </section>

        {/* TEMOIGNAGES */}
        <section className={`section ${styles.sectionBlock}`}>
          <div className="container">
            <h2 className="h2">Ils nous font confiance</h2>

            <div className={styles.grid3}>
              <Testimonial text="Service rapide et rassurant." />
              <Testimonial text="Grâce à vous, j’ai enfin compris Excel." />
              <Testimonial text="Très clair, très patient, et efficace." />
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className={styles.footer}>
          <div className="container">
            <div className={styles.footerInner}>
              <div>
                <div style={{ fontWeight: 900 }}>PROXINEVA</div>
                <div style={{ opacity: 0.85, marginTop: 4, fontSize: 13 }}>Québec • Côte d’Ivoire</div>
              </div>

              <div className={styles.footerLinks}>
                <Link href="/demande">Demande</Link>
                <Link href="/rdv">Rendez-vous</Link>
                <Link href="/offres">Offres</Link>
                <Link href="/admin">Admin</Link>
              </div>
            </div>

            <div className={styles.copy}>© {year} Proxineva — MVP</div>
          </div>
        </footer>
      </div>
    </main>
  );
}

/* ---------- Petits composants ---------- */

function ZoneCard({
  title,
  topColor,
  bullets,
  cta,
}: {
  title: string;
  topColor: string;
  bullets: string[];
  cta: { href: string; label: string; variant: "blue" | "green" };
}) {
  const btnClass = cta.variant === "blue" ? "btn btnOutline" : "btn btnPrimary";
  const btnStyle =
    cta.variant === "blue"
      ? { background: "var(--blue)", borderColor: "var(--blue)", color: "#fff" }
      : undefined;

  return (
    <div className={`card ${styles.zoneCard}`}>
      <div className={styles.zoneTop} style={{ background: topColor }}>
        <span>{title}</span>
        <span style={{ opacity: 0.9 }}>●</span>
      </div>
      <div className={styles.zoneBody}>
        <ul className={styles.zoneList}>
          {bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        <div className={styles.zoneCtaRow}>
          <Link className={btnClass} style={btnStyle as any} href={cta.href}>
            {cta.label}
          </Link>
        </div>
      </div>
    </div>
  );
}

function ServiceCard({ title, desc, img }: { title: string; desc: string; img: string }) {
  return (
    <div className={styles.serviceCard}>
      <div className={styles.serviceImgWrap}>
        <Image src={img} alt={title} width={160} height={110} className={styles.serviceImg} />
      </div>
      <div className={styles.serviceTitle}>{title}</div>
      <div className={styles.serviceDesc}>{desc}</div>
    </div>
  );
}

function OfferCard({
  title,
  bullets,
  cta,
}: {
  title: string;
  bullets: string[];
  cta: { href: string; label: string };
}) {
  return (
    <div className={`card ${styles.offerCard}`}>
      <div className={styles.offerTitle}>{title}</div>
      <ul className={styles.offerList}>
        {bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
      <Link className="btn btnOutline" href={cta.href}>
        {cta.label}
      </Link>
    </div>
  );
}

function Testimonial({ text }: { text: string }) {
  return (
    <div className={`card ${styles.testCard}`}>
      <div className={styles.stars}>★★★★★</div>
      “{text}”
    </div>
  );
}
