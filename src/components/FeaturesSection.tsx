import { Shield, Clock, Star, FileText } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Support 24/7",
    description: "Une assistance disponible à tout moment, jour et nuit, pour vous accompagner sur la route.",
  },
  {
    icon: FileText,
    title: "Contrats Clairs",
    description: "Des conditions de location transparentes et détaillées, sans surprise.",
  },
  {
    icon: Clock,
    title: "Flexibilité",
    description: "Retour possible 24h/24 dans nos agences",
  },
  {
    icon: Star,
    title: "Flotte Premium",
    description: "Des véhicules récents, parfaitement entretenus et équipés pour une expérience de conduite inégalée.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 px-6 md:px-16 relative">
      {/* Subtle glow background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative">
        <div className="text-center mb-16">
          <p className="text-primary font-semibold tracking-[0.2em] uppercase text-sm mb-3">Nos Services</p>
          <h2 className="text-3xl md:text-5xl font-black">
            Pourquoi <span className="text-gradient-orange">ChopTaLoc</span> ?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="glass rounded-2xl p-8 text-center hover-glow-orange group"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
