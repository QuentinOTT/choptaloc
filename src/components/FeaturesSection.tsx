import { Shield, Clock, Star, FileText } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Support 24/7",
    description: "Une assistance disponible à tout moment, jour et nuit, pour vous accompagner sur la route.",
    tag: "Assistance continue",
  },
  {
    icon: FileText,
    title: "Contrats Clairs",
    description: "Des conditions de location transparentes et détaillées, sans surprise.",
    tag: "Transparence totale",
  },
  {
    icon: Clock,
    title: "Flexibilité",
    description: "Retour possible 24h/24 dans nos agences",
    tag: "Liberté horaire",
  },
  {
    icon: Star,
    title: "Flotte Premium",
    description: "Des véhicules récents, parfaitement entretenus et équipés pour une expérience de conduite inégalée.",
    tag: "Qualité certifiée",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 md:py-32 px-4 md:px-12 lg:px-16 relative overflow-hidden bg-background/50">
      {/* Background illumination */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <p className="text-primary font-bold tracking-[0.2em] uppercase text-xs">
              Nos Services
            </p>
          </div>

          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
            Pourquoi <span className="text-gradient-orange">ChopTaLoc</span> ?
          </h2>
        </div>

        {/* Features Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group relative rounded-3xl p-8 bg-card/70 backdrop-blur-xl border border-white/[0.08] hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1.5 flex flex-col justify-between"
              >
                {/* Glow accent bar on hover */}
                <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div>
                  {/* Icon with illuminated halo */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-md shadow-primary/10">
                    <Icon className="w-8 h-8 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>

                  <h3 className="text-xl font-black tracking-tight mb-3 text-foreground group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>

                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Bottom luxury pill */}
                <div className="mt-8 pt-4 border-t border-border/40 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    {feature.tag}
                  </span>
                  <span className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    ★
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
