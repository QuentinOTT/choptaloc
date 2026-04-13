import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, MapPin, Calendar, Shield, CheckCircle, Clock, Users, Star } from "lucide-react";

const ServicesSection = () => {
  const services = [
    {
      icon: Car,
      title: "Location avec ou sans chauffeur",
      description: "Profitez de nos véhicules premium en toute liberté ou avec un chauffeur professionnel pour un service d'exception.",
      features: [
        "Chauffeurs professionnels expérimentés",
        "Service disponible 24/7",
        "Véhicules impeccables",
        "Flexibilité totale"
      ]
    },
    {
      icon: MapPin,
      title: "Livraison à votre adresse",
      description: "Recevez votre véhicule directement où vous le souhaitez : hôtel, aéroport, domicile ou bureau.",
      features: [
        "Livraison gratuite dans un rayon de 30km",
        "Service disponible dans toute la région",
        "Horaires flexibles",
        "Prise en charge personnalisée"
      ]
    },
    {
      icon: Calendar,
      title: "Forfaits événementiels",
      description: "Des solutions sur mesure pour vos événements spéciaux : mariages, tournages, clips vidéo et occasions prestigieuses.",
      features: [
        "Décoration personnalisée",
        "Forfaits journée/week-end",
        "Conducteur supplémentaire possible",
        "Assistance événement dédiée"
      ]
    },
    {
      icon: Shield,
      title: "Assurances et options",
      description: "Protégez votre location avec nos assurances complètes et options de confort pour une tranquillité d'esprit totale.",
      features: [
        "Assurance tous risques",
        "Kilométrage illimité",
        "Assistance 24/7",
        "Zéro franchise optionnelle"
      ]
    }
  ];

  const additionalOptions = [
    {
      icon: CheckCircle,
      title: "Kilométrage illimité",
      description: "Parcourez sans limites et sans contraintes",
      price: "+15€/jour"
    },
    {
      icon: Shield,
      title: "Assurance premium",
      description: "Zéro franchise et couverture complète",
      price: "+25€/jour"
    },
    {
      icon: Clock,
      title: "Extension de garantie",
      description: "Couverture mécanique prolongée",
      price: "+10€/jour"
    },
    {
      icon: Users,
      title: "Conducteur additionnel",
      description: "Autorisez un deuxième conducteur",
      price: "+5€/jour"
    }
  ];

  return (
    <section id="services" className="py-24 px-6 md:px-16 bg-gradient-to-br from-background via-background to-background/95 relative overflow-hidden">
      {/* Reflet orange décoratif */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-primary font-semibold tracking-[0.2em] uppercase text-sm mb-3">Nos Services</p>
          <h2 className="text-3xl md:text-5xl font-black mb-4">
            Une <span className="text-gradient-orange">Expérience</span> Complète
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Bien plus que de la simple location, nous vous offrons des services sur mesure pour répondre à tous vos besoins.
          </p>
        </div>

        {/* Services principaux */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {services.map((service, index) => (
            <Card key={index} className="bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/70 hover-glow-orange transition-all duration-300 group">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <service.icon className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-lg font-bold">{service.title}</CardTitle>
                <CardDescription className="text-sm">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Options supplémentaires */}
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold mb-4">Options Supplémentaires</h3>
          <p className="text-muted-foreground mb-8">
            Personnalisez votre location avec nos options complémentaires
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {additionalOptions.map((option, index) => (
              <div key={index} className="bg-background/50 backdrop-blur-sm border-border/50 rounded-lg p-4 hover-glow-orange transition-all duration-300">
                <div className="flex items-center gap-3 mb-2">
                  <option.icon className="w-6 h-6 text-primary" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{option.title}</h4>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-primary font-bold">{option.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
