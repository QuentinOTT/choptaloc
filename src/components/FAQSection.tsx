import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, User, CreditCard, Map, Clock, FileText, AlertCircle, Shield } from "lucide-react";

const FAQSection = () => {
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
          answer: "Le dépôt de garantie est de 1000€ pour les citadines et berlines. Cette somme est déduite de la caution en cas de frais supplémentaires ou dégradations."
        },
        {
          question: "Quel est l'âge minimum requis ?",
          answer: "L'âge minimum est de 21 ans avec 2 ans de permis. Pour les véhicules de catégorie supérieure, des conditions spécifiques peuvent s'appliquer."
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
          answer: "Le forfait dépend de la durée : 250km inclus pour 1 jour, 500km pour un week-end, et 1000km pour une semaine. Le kilométrage est illimité pour les locations au mois."
        },
        {
          question: "Puis-je sortir du pays ?",
          answer: "La circulation est autorisée en France métropolitaine. Toute sortie du territoire sans accord écrit préalable peut donner lieu à des pénalités."
        }
      ]
    }
  ];


  return (
    <section id="faq" className="py-24 px-6 md:px-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-primary font-semibold tracking-[0.2em] uppercase text-sm mb-3">Questions Fréquentes</p>
          <h2 className="text-3xl md:text-5xl font-black mb-4">
            Tout Savoir sur la <span className="text-gradient-orange">Location</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Retrouvez toutes les réponses à vos questions sur nos conditions de location, services et tarifs.
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8 mb-16">
          {faqCategories.map((category, categoryIndex) => (
            <Card key={categoryIndex} className="glass">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <category.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((faq, faqIndex) => (
                    <AccordionItem key={faqIndex} value={`item-${categoryIndex}-${faqIndex}`}>
                      <AccordionTrigger className="text-left hover:text-primary transition-colors">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>


        {/* CTA */}
        <div className="text-center">
          <div className="glass rounded-2xl p-8 max-w-2xl mx-auto">
            <HelpCircle className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-4">Une question qui reste sans réponse ?</h3>
            <p className="text-muted-foreground mb-6">
              Notre équipe est à votre disposition pour répondre à toutes vos interrogations personnalisées.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#contact"
                className="inline-flex px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:brightness-110 transition-all"
              >
                Contacter l'agence
              </a>
              <a
                href="tel:+33123456789"
                className="inline-flex px-8 py-3 rounded-lg glass font-semibold hover:bg-secondary transition-all"
              >
                Appeler maintenant
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
