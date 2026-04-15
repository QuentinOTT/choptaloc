import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, MapPin, CreditCard, User, Phone, Mail, Car, X } from "lucide-react";
import { useClientAuth } from "@/hooks/use-client-auth";
import { API_URL } from "@/config/api";

interface Car {
  id: string;
  brand: string;
  model: string;
  price: number;
  weeklyPrice?: number;
  monthlyPrice?: number;
  image: string;
  tag?: string;
  specs?: string[];
}

interface BookingFormProps {
  car: Car | null;
  isOpen: boolean;
  onClose: () => void;
  selectedDates: string[];
}

const BookingForm = ({ car, isOpen, onClose, selectedDates }: BookingFormProps) => {
  const { user } = useClientAuth();
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
    if (!formData.driverLicenseNumber.trim()) newErrors.driverLicenseNumber = "Le numéro de permis est requis";
    if (!formData.driverLicenseDate) newErrors.driverLicenseDate = "La date du permis est requise";
    if (formData.deliveryOption) {
      if (!formData.pickupLocation.trim()) newErrors.pickupLocation = "Le lieu de récupération est requis";
      if (!formData.dropoffLocation.trim()) newErrors.dropoffLocation = "Le lieu de retour est requis";
    }
    if (!formData.startDate) newErrors.startDate = "La date de début est requise";
    if (!formData.endDate) newErrors.endDate = "La date de fin est requise";

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

    console.log('Dates calculées:', dates);

    // Calculer le prix total avec prix dégressif
    const days = dates.length;
    let totalPrice = days * car.price;
    if (days >= 7 && car.weeklyPrice) {
      const weeks = Math.floor(days / 7);
      const remainingDays = days % 7;
      totalPrice = weeks * car.weeklyPrice + remainingDays * car.price;
    } else if (days >= 30 && car.monthlyPrice) {
      const months = Math.floor(days / 30);
      const remainingDays = days % 30;
      totalPrice = months * car.monthlyPrice + remainingDays * car.price;
    }

    const deliveryFee = formData.deliveryOption ? 30 : 0;
    const newTotalPrice = totalPrice + deliveryFee;

    // Créer la réservation avec userId si un client est connecté
    const newBooking: any = {
      carId: car.id,
      startDate: formData.startDate,
      endDate: formData.endDate,
      pickupLocation: formData.deliveryOption ? formData.pickupLocation : "Récupération sur place",
      returnLocation: formData.deliveryOption ? formData.dropoffLocation : "Récupération sur place",
      totalPrice: newTotalPrice,
      notes: formData.notes,
      driverLicenseNumber: formData.driverLicenseNumber,
      driverLicenseDate: formData.driverLicenseDate,
    };

    // Ajouter userId si un client est connecté
    if (user) {
      newBooking.userId = user.id;
    }

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

  const days = selectedDates.length;
  const totalPrice = days * car.price;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Réserver {car.brand} {car.model}</DialogTitle>
        </DialogHeader>

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
            </div>
          </div>

          {/* Permis de conduire */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Permis de conduire
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="driverLicenseNumber">Numéro de permis *</Label>
                <Input
                  id="driverLicenseNumber"
                  value={formData.driverLicenseNumber}
                  onChange={(e) => setFormData({ ...formData, driverLicenseNumber: e.target.value })}
                  className={errors.driverLicenseNumber ? "border-red-500" : ""}
                />
                {errors.driverLicenseNumber && <p className="text-red-500 text-xs mt-1">{errors.driverLicenseNumber}</p>}
              </div>
              <div>
                <Label htmlFor="driverLicenseDate">Date d'obtention *</Label>
                <Input
                  id="driverLicenseDate"
                  type="date"
                  value={formData.driverLicenseDate}
                  onChange={(e) => setFormData({ ...formData, driverLicenseDate: e.target.value })}
                  className={errors.driverLicenseDate ? "border-red-500" : ""}
                />
                {errors.driverLicenseDate && <p className="text-red-500 text-xs mt-1">{errors.driverLicenseDate}</p>}
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
                Option livraison (+30€)
              </Label>
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
              const days = Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
              let basePrice = car.price;
              let priceType = "journalier";

              if (days >= 7 && car.weeklyPrice) {
                basePrice = car.weeklyPrice / 7;
                priceType = "hebdomadaire";
              }
              if (days >= 30 && car.monthlyPrice) {
                basePrice = car.monthlyPrice / 30;
                priceType = "mensuel";
              }

              const deliveryFee = formData.deliveryOption ? 30 : 0;
              const totalPrice = (days * basePrice) + deliveryFee;
              const regularPrice = days * car.price + deliveryFee;
              const discount = regularPrice - totalPrice;

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
                    <span>Prix par jour :</span>
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
                      <span className="font-medium">30€</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total :</span>
                    <span className="text-gradient-orange">{totalPrice.toFixed(2)}€</span>
                  </div>
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
      </DialogContent>
    </Dialog>
  );
};

export default BookingForm;
