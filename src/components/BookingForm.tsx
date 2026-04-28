import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, MapPin, CreditCard, User, Phone, Mail, Car, X, HelpCircle } from "lucide-react";
import { useClientAuth } from "@/hooks/use-client-auth";
import { API_URL } from "@/config/api";
import { useNavigate } from "react-router-dom";
import { LogIn, UserPlus } from "lucide-react";

interface Car {
  id: string;
  brand: string;
  model: string;
  price: number;
  weeklyPrice?: number;
  monthlyPrice?: number;
  caution_amount?: number;
  min_license_years?: number;
  image: string;
  tag?: string;
  specs?: string[];
}

// Fonction utilitaire pour calculer le nombre de jours
const getDaysCount = (start: string, end: string) => {
  if (!start || !end) return 0;
  const d1 = new Date(start);
  const d2 = new Date(end);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

interface BookingFormProps {
  car: Car | null;
  isOpen: boolean;
  onClose: () => void;
  selectedDates: string[];
}

const BookingForm = ({ car, isOpen, onClose, selectedDates }: BookingFormProps) => {
  const { user, isAuthenticated } = useClientAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    driverLicenseNumber: "",
    driverLicenseDate: "",
    deliveryOption: false,
    pickupLocation: "",
    dropoffLocation: "",
    pickupTime: "10:00",
    dropoffTime: "10:00",
    startDate: "",
    endDate: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      // Charger le profil du client depuis user
      let profileData: any = {};
      if (user) {
        profileData = {
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          phone: user.phone || "",
        };
      }

      setFormData({
        firstName: profileData.firstName || user?.firstName || "",
        lastName: profileData.lastName || user?.lastName || "",
        email: profileData.email || user?.email || "",
        phone: profileData.phone || user?.phone || "",
        driverLicenseNumber: "",
        driverLicenseDate: "",
        deliveryOption: false,
        pickupLocation: profileData.address || "",
        dropoffLocation: profileData.address || "",
        pickupTime: "10:00",
        dropoffTime: "10:00",
        startDate: selectedDates[0] || "",
        endDate: selectedDates[selectedDates.length - 1] || "",
        notes: "",
      });
      setErrors({});
    }
  }, [isOpen, user, selectedDates]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = "Le prénom est requis";
    if (!formData.lastName.trim()) newErrors.lastName = "Le nom est requis";
    if (!formData.email.trim()) newErrors.email = "L'email est requis";
    if (!formData.phone.trim()) newErrors.phone = "Le téléphone est requis";
    if (formData.deliveryOption) {
      if (!formData.pickupLocation.trim()) newErrors.pickupLocation = "Le lieu de récupération est requis";
      if (!formData.dropoffLocation.trim()) newErrors.dropoffLocation = "Le lieu de retour est requis";
    }
    if (!formData.startDate) newErrors.startDate = "La date de début est requise";
    if (!formData.endDate) newErrors.endDate = "La date de fin est requise";

    // Validation des dates : ne pas réserver pour une date passée
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (formData.startDate) {
      const startDate = new Date(formData.startDate);
      startDate.setHours(0, 0, 0, 0);
      if (startDate < today) {
        newErrors.startDate = "La date de début doit être au moins aujourd'hui";
      }
    }

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      if (endDate < startDate) {
        newErrors.endDate = "La date de fin doit être après la date de début";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Début handleSubmit - FormData:', formData);
    console.log('Car:', car);
    console.log('User:', user);

    if (!validateForm()) {
      console.log('Validation échouée - Erreurs:', errors);
      return;
    }
    if (!car) {
      console.log('Car est null');
      return;
    }

    // Calculer les dates entre startDate et endDate
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const dates: string[] = [];
    const current = new Date(start);
    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    console.log('Dates calculées:', [formData.startDate, formData.endDate]);

    // Calculer le prix total avec prix dégressif
    let newTotalPrice = 0;
    const daysCount = getDaysCount(formData.startDate, formData.endDate);
    
    // Forfait spécifique 3 jours (72h) = 250€
    if (daysCount === 3) {
      newTotalPrice = 250;
    } else {
      newTotalPrice = daysCount * car.price;
    }

    // Les frais de livraison seront calculés par l'administrateur après la réservation
    const deliveryFee = 0;
    newTotalPrice += deliveryFee;

    // Créer la réservation avec userId si un client est connecté
    const newBooking: any = {
      carId: car.id,
      userId: user?.id || null, // On envoie explicitement null si pas de user
      startDate: formData.startDate,
      endDate: formData.endDate,
      pickupLocation: formData.deliveryOption ? formData.pickupLocation : "Récupération sur place",
      returnLocation: formData.deliveryOption ? formData.dropoffLocation : "Récupération sur place",
      totalPrice: newTotalPrice,
      notes: formData.notes,
      driverLicenseNumber: formData.driverLicenseNumber || "",
      driverLicenseDate: formData.driverLicenseDate || "",
    };

    console.log('Booking à envoyer:', newBooking);

    // Envoyer à l'API
    fetch(`${API_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newBooking),
    })
      .then(res => {
        console.log('Réponse API - Status:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('Réponse API - Data:', data);
        if (data.error) {
          alert('Erreur lors de la création de la réservation: ' + data.error);
        } else {
          // Fermer le formulaire
          onClose();
          // Afficher un message de succès
          alert("Votre demande de réservation a été envoyée avec succès ! Vous serez contacté sous peu.");
        }
      })
      .catch(err => {
        console.error('Erreur API:', err);
        alert("Erreur lors de l'envoi de la réservation. Veuillez réessayer.");
      });
  };

  if (!car) return null;

  const getSummaryPrice = () => {
    const daysCount = getDaysCount(formData.startDate, formData.endDate);
    if (daysCount === 0) return 0;
    
    let basePrice = 0;
    if (daysCount === 3) {
      basePrice = 250;
    } else {
      basePrice = daysCount * car.price;
    }
    
    // Les frais de livraison seront calculés par l'administrateur après la réservation
    const deliveryFee = 0;
    return basePrice + deliveryFee;
  };

  const totalPrice = getSummaryPrice();
  const days = getDaysCount(formData.startDate, formData.endDate);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {!isAuthenticated ? "Connexion requise" : `Réserver ${car.brand} ${car.model}`}
          </DialogTitle>
        </DialogHeader>

        {!isAuthenticated ? (
          <div className="py-8 flex flex-col items-center text-center space-y-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Créez un compte pour réserver</h3>
              <p className="text-muted-foreground max-w-sm">
                Pour effectuer une réservation, vous devez être connecté à votre compte client Choptaloc.
              </p>
            </div>
            <div className="flex flex-col w-full gap-3 pt-4">
              <Button 
                onClick={() => navigate("/client-auth?mode=login")} 
                className="w-full flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Se connecter
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate("/client-auth?mode=register")} 
                className="w-full flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Créer un compte
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Informations personnelles */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Informations personnelles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className={errors.firstName ? "border-red-500" : ""}
                />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className={errors.lastName ? "border-red-500" : ""}
                />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <Label htmlFor="phone">Téléphone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
              <div>
                <Label htmlFor="driverLicenseNumber">Numéro de permis (optionnel)</Label>
                <Input
                  id="driverLicenseNumber"
                  value={formData.driverLicenseNumber}
                  onChange={(e) => setFormData({ ...formData, driverLicenseNumber: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="driverLicenseDate">Date d'obtention (optionnel)</Label>
                <Input
                  id="driverLicenseDate"
                  type="date"
                  value={formData.driverLicenseDate}
                  onChange={(e) => setFormData({ ...formData, driverLicenseDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Dates et lieux */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Dates et lieux
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Date de début *</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => {
                    setFormData({ ...formData, startDate: e.target.value });
                  }}
                  className={errors.startDate ? "border-red-500" : ""}
                />
                {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
              </div>
              <div>
                <Label>Date de fin *</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => {
                    setFormData({ ...formData, endDate: e.target.value });
                  }}
                  className={errors.endDate ? "border-red-500" : ""}
                />
                {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
              </div>
              <div>
                <Label>Heure de récupération</Label>
                <Input
                  type="time"
                  value={formData.pickupTime}
                  onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
                />
              </div>
              <div>
                <Label>Heure de retour</Label>
                <Input
                  type="time"
                  value={formData.dropoffTime}
                  onChange={(e) => setFormData({ ...formData, dropoffTime: e.target.value })}
                />
              </div>
            </div>

            {/* Option livraison */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="deliveryOption"
                checked={formData.deliveryOption}
                onChange={(e) => setFormData({ ...formData, deliveryOption: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="deliveryOption" className="cursor-pointer">
                Option livraison
              </Label>
              <div className="relative group">
                <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  Le coût de la livraison sera calculé par l'administrateur en fonction de la distance, de l'heure et de la disponibilité
                </div>
              </div>
            </div>

            {/* Champs d'adresse conditionnels */}
            {formData.deliveryOption && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <Label>Lieu de récupération *</Label>
                  <Input
                    placeholder="Adresse de récupération"
                    value={formData.pickupLocation}
                    onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                    className={errors.pickupLocation ? "border-red-500" : ""}
                  />
                  {errors.pickupLocation && <p className="text-red-500 text-xs mt-1">{errors.pickupLocation}</p>}
                </div>
                <div>
                  <Label>Lieu de retour *</Label>
                  <Input
                    placeholder="Adresse de retour"
                    value={formData.dropoffLocation}
                    onChange={(e) => setFormData({ ...formData, dropoffLocation: e.target.value })}
                    className={errors.dropoffLocation ? "border-red-500" : ""}
                  />
                  {errors.dropoffLocation && <p className="text-red-500 text-xs mt-1">{errors.dropoffLocation}</p>}
                </div>
              </div>
            )}
          </div>

          {/* Récapitulatif */}
          <div className="bg-secondary/30 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold">Récapitulatif</h3>
            <div className="flex justify-between text-sm">
              <span>Véhicule :</span>
              <span className="font-medium">{car.brand} {car.model}</span>
            </div>
            {formData.startDate && formData.endDate && (() => {
              const days = getDaysCount(formData.startDate, formData.endDate);
              if (days === 0) return null;
              
              let basePrice = car.price;
              let totalPrice = 0;
              let priceType = "journalier";

              if (days === 3) {
                totalPrice = 250;
                basePrice = 250 / 3;
                priceType = "forfait 3 jours (72h)";
              } else if (days >= 7 && car.weeklyPrice) {
                const weeks = Math.floor(days / 7);
                const remainingDays = days % 7;
                totalPrice = weeks * car.weeklyPrice + remainingDays * car.price;
                basePrice = totalPrice / days;
                priceType = "hebdomadaire";
              } else if (days >= 30 && car.monthlyPrice) {
                const months = Math.floor(days / 30);
                const remainingDays = days % 30;
                totalPrice = months * car.monthlyPrice + remainingDays * car.price;
                basePrice = totalPrice / days;
                priceType = "mensuel";
              } else {
                totalPrice = days * car.price;
              }

              const deliveryFee = 0;
              const finalPrice = totalPrice + deliveryFee;
              const regularPrice = (days * car.price) + deliveryFee;
              const discount = regularPrice - finalPrice;

              return (
                <>
                  <div className="flex justify-between text-sm">
                    <span>Durée :</span>
                    <span className="font-medium">{days} jour(s)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tarif appliqué :</span>
                    <span className="font-medium">{priceType}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Prix moyen / jour :</span>
                    <span className="font-medium">{basePrice.toFixed(2)}€</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Réduction :</span>
                      <span className="font-medium">-{discount.toFixed(2)}€</span>
                    </div>
                  )}
                  {formData.deliveryOption && (
                    <div className="flex justify-between text-sm">
                      <span>Livraison :</span>
                      <span className="font-medium text-orange-600">Calculé par l'administrateur</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total estimé :</span>
                    <span className="text-gradient-orange">{finalPrice.toFixed(2)}€</span>
                  </div>
                  {formData.deliveryOption && (
                    <div className="text-xs text-muted-foreground mt-2">
                      * Le coût de livraison sera ajouté par l'administrateur après confirmation de la réservation
                    </div>
                  )}
                </>
              );
            })()}
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes additionnelles (optionnel)</Label>
            <Input
              id="notes"
              placeholder="Demandes spéciales, préférences..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" className="flex-1">
              Confirmer la réservation
            </Button>
          </div>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingForm;
