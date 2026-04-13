import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, User, CreditCard, Map, Clock, FileText, AlertCircle, Shield } from "lucide-react";

const FAQSection = () => {
  const faqCategories = [
    {
      icon: User,
      title: "Conditions de Location",
      description: "Tout savoir sur les éligibilités et conditions requises",
      questions: [
        {
          question: "Quel est l'âge minimum pour louer un véhicule ?",
          answer: "L'âge minimum est de 21 ans avec 2 ans de permis. Pour les véhicules premium (Mercedes, Audi RS3, Golf R), l'âge minimum est de 25 ans avec 3 ans de permis. Le permis doit être valide et en cours de validité."
        },
        {
          question: "Quels documents sont nécessaires ?",
          answer: "Vous devez présenter : votre permis de conduire en cours de validité, une pièce d'identité (carte d'identité ou passeport), et une carte de crédit au nom du conducteur principal pour la garantie."
        },
        {
          question: "Les permis étrangers sont-ils acceptés ?",
          answer: "Oui, les permis européens sont acceptés sans traduction. Pour les permis hors UE, un permis international ou une traduction officielle est requise."
        },
        {
          question: "Puis-je ajouter un conducteur additionnel ?",
          answer: "Oui, vous pouvez ajouter jusqu'à 3 conducteurs additionnels. Chaque conducteur doit respecter les mêmes conditions d'âge et de permis. Le coût est de 5€ par jour par conducteur additionnel."
        }
      ]
    },
    {
      icon: CreditCard,
      title: "Paiement et Garantie",
      description: "Informations sur les dépôts, assurances et paiements",
      questions: [
        {
          question: "Quel est le montant du dépôt de garantie ?",
          answer: "Le dépôt varie selon le véhicule : Clio (300€), Mercedes (800€), Golf R (1200€), Audi RS3 (1500€). Le dépôt est bloqué sur votre carte de crédit et restitué dans les 5-7 jours suivant la restitution du véhicule."
        },
        {
          question: "Quelles sont les assurances incluses ?",
          answer: "Tous nos véhicules incluent une assurance au tiers avec une franchise de 1500€. L'assurance tous risques avec franchise réduite à 300€ est en option (+25€/jour). L'assurance zéro franchise est également disponible (+45€/jour)."
        },
        {
          question: "Comment le paiement s'effectue-t-il ?",
          answer: "Le paiement de la location s'effectue au début de la période par carte de crédit. Nous acceptons Visa, Mastercard et American Express. Le dépôt de garantie est bloqué sur la même carte."
        },
        {
          question: "Y a-t-il des frais cachés ?",
          answer: "Non, nous pratiquons une politique de transparence totale. Le prix affiché inclut tous les frais obligatoires. Seules les options supplémentaires que vous choisissez sont facturées en plus."
        }
      ]
    },
    {
      icon: Map,
      title: "Kilométrage et Zone",
      description: "Tout sur les distances autorisées et zones de circulation",
      questions: [
        {
          question: "Quel kilométrage est inclus dans la location ?",
          answer: "Nos tarifs incluent 200km par jour. Le kilométrage supplémentaire est facturé 0,50€/km pour les véhicules standards et 0,80€/km pour les véhicules premium. L'option kilométrage illimité est disponible à 15€/jour."
        },
        {
          question: "Puis-je sortir du pays avec le véhicule ?",
          answer: "La circulation est autorisée dans toute la France métropolitaine. Pour les voyages à l'étranger (UE), une autorisation préalable est nécessaire et des frais supplémentaires s'appliquent. La circulation hors UE n'est pas autorisée."
        },
        {
          question: "Y a-t-il des restrictions de circulation ?",
          answer: "Les véhicules ne peuvent pas être utilisés pour des compétitions sportives, sur pistes fermées, ou pour le transport de marchandises. L'utilisation professionnelle nécessite une autorisation spéciale."
        }
      ]
    },
    {
      icon: Clock,
      title: "Réservation et Annulation",
      description: "Modalités de réservation, modification et annulation",
      questions: [
        {
          question: "Comment réserver un véhicule ?",
          answer: "Vous pouvez réserver par téléphone, via notre site web, ou directement en agence. Un acompte de 30% est requis pour confirmer la réservation. Le solde est dû à la prise du véhicule."
        },
        {
          question: "Quelle est la politique d'annulation ?",
          answer: "Annulation gratuite jusqu'à 48h avant la date de location. Entre 48h et 24h : 50% du montant. Moins de 24h : 100% du montant. En cas d'empêchement justifié (médical), nous pouvons proposer un report sans frais."
        },
        {
          question: "Puis-je modifier ma réservation ?",
          answer: "Oui, vous pouvez modifier votre réservation (dates, véhicule) sans frais jusqu'à 72h avant la date prévue, sous réserve de disponibilité."
        },
        {
          question: "Y a-t-il des tarifs dégressifs pour les longues durées ?",
          answer: "Oui, nous proposons des tarifs dégressifs : -10% pour 7-13 jours, -20% pour 14-29 jours, -30% pour 30 jours et plus. Contactez-nous pour un devis personnalisé."
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
