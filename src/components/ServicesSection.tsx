import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileCheck, CreditCard, Car, ClipboardCheck, Wallet, Shield, CheckCircle, Clock, Users, Star, ArrowRight, MapPin, Calendar } from "lucide-react";

const ServicesSection = () => {
  const rentalSteps = [
    {
      icon: FileCheck,
      title: "1. Acceptation du devis",
      description: "Vous recevez un devis personnalisé selon vos dates et le véhicule choisi. Une fois validé, vous confirmez votre réservation.",
      details: [
        "Devis détaillé par email",
        "Validation en ligne ou par téléphone",
        "Confirmation immédiate"
      ]
    },
    {
      icon: CreditCard,
      title: "2. Versement de l'acompte",
      description: "Un acompte de 30% est demandé pour sécuriser votre réservation. Le solde est réglé à la remise des clés.",
      details: [
        "Paiement sécurisé en ligne",
        "Acompte de 30% du total",
        "Solde à la remise du véhicule"
      ]
    },
    {
      icon: ClipboardCheck,
      title: "3. Vérification des documents",
      description: "Nous vérifions vos documents de conduite et d'identité avant la remise du véhicule.",
      details: [
        "Permis de conduire valide",
        "Carte d'identité ou passeport",
        "Justificatif de domicile"
      ]
    },
    {
      icon: Car,
      title: "4. Remise du véhicule",
      description: "Vous récupérez votre véhicule à l'endroit convenu avec un tour complet du véhicule.",
      details: [
        "État des lieux détaillé",
        "Tour du véhicule ensemble",
        "Explication des fonctionnalités"
      ]
    },
    {
      icon: Wallet,
      title: "5. Dépôt de caution",
      description: "Une caution est bloquée sur votre carte bancaire et restituée après restitution du véhicule.",
      details: [
        "Caution selon le véhicule",
        "Débit automatique si dommages",
        "Restitution sous 48-72h"
      ]
    },
    {
      icon: Shield,
      title: "6. Période de location",
      description: "Profitez de votre véhicule en toute liberté pendant la durée convenue.",
      details: [
        "Kilométrage illimité inclus",
        "Assistance 24/7 disponible",
        "Conducteur additionnel possible"
      ]
    },
    {
      icon: ArrowRight,
      title: "7. Restitution du véhicule",
      description: "Vous rendez le véhicule à l'endroit convenu avec un état des lieux de sortie.",
      details: [
        "État des lieux de sortie",
        "Vérification du kilométrage",
        "Remise des clés"
      ]
    },
    {
      icon: CheckCircle,
      title: "8. Restitution de la caution",
      description: "Après vérification du véhicule, la caution est restituée dans les 48-72 heures.",
      details: [
        "Vérification rapide",
        "Restitution sous 48-72h",
        "Facture finale envoyée par email"
      ]
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
          <p className="text-primary font-semibold tracking-[0.2em] uppercase text-sm mb-3">Déroulement de la Location</p>
          <h2 className="text-3xl md:text-5xl font-black mb-4">
            Comment ça <span className="text-gradient-orange">fonctionne</span> ?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Découvrez les 8 étapes simples de votre expérience de location premium.
          </p>
        </div>

        {/* Étapes de location */}
        <div className="space-y-6">
          {rentalSteps.map((step, index) => (
            <Card key={index} className="bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/70 hover-glow-orange transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Icône */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <step.icon className="w-8 h-8 text-primary" />
                    </div>
                  </div>

                  {/* Contenu */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground mb-4">{step.description}</p>

                    {/* Détails */}
                    <ul className="space-y-2">
                      {step.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className="text-muted-foreground">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
