import logo from "@/assets/logo.jpeg";

import { useSettings } from "@/context/SettingsContext";
import { Phone, Mail, Clock, MapPin } from "lucide-react";

const Footer = () => {
  const { settings } = useSettings();

  return (
    <footer className="border-t border-border bg-card/50 pt-16 pb-10 px-6 md:px-16 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand & Social */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <img src={logo} alt="ChopTaLoc" className="h-10 rounded-lg shadow-lg" />
              <span className="font-black text-xl tracking-tighter italic">CHOPTALOC</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Votre partenaire de confiance pour la location de véhicules premium et utilitaires à Mantes-la-Jolie et ses environs.
            </p>
          </div>

          {/* Opening Hours */}
          <div className="space-y-6">
            <h3 className="font-bold text-sm uppercase tracking-widest text-primary">Horaires d'ouverture</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold">Lundi - Vendredi</p>
                  <p className="text-muted-foreground">{settings.opening_hours_week}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold">Week-end & Fériés</p>
                  <p className="text-muted-foreground">{settings.opening_hours_weekend}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="font-bold text-sm uppercase tracking-widest text-primary">Contactez-nous</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 hover:text-primary transition-colors cursor-pointer group">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium">{settings.company_phone || "Non renseigné"}</span>
              </div>
              <div className="flex items-center gap-3 hover:text-primary transition-colors cursor-pointer group">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium break-all">{settings.company_email || "contact@choptaloc.com"}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">{settings.company_address || "Mantes-la-Jolie, France"}</span>
              </div>
              {/* Socials: TikTok / Snapchat / Instagram */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3">
                  <a href="https://www.tiktok.com/@choptaloc.idf" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      {/* TikTok SVG (simplified) */}
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4 text-primary" fill="currentColor" aria-hidden>
                        <path d="M34 12v13a8 8 0 1 1-8-8v-5a11 11 0 1 0 11 11V12h5V7h-9z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium">choptaloc.idf</span>
                  </a>

                  <a href="https://www.snapchat.com/add/choptaloc.idf" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      {/* Snapchat SVG (simplified ghost) */}
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 text-primary" fill="currentColor" aria-hidden>
                        <path d="M12 2c-1 0-2 .5-2 1s-1 1-1 1-1 0-1 1 0 1 0 1 0 1 1 1c1 0 1 1 1 1s0 1-1 1c-1 0-1 1-1 1s0 1 1 1 1 1 1 1 1 0 2 0 1 0 2 0 1-1 1-1 1-1 1-1 1-1 1-1 1-1 0-1-1-1-1-1-1-1-1-1c0-1 0-1-1-1s-1-.5-2-1z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium">choptaloc.idf</span>
                  </a>

                  <a href="https://www.instagram.com/choptaloc.idf" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      {/* Instagram SVG (simplified) */}
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 text-primary" fill="currentColor" aria-hidden>
                        <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 6.5A4.5 4.5 0 1 0 16.5 13 4.5 4.5 0 0 0 12 8.5zm6.2-3.7a1.1 1.1 0 1 1-1.1-1.1 1.1 1.1 0 0 1 1.1 1.1z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium">choptaloc.idf</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span>© 2026 {settings.company_name}. Tous droits réservés.</span>
            <span>Design par Quentin OTT</span>
            {settings.company_siret && <span>SIRET : {settings.company_siret}</span>}
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#fleet" className="hover:text-primary transition-colors">Flotte</a>
            <a href="#features" className="hover:text-primary transition-colors">Services</a>
            <a href="/legal" className="hover:text-primary transition-colors font-medium underline decoration-primary/30 text-xs text-center md:text-left">Mentions Légales & RGPD</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
