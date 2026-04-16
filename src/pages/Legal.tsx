
import React from "react";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Scale, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Legal = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-20 px-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")} 
          className="mb-8 hover:bg-secondary"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour à l'accueil
        </Button>

        <header className="mb-12">
          <h1 className="text-4xl font-black mb-4">Mentions Légales & RGPD</h1>
          <p className="text-muted-foreground">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
        </header>

        <div className="space-y-12">
          {/* Section 1: Mentions Légales */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <Scale className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">1. Éditeur du Site</h2>
            </div>
            <div className="glass p-6 rounded-2xl space-y-2 text-sm leading-relaxed">
              <p><strong>Nom de l'entreprise :</strong> ChopTaLoc</p>
              <p><strong>Forme juridique :</strong> [À COMPLÉTER - Ex: SAS / Auto-entrepreneur]</p>
              <p><strong>Siège social :</strong> [À COMPLÉTER - Ex: Mantes-la-Jolie, France]</p>
              <p><strong>SIRET :</strong> [À COMPLÉTER]</p>
              <p><strong>Directeur de la publication :</strong> [À COMPLÉTER]</p>
              <p><strong>Contact :</strong> contact@choptaloc.fr</p>
            </div>
          </section>

          {/* Section 2: Hébergement */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <Info className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">2. Hébergement</h2>
            </div>
            <div className="glass p-6 rounded-2xl text-sm leading-relaxed">
              <p>Ce site est hébergé par [À COMPLÉTER - Ex: DigitalOcean / OVH / Hostinger].</p>
            </div>
          </section>

          {/* Section 3: RGPD */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">3. Protection des Données (RGPD)</h2>
            </div>
            <div className="glass p-6 rounded-2xl space-y-6 text-sm leading-relaxed">
              <div>
                <h3 className="font-bold text-base mb-2">Collecte des données</h3>
                <p>
                  Dans le cadre de l'utilisation du site, ChopTaLoc collecte des données personnelles (Nom, Prénom, Email, Téléphone, Documents d'identité) pour la gestion des réservations et la conformité légale de la location de véhicule.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-base mb-2">Finalité des données</h3>
                <p>
                  Les données collectées sont utilisées exclusivement pour :
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li>La création et la gestion du compte client.</li>
                    <li>Le traitement et le suivi des réservations.</li>
                    <li>La vérification des pièces justificatives (Permis/CNI).</li>
                    <li>L'envoi de notifications par email concernant vos réservations.</li>
                  </ul>
                </p>
              </div>
              <div>
                <h3 className="font-bold text-base mb-2">Vos droits</h3>
                <p>
                  Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données. Pour exercer ce droit, veuillez nous contacter à : <strong>contact@choptaloc.fr</strong>.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-base mb-2">Conservation des documents</h3>
                <p>
                  Les documents d'identité sont conservés de manière sécurisée et ne sont accessibles qu'à l'administrateur pour la validation du dossier. Ils sont supprimés du serveur après expiration du délai légal de conservation.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Cookies */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">4. Cookies</h2>
            <div className="glass p-6 rounded-2xl text-sm leading-relaxed">
              <p>
                Le site utilise des cookies techniques strictement nécessaires au fonctionnement (connexion au compte, sessions de réservation). Aucun cookie de traçage publicitaire tiers n'est utilisé sans votre consentement.
              </p>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Legal;
