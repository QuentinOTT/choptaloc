import { FileCheck, CreditCard, Car, ClipboardCheck, Wallet, Shield, CheckCircle, ArrowRight } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

const ServicesSection = () => {
  const { settings } = useSettings();
  const acompteValue = settings.booking_acompte_value || "50";
  const acompteText = settings.booking_acompte_type === "fixed" ? `${acompteValue}€` : `${acompteValue}%`;

  const rentalSteps = [
    {
      number: "01",
      icon: FileCheck,
      title: "Devis",
      description: "Acceptez le devis",
      short: "Devis personnalisé"
    },
    {
      number: "02",
      icon: CreditCard,
      title: "Acompte",
      description: `Versez ${acompteText} d'acompte`,
      short: `Acompte ${acompteText}`
    },
    {
      number: "03",
      icon: ClipboardCheck,
      title: "Documents",
      description: "Vérification permis",
      short: "Documents requis"
    },
    {
      number: "04",
      icon: Car,
      title: "Remise",
      description: "Récupération véhicule",
      short: "Tour du véhicule"
    },
    {
      number: "05",
      icon: Wallet,
      title: "Caution",
      description: "Dépôt de caution",
      short: "Caution bloquée"
    },
    {
      number: "06",
      icon: Shield,
      title: "Location",
      description: "Profitez en liberté",
      short: "En toute sérénité"
    },
    {
      number: "07",
      icon: ArrowRight,
      title: "Retour",
      description: "Restitution véhicule",
      short: "État des lieux"
    },
    {
      number: "08",
      icon: CheckCircle,
      title: "Remboursement",
      description: "Caution restituée",
      short: "48-72h"
    }
  ];

  return (
    <section id="services" className="py-24 md:py-32 px-4 md:px-12 lg:px-16 relative overflow-hidden bg-background">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-20 right-0 w-[450px] h-[450px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Decorative subtle grid background */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <p className="text-primary font-bold tracking-[0.2em] uppercase text-xs">
              Déroulement de la Location
            </p>
          </div>

          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
            Comment ça <span className="text-gradient-orange">fonctionne</span> ?
          </h2>
          
          <p className="text-muted-foreground text-sm md:text-lg max-w-xl mx-auto leading-relaxed">
            8 étapes simples pour votre location premium
          </p>
        </div>

        {/* Étapes de location - Grille haut de gamme */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {rentalSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="group relative rounded-2xl p-6 bg-card/60 backdrop-blur-xl border border-white/[0.08] hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 flex flex-col justify-between overflow-hidden"
              >
                {/* Subtle top card glow line */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Step Header: Number + Icon */}
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-105 transition-all duration-300 shadow-sm shadow-primary/10">
                    <Icon className="w-5 h-5 transition-transform duration-300 group-hover:rotate-3" />
                  </div>
                  <span className="text-2xl font-black tracking-tighter text-muted-foreground/30 group-hover:text-primary/60 transition-colors font-mono">
                    {step.number}
                  </span>
                </div>

                {/* Step Content */}
                <div className="space-y-1.5 flex-1">
                  <h3 className="text-base md:text-lg font-bold text-foreground group-hover:text-primary transition-colors tracking-tight">
                    {index + 1}. {step.title}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Step Pill Footer */}
                {step.short && (
                  <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-primary/90 bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20 tracking-wide">
                      {step.short}
                    </span>
                    <span className="text-[10px] text-muted-foreground/50 uppercase font-mono">Étape {step.number}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
