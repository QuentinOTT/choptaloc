import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, User, CreditCard, Map, AlertCircle, ArrowRight, Phone } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

const FAQSection = () => {
  const { settings } = useSettings();
  const [selectedCat, setSelectedCat] = useState<number | "all">("all");

  const faqCategories = [
    {
      icon: User,
      title: "Conditions de Location",
      description: "Tout savoir sur les éligibilités et documents requis",
      questions: [
        {
          question: "Quels documents sont nécessaires pour louer ?",
          answer: "Vous devez présenter : une Carte Nationale d'Identité (CNI) en cours de validité, votre permis de conduire (recto-verso), et un justificatif de domicile de moins de 3 mois."
        },
        {
          question: "Quel est le montant du dépôt de garantie (caution) ?",
          answer: "Le dépôt de garantie est de 1000€ pour les citadines. Pour les véhicules sportifs et de catégorie supérieure, le montant est spécifique à chaque véhicule (voir détails du véhicule)."
        },
        {
          question: "Quel est l'âge minimum requis ?",
          answer: "Pour les citadines, 1 an de permis suffit. Pour les véhicules sportifs et de catégorie supérieure, l'ancienneté requise est spécifique à chaque véhicule (voir détails du véhicule)."
        }
      ]
    },
    {
      icon: AlertCircle,
      title: "Pénalités et Frais",
      description: "Frais applicables en cas de non-respect du règlement",
      questions: [
        {
          question: "Quels sont les frais de nettoyage ?",
          answer: "Le véhicule doit être rendu propre. Nettoyage intérieur standard : 20€. Nettoyage approfondi (ordures, boue, vomissures, etc.) : 50€."
        },
        {
          question: "Peut-on fumer dans le véhicule ?",
          answer: "Il est strictement interdit de fumer à bord. En cas d'odeur de cigarette détectée, des frais de désodorisation de 80€ s'appliquent. Toute brûlure ou trou de cigarette est facturé 80€ par marque détectée."
        },
        {
          question: "Que se passe-t-il si le véhicule part à la fourrière ?",
          answer: "Tous les frais de fourrière sont à la charge intégrale du locataire. De plus, ChopTaLoc applique des frais administratifs fixes de 250€."
        },
        {
          question: "Quels sont les frais de carburant et kilométrage ?",
          answer: "Le kilométrage excédentaire est facturé 0,50€ par km. En cas d'essence manquante, le plein sera refait et facturé au prix réel + 20€ de frais de service."
        }
      ]
    },
    {
      icon: CreditCard,
      title: "Paiement et Réservation",
      description: "Informations sur les modalités de règlement",
      questions: [
        {
          question: "Comment s'effectue le paiement ?",
          answer: "Le règlement s'effectue au moment de la prise en charge du véhicule. Nous acceptons les cartes de crédit et les virements instantanés."
        },
        {
          question: "Quelle est la politique d'annulation ?",
          answer: "Annulation gratuite jusqu'à 48h avant la date de location. Moins de 48h, des frais peuvent s'appliquer comme mentionné dans votre contrat."
        }
      ]
    },
    {
      icon: Map,
      title: "Kilométrage et Zone",
      description: "Tout sur les distances autorisées",
      questions: [
        {
          question: "Quel kilométrage est inclus ?",
          answer: "Le kilométrage inclus dépend du forfait choisi : 250km pour 1 jour, 500km pour un week-end, 1000km pour une semaine. Les options d'extension kilométrique sont disponibles sur demande."
        },
        {
          question: "Puis-je sortir du pays ?",
          answer: "La circulation est autorisée en France métropolitaine. Toute sortie du territoire sans accord écrit préalable peut donner lieu à des pénalités."
        }
      ]
    }
  ];

  const filteredCategories = selectedCat === "all" 
    ? faqCategories 
    : [faqCategories[selectedCat]];

  return (
    <section id="faq" className="py-24 md:py-32 px-4 md:px-12 lg:px-16 relative overflow-hidden bg-background">
      {/* Background illumination */}
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[350px] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 md:mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <p className="text-primary font-bold tracking-[0.2em] uppercase text-xs">
              Questions Fréquentes
            </p>
          </div>

          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
            Tout Savoir sur la <span className="text-gradient-orange">Location</span>
          </h2>
          
          <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto leading-relaxed">
            Retrouvez toutes les réponses à vos questions sur nos conditions de location, services et tarifs.
          </p>

          {/* Interactive Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            <button
              onClick={() => setSelectedCat("all")}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all border ${
                selectedCat === "all"
                  ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105"
                  : "bg-card/70 border-white/[0.08] text-muted-foreground hover:text-foreground hover:border-white/20"
              }`}
            >
              Toutes les rubriques
            </button>
            {faqCategories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.title}
                  onClick={() => setSelectedCat(idx)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all border ${
                    selectedCat === idx
                      ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105"
                      : "bg-card/70 border-white/[0.08] text-muted-foreground hover:text-foreground hover:border-white/20"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQ Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {filteredCategories.map((category, catIndex) => {
            const Icon = category.icon;
            return (
              <div
                key={category.title}
                className="rounded-3xl p-6 md:p-8 bg-card/60 backdrop-blur-xl border border-white/[0.08] hover:border-primary/30 transition-all duration-300 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-4 mb-6 pb-5 border-b border-border/40">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-black text-foreground tracking-tight">
                        {category.title}
                      </h3>
                      <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                        {category.description}
                      </p>
                    </div>
                  </div>

                  <Accordion type="single" collapsible className="w-full space-y-2">
                    {category.questions.map((faq, qIndex) => (
                      <AccordionItem
                        key={qIndex}
                        value={`item-${catIndex}-${qIndex}`}
                        className="border border-border/40 rounded-xl px-4 bg-background/30 hover:bg-background/50 transition-colors data-[state=open]:border-primary/40 data-[state=open]:bg-primary/[0.02]"
                      >
                        <AccordionTrigger className="text-left text-xs md:text-sm font-bold text-foreground hover:text-primary transition-colors py-3.5 [&[data-state=open]>svg]:text-primary">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-xs md:text-sm text-muted-foreground leading-relaxed pt-1 pb-4">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Concierge Banner */}
        <div className="max-w-3xl mx-auto">
          <div className="relative rounded-3xl p-8 md:p-10 bg-gradient-to-b from-card/90 to-card/50 backdrop-blur-2xl border border-primary/20 shadow-2xl text-center overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5 text-primary shadow-sm shadow-primary/20">
              <HelpCircle className="w-7 h-7" />
            </div>

            <h3 className="text-xl md:text-2xl font-black tracking-tight text-foreground mb-3">
              Une question qui reste sans réponse ?
            </h3>

            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-8 leading-relaxed">
              Notre équipe est à votre disposition pour répondre à toutes vos interrogations personnalisées.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="#contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/25 hover:brightness-110 transition-all duration-300"
              >
                <span>Contacter l'agence</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href={settings.company_phone ? `tel:${settings.company_phone}` : "tel:+33123456789"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-secondary/80 border border-border text-foreground font-semibold text-sm hover:bg-secondary transition-all duration-300"
              >
                <Phone className="w-4 h-4 text-primary" />
                <span>Appeler maintenant</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
