import logo from "@/assets/logo.jpeg";
import { useSettings } from "@/context/SettingsContext";
import { Phone, Mail, Clock, MapPin, ArrowUp, ShieldCheck } from "lucide-react";
import { SiTiktok, SiSnapchat, SiInstagram } from "react-icons/si";

const Footer = () => {
  const { settings } = useSettings();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative border-t border-white/[0.08] bg-card/80 backdrop-blur-2xl pt-20 pb-12 px-4 md:px-12 lg:px-16 overflow-hidden">
      {/* Decorative top ambient bar */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-24 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
          {/* Brand & Mission */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="relative group">
                <img 
                  src={logo} 
                  alt="ChopTaLoc" 
                  className="h-11 w-11 object-cover rounded-xl shadow-lg ring-1 ring-white/10 group-hover:ring-primary/40 transition-all" 
                />
              </div>
              <div>
                <span className="font-black text-2xl tracking-tighter italic text-foreground block leading-none">
                  CHOPTALOC
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                  Location Premium
                </span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Votre partenaire de confiance pour la location de véhicules premium et utilitaires à Mantes-la-Jolie et ses environs.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/50 border border-border/50 text-xs text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Flotte entretenue et assurée tous risques</span>
            </div>
          </div>

          {/* Opening Hours & Socials */}
          <div className="space-y-6">
            <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-primary">
              Horaires d'ouverture
            </h3>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30 border border-border/30">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-foreground">Lundi - Vendredi</p>
                  <p className="text-muted-foreground mt-0.5">{settings.opening_hours_week}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30 border border-border/30">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-foreground">Week-end & Fériés</p>
                  <p className="text-muted-foreground mt-0.5">{settings.opening_hours_weekend}</p>
                </div>
              </div>
            </div>

            {/* Socials */}
            <div className="pt-2">
              <h4 className="font-bold text-xs uppercase tracking-[0.15em] text-muted-foreground mb-3">
                Nos réseaux sociaux
              </h4>
              <div className="flex flex-wrap items-center gap-2.5">
                <a
                  href="https://www.tiktok.com/@choptaloc.idf"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/50 border border-border/40 hover:border-primary/40 hover:text-primary transition-all duration-300 text-xs font-semibold"
                >
                  <SiTiktok className="w-3.5 h-3.5 text-primary" />
                  <span>choptaloc.idf</span>
                </a>

                <a
                  href="https://www.snapchat.com/add/choptaloc.idf"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/50 border border-border/40 hover:border-primary/40 hover:text-primary transition-all duration-300 text-xs font-semibold"
                >
                  <SiSnapchat className="w-3.5 h-3.5 text-yellow-400" />
                  <span>choptaloc.idf</span>
                </a>

                <a
                  href="https://www.instagram.com/choptaloc.idf"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/50 border border-border/40 hover:border-primary/40 hover:text-primary transition-all duration-300 text-xs font-semibold"
                >
                  <SiInstagram className="w-3.5 h-3.5 text-pink-500" />
                  <span>choptaloc.idf</span>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-primary">
              Contactez-nous
            </h3>

            <div className="space-y-3">
              <a
                href={settings.company_phone ? `tel:${settings.company_phone}` : "tel:+33123456789"}
                className="flex items-center gap-3.5 p-3 rounded-xl bg-secondary/30 border border-border/30 hover:border-primary/40 hover:bg-secondary/50 transition-all duration-300 group"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Ligne directe</p>
                  <p className="font-bold text-foreground group-hover:text-primary transition-colors">
                    {settings.company_phone || "Non renseigné"}
                  </p>
                </div>
              </a>

              <a
                href={`mailto:${settings.company_email || "contact@choptaloc.com"}`}
                className="flex items-center gap-3.5 p-3 rounded-xl bg-secondary/30 border border-border/30 hover:border-primary/40 hover:bg-secondary/50 transition-all duration-300 group"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="text-xs min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Messagerie</p>
                  <p className="font-bold text-foreground truncate group-hover:text-primary transition-colors">
                    {settings.company_email || "contact@choptaloc.com"}
                  </p>
                </div>
              </a>

              <div className="flex items-center gap-3.5 p-3 rounded-xl bg-secondary/30 border border-border/30">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Siège</p>
                  <p className="font-medium text-muted-foreground">
                    {settings.company_address || "Mantes-la-Jolie, France"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Sub-Footer */}
        <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2">
            <span>© 2026 {settings.company_name}. Tous droits réservés.</span>
            <span className="text-foreground/70 font-medium">Design par Quentin OTT</span>
            {settings.company_siret && (
              <span className="px-2 py-0.5 rounded-md bg-secondary/60 border border-border/40 text-[11px] font-mono">
                SIRET : {settings.company_siret}
              </span>
            )}
          </div>

          <div className="flex items-center gap-6">
            <a href="#fleet" className="hover:text-primary transition-colors font-medium">Flotte</a>
            <a href="#services" className="hover:text-primary transition-colors font-medium">Déroulement</a>
            <a href="#features" className="hover:text-primary transition-colors font-medium">Services</a>
            <a href="/legal" className="hover:text-primary transition-colors font-medium underline decoration-primary/30">
              Mentions Légales & RGPD
            </a>

            <button
              onClick={scrollToTop}
              className="w-8 h-8 rounded-lg bg-secondary/60 border border-border/40 hover:border-primary hover:text-primary flex items-center justify-center transition-all ml-2"
              title="Retour en haut"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
