import { Phone, Mail, MapPin, Loader2 } from "lucide-react";
import { useState } from "react";
import { API_URL } from "@/config/api";
import { toast } from "sonner";

const ContactSection = () => {
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
    <section id="contact" className="py-24 px-6 md:px-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-primary font-semibold tracking-[0.2em] uppercase text-sm mb-3">Contact</p>
          <h2 className="text-3xl md:text-5xl font-black">
            Réservez <span className="text-gradient-orange">Maintenant</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass rounded-2xl p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Téléphone</p>
                  <p className="font-bold text-lg">+33 6 12 34 56 78</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Email</p>
                  <p className="font-bold">contact@choptaloc.fr</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Adresse</p>
                  <p className="font-bold">Paris, France</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-3 glass rounded-2xl p-8 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <input
                type="text"
                placeholder="Votre nom"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-5 py-3.5 rounded-xl bg-secondary border-none text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
              />
              <input
                type="email"
                placeholder="Votre email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-5 py-3.5 rounded-xl bg-secondary border-none text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </div>
            <input
              type="tel"
              placeholder="Votre téléphone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-5 py-3.5 rounded-xl bg-secondary border-none text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
            />
            <textarea
              placeholder="Votre message ou détails de réservation..."
              rows={4}
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-5 py-3.5 rounded-xl bg-secondary border-none text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg glow-orange hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Envoi...
                </>
              ) : (
                "Envoyer la Demande"
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
