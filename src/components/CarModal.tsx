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
      "Renault Clio V": {
        description: "La Clio V est le choix parfait pour ceux qui recherchent une voiture moderne, économique et bien équipée. Polyvalente et facile à conduire, elle s'adapte à toutes les situations.",
        features: [
          "Écran multimédia 9.3\" Easy Link",
          "Aide au stationnement avant et arrière",
          "Régulateur de vitesse limiteur",
          "Allumage automatique des feux",
          "Détecteur d'angle mort",
          "Bluetooth et USB",
          "Climatisation manuelle"
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
            
            {/* Icônes d'informations */}
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-sm">5 places</span>
              </div>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                <span className="text-sm">{car.specs[1]}</span>
              </div>
              <div className="flex items-center gap-2">
                <Fuel className="h-5 w-5 text-primary" />
                <span className="text-sm">{car.specs[3]}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="text-sm">Disponible maintenant</span>
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
