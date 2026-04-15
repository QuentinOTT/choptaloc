import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import mercedesImg from "@/assets/Mercedesbachée.png";
import golfImg from "@/assets/goldbachée.png";
import audiImg from "@/assets/Rs3bachée.png";
import clioImg from "@/assets/ClioVbleu.png";
import { API_URL } from "@/config/api";
import CarModal from "@/components/CarModal";
import BookingForm from "@/components/BookingForm";
import { useAvailabilities } from "@/hooks/use-availabilities";

const defaultCars = [
  {
    id: "1",
    brand: "Mercedes",
    model: "Classe A",
    tag: "Élégante & Compacte",
    price: 89,
    weeklyPrice: 534,
    monthlyPrice: 2280,
    image: mercedesImg,
    specs: ["136 ch", "Automatique", "5 places", "Diesel"],
    available: false,
  },
  {
    id: "2",
    brand: "Volkswagen",
    model: "Golf 8 R",
    tag: "Sportive & Puissante",
    price: 129,
    weeklyPrice: 774,
    monthlyPrice: 3300,
    image: golfImg,
    specs: ["320 ch", "DSG 7", "5 places", "Essence"],
    available: false,
  },
  {
    id: "3",
    brand: "Audi",
    model: "RS3",
    tag: "Haute Performance",
    price: 189,
    weeklyPrice: 1134,
    monthlyPrice: 4840,
    image: audiImg,
    specs: ["400 ch", "S-Tronic", "5 places", "Essence"],
    available: false,
  },
  {
    id: "4",
    brand: "Renault",
    model: "Clio V",
    tag: "Pratique & Moderne",
    price: 49,
    weeklyPrice: 294,
    monthlyPrice: 1260,
    image: clioImg,
    specs: ["100 ch", "Manuelle", "5 places", "Essence"],
    available: true,
  },
];

// Fonction pour obtenir l'image par défaut selon la marque
const getDefaultImage = (brand: string) => {
  switch (brand.toLowerCase()) {
    case 'mercedes':
      return mercedesImg;
    case 'volkswagen':
      return golfImg;
    case 'audi':
      return audiImg;
    case 'renault':
      return clioImg;
    default:
      return mercedesImg;
  }
};

const FleetSection = () => {
  const [cars, setCars] = useState(defaultCars);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedCar, setSelectedCar] = useState<typeof defaultCars[0] | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showUnavailableCars, setShowUnavailableCars] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  const { getMonthAvailabilities, blockDatesForBooking, setAvailabilities } = useAvailabilities();

  // Initialiser selectedCar pour le calendrier avec la première voiture disponible
  const [calendarCar, setCalendarCar] = useState<typeof defaultCars[0] | null>(null);
  
  // Charger les véhicules depuis l'API
  useEffect(() => {
    fetch(`${API_URL}/cars`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const mappedCars = data.map((car: any) => {
            const hasValidImage = car.image_url && car.image_url.startsWith('http');
            // Parser les specs JSON si c'est une chaîne
            let parsedSpecs = car.specs;
            if (typeof car.specs === 'string') {
              try {
                parsedSpecs = JSON.parse(car.specs);
              } catch (e) {
                parsedSpecs = [];
              }
            }
            return {
              ...car,
              available: car.is_available,
              price: parseFloat(car.price_per_day) || 0,
              weeklyPrice: car.weekly_price ? parseFloat(car.weekly_price) : undefined,
              monthlyPrice: car.monthly_price ? parseFloat(car.monthly_price) : undefined,
              image: hasValidImage ? car.image_url : getDefaultImage(car.brand),
              specs: Array.isArray(parsedSpecs) ? parsedSpecs : [],
            };
          });
          setCars(mappedCars);
        } else {
          setCars(defaultCars);
        }
      })
      .catch(err => {
        console.error('Erreur chargement véhicules:', err);
        setCars(defaultCars);
      });
  }, []);

  // Charger les réservations confirmées pour bloquer les dates dans le calendrier client
  const loadBookings = () => {
    console.log('Rechargement des disponibilités...');
    // Réinitialiser les disponibilités
    setAvailabilities([]);
    
    fetch(`${API_URL}/bookings`)
      .then(res => res.json())
      .then((data: any[]) => {
        console.log('Réservations récupérées:', data.length);
        if (!Array.isArray(data)) return;
        const filteredBookings = data.filter(b => b.status === 'confirmed' || b.status === 'pending');
        console.log('Réservations filtrées (confirmed/pending):', filteredBookings.length);
        
        filteredBookings.forEach(b => {
          const carId  = b.car_id?.toString();
          const start  = typeof b.start_date === 'string' ? b.start_date.slice(0,10) : new Date(b.start_date).toISOString().slice(0,10);
          const end    = typeof b.end_date   === 'string' ? b.end_date.slice(0,10)   : new Date(b.end_date).toISOString().slice(0,10);
          console.log('Blocage dates pour voiture:', carId, 'du', start, 'au', end);
          if (carId && start && end) {
            blockDatesForBooking(carId, start, end, b.dropoff_time);
          }
        });
        
        // Forcer le re-rendu du calendrier
        setForceUpdate(prev => prev + 1);
      })
      .catch(err => console.error('Erreur chargement réservations calendrier:', err));
  };

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    const availableCars = cars.filter(car => car.available);
    if (availableCars.length > 0 && !calendarCar) {
      setCalendarCar(availableCars[0]);
    }
  }, [cars]);

  const availableCars = cars.filter(car => car.available);
  const upcomingCars = cars.filter(car => !car.available);
  const displayedCars = showUnavailableCars ? cars : availableCars;

  return (
    <section id="fleet" className="py-16 md:py-24 px-4 md:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <p className="text-primary font-semibold tracking-[0.2em] uppercase text-xs md:text-sm mb-2 md:mb-3">Notre Flotte</p>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-black">
            Des Véhicules d'<span className="text-gradient-orange">Exception</span>
          </h2>
        </div>

        {/* Contrôle d'affichage des véhicules */}
        <div className="flex items-center justify-center mb-8 md:mb-12">
          <div className="flex items-center gap-3 bg-secondary/30 rounded-lg p-3 md:p-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showUnavailableCars}
                onChange={(e) => setShowUnavailableCars(e.target.checked)}
                className="w-4 h-4 md:w-5 md:h-5 text-primary rounded focus:ring-primary"
              />
              <span className="text-sm md:text-base font-medium">
                Afficher les véhicules indisponibles
              </span>
            </label>
            <div className="text-xs md:text-sm text-muted-foreground">
              ({showUnavailableCars ? cars.length : availableCars.length} véhicule{showUnavailableCars ? cars.length > 1 ? 's' : '' : availableCars.length > 1 ? 's' : ''})
            </div>
          </div>
        </div>

        {/* Section Véhicules */}
        {displayedCars.length > 0 && (
          <div className="mb-16 md:mb-20">
            <div className="flex items-center gap-3 mb-6 md:mb-8">
              <div className="w-8 md:w-12 h-1 bg-primary rounded-full" />
              <h3 className="text-lg md:text-2xl font-bold">
                {showUnavailableCars ? "Tous nos Véhicules" : "Véhicules Disponibles Maintenant"}
              </h3>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
              {/* Carte véhicule */}
              <div className="flex-1 max-w-2xl">
                {displayedCars.map((car, index) => (
                  <div
                    key={`${car.brand}-${car.model}`}
                    className="group relative glass rounded-2xl overflow-hidden hover-glow-orange cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => setSelectedCar(car)}
                  >
                    <div className="relative h-48 md:h-56 lg:h-64 overflow-hidden">
                      <img
                        src={car.image}
                        alt={`${car.brand} ${car.model}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                    </div>

                    <div className="p-4 md:p-6">
                      <div className="mb-3 md:mb-4">
                        <h3 className="text-lg md:text-xl font-bold mb-1">{car.brand} {car.model}</h3>
                        <p className="text-muted-foreground text-xs md:text-sm">{car.tag}</p>
                      </div>

                      <div className="flex items-baseline gap-2 mb-3 md:mb-4">
                        <span className="text-2xl md:text-3xl font-black text-gradient-orange">{car.price}€</span>
                        <span className="text-muted-foreground text-xs md:text-sm">/jour</span>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3 md:mb-4">
                        {car.specs.map((spec) => (
                          <span
                            key={spec}
                            className="px-2 md:px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>

                      <div className="flex gap-2 md:gap-3">
                        <button
                          onClick={() => setSelectedCar(car)}
                          className={`flex-1 text-center py-2 md:py-3 rounded-lg font-semibold transition-all duration-300 text-xs md:text-sm ${
                            hoveredIndex === index
                              ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                              : "bg-secondary text-secondary-foreground"
                          }`}
                        >
                          Détails
                        </button>
                        {car.available ? (
                          <button
                            onClick={() => {
                              setCalendarCar(car);
                              setShowBookingForm(true);
                            }}
                            className={`flex-1 text-center py-2 md:py-3 rounded-lg font-semibold transition-all duration-300 text-xs md:text-sm ${
                              hoveredIndex === index
                                ? "bg-primary text-primary-foreground glow-orange"
                                : "bg-secondary text-secondary-foreground"
                            }`}
                          >
                            Réserver
                          </button>
                        ) : (
                          <button
                            disabled
                            className="flex-1 text-center py-2 md:py-3 rounded-lg font-semibold transition-all duration-300 text-xs md:text-sm bg-muted text-muted-foreground cursor-not-allowed"
                          >
                            Indisponible
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Calendrier à droite */}
              <div className="flex-1 glass rounded-2xl p-4 md:p-6 max-w-sm">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 md:w-5 h-4 md:h-5 text-primary" />
                    <h4 className="text-base md:text-lg font-semibold">Calendrier de disponibilité</h4>
                  </div>
                  <button
                    onClick={loadBookings}
                    className="p-1.5 md:p-2 hover:bg-secondary rounded-lg transition-colors text-xs md:text-sm"
                    title="Recharger les disponibilités"
                  >
                    🔄
                  </button>
                </div>
                
                {/* Sélecteur de mois */}
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <button 
                    className="p-1.5 md:p-2 hover:bg-secondary rounded-lg transition-colors text-sm md:text-base"
                    onClick={() => {
                      if (currentMonth === 0) {
                        setCurrentMonth(11);
                        setCurrentYear(currentYear - 1);
                      } else {
                        setCurrentMonth(currentMonth - 1);
                      }
                    }}
                  >
                    ←
                  </button>
                  <span className="font-semibold text-xs md:text-sm">
                    {new Date(currentYear, currentMonth).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                  </span>
                  <button 
                    className="p-1.5 md:p-2 hover:bg-secondary rounded-lg transition-colors text-sm md:text-base"
                    onClick={() => {
                      if (currentMonth === 11) {
                        setCurrentMonth(0);
                        setCurrentYear(currentYear + 1);
                      } else {
                        setCurrentMonth(currentMonth + 1);
                      }
                    }}
                  >
                    →
                  </button>
                </div>

                {/* Grille du calendrier */}
                <div className="grid grid-cols-7 gap-0.5 md:gap-1 text-center mb-2">
                  {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
                    <div key={day} className="text-[10px] md:text-xs text-muted-foreground font-medium py-1 md:py-2">{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-x-0.5 gap-y-1 md:gap-y-2 justify-items-center">
                  {(() => {
                    const firstDay = new Date(currentYear, currentMonth, 1);
                    const lastDay = new Date(currentYear, currentMonth + 1, 0);
                    const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Ajuster pour commencer lundi
                    const daysInMonth = lastDay.getDate();
                    const monthAvailabilities = calendarCar ? getMonthAvailabilities(calendarCar.id, currentYear, currentMonth) : new Map();
// Utiliser forceUpdate pour forcer le recalcul quand les disponibilités changent
const _ = forceUpdate;
                    
                    const days = [];
                    // Jours du mois précédent
                    for (let i = 0; i < startDay; i++) {
                      days.push(<div key={`prev-${i}`} className="w-7 md:w-9 h-7 md:h-9" />);
                    }
                    // Jours du mois actuel
                    for (let day = 1; day <= daysInMonth; day++) {
                      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const isAvailable = monthAvailabilities.get(dateStr) ?? true;
                      const isSelected = selectedDates.includes(dateStr);
                      
                      // Vérifier si la date est antérieure à aujourd'hui
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const currentDate = new Date(dateStr);
                      currentDate.setHours(0, 0, 0, 0);
                      const isPastDate = currentDate < today;
                      
                      // Identifier le début et la fin de la sélection
                      const sortedDates = [...selectedDates].sort();
                      const isStart = isSelected && sortedDates[0] === dateStr;
                      const isEnd = isSelected && sortedDates[sortedDates.length - 1] === dateStr;
                      
                      days.push(
                        <div
                          key={day}
                          onClick={() => {
                            if (!isAvailable || !calendarCar || isPastDate) return;
                            
                            // Si c'est la première sélection
                            if (selectedDates.length === 0) {
                              setSelectedDates([dateStr]);
                              return;
                            }
                            
                            // Si on clique sur une date déjà sélectionnée
                            if (selectedDates.includes(dateStr)) {
                              // Si c'est le début ou la fin avec plus d'une date, on garde seulement cette date (reset)
                              if ((isStart || isEnd) && selectedDates.length > 1) {
                                setSelectedDates([dateStr]);
                              }
                              // Si c'est une date au milieu, on ne fait rien (impossible de retirer des dates au milieu)
                              return;
                            }
                            
                            // On veut créer une plage continue
                            const clickedDate = new Date(dateStr);
                            const currentStart = new Date(sortedDates[0]);
                            const currentEnd = new Date(sortedDates[sortedDates.length - 1]);
                            
                            let newStart: Date;
                            let newEnd: Date;
                            
                            // Déterminer les nouvelles bornes
                            if (clickedDate < currentStart) {
                              newStart = clickedDate;
                              newEnd = currentEnd;
                            } else if (clickedDate > currentEnd) {
                              newStart = currentStart;
                              newEnd = clickedDate;
                            } else {
                              // Entre le début et la fin - on étend vers cette date
                              const distToStart = clickedDate.getTime() - currentStart.getTime();
                              const distToEnd = currentEnd.getTime() - clickedDate.getTime();
                              if (distToStart < distToEnd) {
                                newStart = clickedDate;
                                newEnd = currentEnd;
                              } else {
                                newStart = currentStart;
                                newEnd = clickedDate;
                              }
                            }
                            
                            // Vérifier que toutes les dates entre newStart et newEnd sont disponibles
                            const newDates: string[] = [];
                            const current = new Date(newStart);
                            let hasUnavailableDate = false;
                            
                            while (current <= newEnd) {
                              const d = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
                              const available = monthAvailabilities.get(d) ?? true;
                              if (!available) {
                                hasUnavailableDate = true;
                                break;
                              }
                              newDates.push(d);
                              current.setDate(current.getDate() + 1);
                            }
                            
                            if (!hasUnavailableDate && newDates.length > 0) {
                              setSelectedDates(newDates);
                            } else {
                              // Si des dates sont indisponibles, on ne sélectionne que la date cliquée
                              setSelectedDates([dateStr]);
                            }
                          }}
                          className={`w-7 md:w-9 h-7 md:h-9 flex items-center justify-center rounded-full text-[10px] md:text-xs font-medium cursor-pointer transition-colors ${
                            isPastDate
                              ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-40'
                              : isSelected
                              ? isStart || isEnd
                                ? 'bg-primary text-white ring-2 ring-primary ring-offset-2 md:ring-offset-4'
                                : 'bg-primary text-white ring-2 ring-primary ring-offset-1 md:ring-offset-2'
                              : isAvailable
                              ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                              : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                          }`}
                        >
                          {day}
                        </div>
                      );
                    }
                    // Jours du mois suivant
                    const totalCells = startDay + daysInMonth;
                    const remainingCells = totalCells > 35 ? 42 - totalCells : 35 - totalCells;
                    for (let i = 0; i < remainingCells; i++) {
                      days.push(<div key={`next-${i}`} className="w-7 md:w-9 h-7 md:h-9" />);
                    }
                    
                    return days;
                  })()}
                </div>

                {/* Légende */}
                <div className="flex items-center gap-2 md:gap-4 mt-3 md:mt-4 text-[10px] md:text-xs">
                  <div className="flex items-center gap-1 md:gap-2">
                    <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-primary" />
                    <span className="text-muted-foreground">Disponible</span>
                  </div>
                  <div className="flex items-center gap-1 md:gap-2">
                    <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-muted" />
                    <span className="text-muted-foreground">Indisponible</span>
                  </div>
                  {selectedDates.length > 0 && (
                    <div className="flex items-center gap-1 md:gap-2 ml-auto">
                      <span className="text-primary font-medium">{selectedDates.length} jour(s) sélectionné(s)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section Prochains Véhicules */}
        {upcomingCars.length > 0 && !showUnavailableCars && (
          <div>
            <div className="flex items-center gap-3 mb-6 md:mb-8">
              <div className="w-8 md:w-12 h-1 bg-primary rounded-full" />
              <h3 className="text-lg md:text-2xl font-bold">Nos Prochains Véhicules</h3>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {upcomingCars.map((car, index) => (
                <div
                  key={`${car.brand}-${car.model}`}
                  className="group relative glass rounded-2xl overflow-hidden opacity-80"
                >
                  <div className="relative h-48 sm:h-52 md:h-56 overflow-hidden">
                    <img
                      src={car.image}
                      alt={`${car.brand} ${car.model}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 blur-sm"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                  </div>

                  <div className="p-3 md:p-4 text-center">
                    <div className="inline-flex items-center gap-1 md:gap-2 text-primary text-xs md:text-sm">
                      <Calendar className="w-3 md:w-4 h-3 md:h-4" />
                      <span className="font-medium">Arrivée prochaine</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <CarModal 
        car={selectedCar}
        isOpen={!!selectedCar}
        onClose={() => setSelectedCar(null)}
      />
      
      <BookingForm
        car={calendarCar}
        isOpen={showBookingForm}
        onClose={() => setShowBookingForm(false)}
        selectedDates={selectedDates}
      />
    </section>
  );
};

export default FleetSection;
