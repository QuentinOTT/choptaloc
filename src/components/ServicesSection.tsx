import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileCheck, CreditCard, Car, ClipboardCheck, Wallet, Shield, CheckCircle, Clock, Users, Star, ArrowRight, MapPin, Calendar } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

const ServicesSection = () => {
  const { settings } = useSettings();
  const acompteValue = settings.booking_acompte_value || "30";
  const acompteText = settings.booking_acompte_type === "fixed" ? `${acompteValue}€` : `${acompteValue}%`;

  const rentalSteps = [
    {
      icon: FileCheck,
      title: "1. Devis",
      description: "Acceptez le devis",
      short: "Devis personnalisé"
    },
    {
      icon: CreditCard,
      title: "2. Acompte",
      description: `Versez ${acompteText} d'acompte`,
      short: `Acompte ${acompteText}`
    },
    {
      icon: ClipboardCheck,
      title: "3. Documents",
      description: "Vérification permis",
      short: "Documents requis"
    },
    {
      icon: Car,
      title: "4. Remise",
      description: "Récupération véhicule",
      short: "Tour du véhicule"
    },
    {
      icon: Wallet,
      title: "5. Caution",
      description: "Dépôt de caution",
      short: "Caution bloquée"
    },
    {
      icon: Shield,
      title: "6. Location",
      description: "Profitez en liberté",
      short: ""
    },
    {
      icon: ArrowRight,
      title: "7. Retour",
      description: "Restitution véhicule",
      short: "État des lieux"
    },
    {
      icon: CheckCircle,
      title: "8. Remboursement",
      description: "Caution restituée",
      short: "48-72h"
    }
  ];

  return (
    <section id="services" className="py-24 px-6 md:px-16 bg-gradient-to-br from-background via-background to-background/95 relative overflow-hidden">
      {/* Reflet orange décoratif */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-primary font-semibold tracking-[0.2em] uppercase text-xs md:text-sm mb-2 md:mb-3">Déroulement de la Location</p>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-black mb-2 md:mb-4">
            Comment ça <span className="text-gradient-orange">fonctionne</span> ?
          </h2>
          <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto">
            8 étapes simples pour votre location premium
          </p>
        </div>

        {/* Étapes de location - Grille visuelle */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {rentalSteps.map((step, index) => (
            <Card key={index} className="bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/70 hover-glow-orange transition-all duration-300 text-center p-3 md:p-4">
              <div className="flex flex-col items-center gap-2 md:gap-3">
                {/* Icône */}
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <step.icon className="w-5 h-5 md:w-7 md:h-7 text-primary" />
                </div>

                {/* Contenu */}
                <div className="flex-1 flex flex-col items-center">
                  <h3 className="text-xs md:text-sm font-bold mb-1">{step.title}</h3>
                  <p className="text-[10px] md:text-xs text-muted-foreground">{step.short}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
