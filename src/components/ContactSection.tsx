import { Phone, Mail, MapPin, Loader2, Clock, Send, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { API_URL } from "@/config/api";
import { toast } from "sonner";
import { useSettings } from "@/context/SettingsContext";

const ContactSection = () => {
  const { settings } = useSettings();
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", subject: "Demande de location", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Merci ! Nous vous recontacterons très bientôt.");
        setFormData({ name: "", email: "", phone: "", subject: "Demande de location", message: "" });
      } else {
        const error = await response.json();
        toast.error(`Erreur: ${error.error || 'Erreur lors de l\'envoi'}`);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error("Erreur de connexion au serveur");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 md:py-32 px-4 md:px-12 lg:px-16 relative overflow-hidden bg-background/50">
      {/* Background illumination */}
      <div className="absolute bottom-0 left-1/4 w-[700px] h-[350px] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <p className="text-primary font-bold tracking-[0.2em] uppercase text-xs">
              Contact
            </p>
          </div>

          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
            Réservez <span className="text-gradient-orange">Maintenant</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
          {/* Agency Info Card (Left Column) */}
          <div className="lg:col-span-2 rounded-3xl p-8 bg-gradient-to-b from-card/90 via-card/60 to-card/40 backdrop-blur-xl border border-white/[0.08] shadow-2xl flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Choptaloc</span>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Notre équipe vous accueille et répond à vos demandes sur mesure 7j/7 pour tous vos projets de location.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <a 
                  href={settings.company_phone ? `tel:${settings.company_phone}` : "tel:+33123456789"}
                  className="flex items-center gap-4 p-3.5 rounded-2xl bg-secondary/40 border border-border/40 hover:border-primary/40 hover:bg-secondary/70 transition-all duration-300 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Téléphone direct</p>
                    <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                      {settings.company_phone || "+33 1 23 45 67 89"}
                    </p>
                  </div>
                </a>

                <a 
                  href={`mailto:${settings.company_email || "contact@choptaloc.com"}`}
                  className="flex items-center gap-4 p-3.5 rounded-2xl bg-secondary/40 border border-border/40 hover:border-primary/40 hover:bg-secondary/70 transition-all duration-300 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Email réservation</p>
                    <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                      {settings.company_email || "contact@choptaloc.com"}
                    </p>
                  </div>
                </a>

                <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-secondary/40 border border-border/40">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Localisation</p>
                    <p className="text-sm font-bold text-foreground">
                      {settings.company_address || "Mantes-la-Jolie, Île-de-France"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Response Time Guarantee Pill */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-foreground">Engagement Sérénité</p>
                <p className="text-[11px] text-muted-foreground">Réponse garantie sous 1 heure en journée</p>
              </div>
            </div>
          </div>

          {/* Form (Right Column) */}
          <form 
            onSubmit={handleSubmit} 
            className="lg:col-span-3 rounded-3xl p-8 md:p-10 bg-card/70 backdrop-blur-xl border border-white/[0.08] shadow-2xl space-y-6 flex flex-col justify-between"
          >
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Votre nom *</label>
                  <input
                    type="text"
                    placeholder="ex: Alexandre Dumas"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3.5 rounded-xl bg-secondary/60 border border-border/60 text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Votre email *</label>
                  <input
                    type="email"
                    placeholder="ex: contact@exemple.fr"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3.5 rounded-xl bg-secondary/60 border border-border/60 text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Votre téléphone</label>
                <input
                  type="tel"
                  placeholder="ex: 06 12 34 56 78"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl bg-secondary/60 border border-border/60 text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Votre message ou détails de réservation *</label>
                <textarea
                  placeholder="Indiquez le véhicule souhaité, vos dates, ou toute question particulière..."
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl bg-secondary/60 border border-border/60 text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-base shadow-lg shadow-primary/25 hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Envoi en cours...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Envoyer la Demande</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
