import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Fuel, Users, Settings, Calendar } from "lucide-react";

interface Car {
  brand: string;
  model: string;
  tag: string;
  price: number;
  weekendPrice?: number;
  weeklyPrice?: number;
  monthlyPrice?: number;
  image: string;
  specs: string[];
  available?: boolean;
  description?: string;
  features?: string[];
}

interface CarModalProps {
  car: Car | null;
  isOpen: boolean;
  onClose: () => void;
}

const CarModal = ({ car, isOpen, onClose }: CarModalProps) => {
  if (!car) return null;

  // Parser les specs JSON si c'est une chaîne
  let parsedSpecs = car.specs;
  if (typeof car.specs === 'string') {
    try {
      parsedSpecs = JSON.parse(car.specs);
    } catch (e) {
      parsedSpecs = [];
    }
  }
  const safeSpecs = Array.isArray(parsedSpecs) ? parsedSpecs : [];

  // Données détaillées supplémentaires pour chaque voiture
  const getCarDetails = (brand: string, model: string) => {
    const carFullName = `${brand} ${model}`;
    const details: Record<string, { description: string; features: string[] }> = {
      "Mercedes Classe A": {
        description: "La Mercedes Classe A allie élégance et technologie dans un format compact. Idéale pour la ville et les longs trajets, elle offre un confort exceptionnel et des équipements haut de gamme.",
        features: [
          "Climatisation automatique bi-zone",
          "Système MBUX avec écran tactile 10.25\"",
          "Régulateur de vitesse adaptatif",
          "Caméra de recul",
          "Bluetooth et Apple CarPlay",
          "Jantes alliage 18\"",
          "Feux LED intelligents"
        ]
      },
      "Volkswagen Golf 8 R": {
        description: "La Golf 8 R est une véritable sportive compacte. Avec son moteur 320 ch et sa transmission intégrale, elle offre des performances exceptionnelles tout en restant polyvalente au quotidien.",
        features: [
          "4MOTION - Transmission intégrale",
          "Echappement sport Akrapovič",
          "Freins Performance",
          "Mode de conduite Race",
          "Différentiel arrière vectoriel",
          "Jantes Estoril 19\"",
          "Sièges sport en cuir"
        ]
      },
      "Audi RS3": {
        description: "L'Audi RS3 représente le summum de la performance dans la catégorie compacte. Son moteur 5 cylindres de 400 ch et sa transmission S-Tronic en font une machine de guerre absolue.",
        features: [
          "Moteur 5 cylindres 2.5 TFSI",
          "Quattro avec torque vectoring",
          "Système d'échappement RS",
          "Audi Virtual Cockpit Plus",
          "Suspension adaptative RS",
          "Freins en céramique optionnels",
          "Mode RS Performance"
        ]
      },
      "Renault Clio V Esprit Alpine": {
        description: "La Renault Clio V en finition Esprit Alpine allie modernité, sportivité et efficience hybride. Avec ses 145 CV et sa motorisation hybride de 2023, elle offre un agrément de conduite exceptionnel en ville comme sur route.",
        features: [
          "Finition haut de gamme Esprit Alpine",
          "Moteur E-Tech 145 ch Hybride (vignette Crit'Air 1)",
          "Écran multimédia 9.3\" Easy Link avec Navigation GPS",
          "Aide au stationnement avant, arrière et caméra 360°",
          "Régulateur de vitesse adaptatif et centrage dans la voie",
          "Projecteurs Full LED avec signature lumineuse C-shape",
          "Jantes alliage 17\" spécifiques Alpine"
        ]
      },
      "Renault Clio V": {
        description: "La Renault Clio V en finition Esprit Alpine allie modernité, sportivité et efficience hybride. Avec ses 145 CV et sa motorisation hybride de 2023, elle offre un agrément de conduite exceptionnel en ville comme sur route.",
        features: [
          "Finition haut de gamme Esprit Alpine",
          "Moteur E-Tech 145 ch Hybride (vignette Crit'Air 1)",
          "Écran multimédia 9.3\" Easy Link avec Navigation GPS",
          "Aide au stationnement avant, arrière et caméra 360°",
          "Régulateur de vitesse adaptatif et centrage dans la voie",
          "Projecteurs Full LED avec signature lumineuse C-shape",
          "Jantes alliage 17\" spécifiques Alpine"
        ]
      }
    };

    return details[carFullName] || {
      description: "Découvrez cette voiture exceptionnelle de notre flotte.",
      features: [
        "Climatisation",
        "Système multimédia",
        "Régulateur de vitesse",
        "Bluetooth",
        "Caméra de recul"
      ]
    };
  };

  const carDetails = getCarDetails(car.brand, car.model);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">{car.brand} {car.model}</DialogTitle>
              <DialogDescription className="text-lg">{car.tag}</DialogDescription>
            </div>
            {car.available !== undefined && (
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${car.available ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'}`}>
                {car.available ? 'Disponible' : 'Prochainement'}
              </span>
            )}
          </div>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-6 mt-4">
          {/* Image */}
          <div className="relative h-64 md:h-80 rounded-lg overflow-hidden">
            <img
              src={car.image}
              alt={`${car.brand} ${car.model}`}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Informations principales */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-black text-gradient-orange">{car.price}€</span>
                <span className="text-muted-foreground">/jour</span>
              </div>
              <div className="flex gap-2">
                {safeSpecs.map((spec: string) => (
                  <span key={spec} className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
            
            <p className="text-muted-foreground leading-relaxed">
              {carDetails.description}
            </p>
            
            {/* Grille de prix détaillée */}
            <div className="bg-secondary/20 p-4 rounded-xl space-y-3">
              <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider underline">Forfaits Disponibles</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground font-bold">1 JOUR</p>
                  <p className="font-bold text-lg">{car.price}€</p>
                  <p className="text-[9px] text-primary">250 km incl.</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground font-bold">WEEK-END</p>
                  <p className="font-bold text-lg">{car.weekendPrice || 250}€</p>
                  <p className="text-[9px] text-primary">500 km incl.</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground font-bold">1 SEMAINE</p>
                  <p className="font-bold text-lg">{car.weeklyPrice || 390}€</p>
                  <p className="text-[9px] text-primary">1000 km incl.</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground font-bold">1 MOIS</p>
                  <p className="font-bold text-lg">{car.monthlyPrice || 1190}€</p>
                  <p className="text-[9px] text-primary">ILLIMITÉ</p>
                </div>
              </div>
              <p className="text-[9px] text-muted-foreground pt-1 border-t border-muted/20">
                Km excédentaire : <span className="text-primary font-bold">0,50 € / km</span>
              </p>
            </div>
            
            {/* Icônes d'informations */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-sm">5 places</span>
              </div>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                <span className="text-sm">{safeSpecs[1] || "Automatique"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Fuel className="h-5 w-5 text-primary" />
                <span className="text-sm">{safeSpecs[3] || "Hybride"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="text-sm">Caution : 1000€</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Équipements détaillés */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Équipements et options</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {carDetails.features.map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-3 mt-6 pt-6 border-t">
          <Button 
            className="flex-1" 
            disabled={!car.available}
            onClick={() => car.available && (window.location.href = '#contact')}
          >
            {car.available ? 'Réserver maintenant' : 'Disponible prochainement'}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CarModal;
