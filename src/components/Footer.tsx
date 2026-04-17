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
