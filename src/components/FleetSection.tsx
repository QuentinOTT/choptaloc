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
    specs: ["145 cv", "Automatique", "5 places", "Hybride"],
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

import { useSettings } from "@/context/SettingsContext";

const FleetSection = () => {
  const { settings } = useSettings();
  const globalDiscount = parseFloat(settings.global_discount) || 0;
  const isVacation = settings.vacation_mode === 'true';

  const calculateDiscountedPrice = (price: number) => {
    if (globalDiscount <= 0) return price;
    return Math.round(price * (1 - globalDiscount / 100));
  };

  const [cars, setCars] = useState(defaultCars);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedCar, setSelectedCar] = useState<typeof defaultCars[0] | null>(null);
  // Calendrier par voiture : carId -> { month, year }
  const [carCalendarMonths, setCarCalendarMonths] = useState<Record<string, { month: number; year: number }>>({});
  const [expandedCalendarCarId, setExpandedCalendarCarId] = useState<string | null>(null);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [calendarCar, setCalendarCar] = useState<typeof defaultCars[0] | null>(null);
  const [showUnavailableCars, setShowUnavailableCars] = useState(() => {
    return localStorage.getItem('showUnavailableCars') === 'true';
  });
  const [forceUpdate, setForceUpdate] = useState(0);
  const { getMonthAvailabilities, blockDatesForBooking, setAvailabilities } = useAvailabilities();

  // Écouter les changements de localStorage pour mettre à jour l'état
  useEffect(() => {
    const handleStorageChange = () => {
      setShowUnavailableCars(localStorage.getItem('showUnavailableCars') === 'true');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Obtenir le mois/année du calendrier d'une voiture
  const getCarCalendar = (carId: string) => {
    return carCalendarMonths[carId] || { month: new Date().getMonth(), year: new Date().getFullYear() };
  };

  const setCarCalendar = (carId: string, month: number, year: number) => {
    setCarCalendarMonths(prev => ({ ...prev, [carId]: { month, year } }));
  };
  
  // Charger les véhicules depuis l'API
  useEffect(() => {
    fetch(`${API_URL}/cars`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const mappedCars = data.map((car: any) => {
            const hasValidImage = car.image_url && (car.image_url.startsWith('http') || car.image_url.startsWith('data:image'));
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
              price_24h: car.price_24h ? parseFloat(car.price_24h) : undefined,
              price_48h: car.price_48h ? parseFloat(car.price_48h) : undefined,
              price_48h_wk: car.price_48h_wk ? parseFloat(car.price_48h_wk) : undefined,
              price_72h_wk: car.price_72h_wk ? parseFloat(car.price_72h_wk) : undefined,
              price_mon_fri: car.price_mon_fri ? parseFloat(car.price_mon_fri) : undefined,
              weekendPrice: car.weekend_price ? parseFloat(car.weekend_price) : undefined,
              weeklyPrice: car.weekly_price ? parseFloat(car.weekly_price) : undefined,
              monthlyPrice: car.monthly_price ? parseFloat(car.monthly_price) : undefined,
              image: hasValidImage ? car.image_url : getDefaultImage(car.brand),
              specs: Array.isArray(parsedSpecs) ? parsedSpecs : [],
            };
          });
          const sortedMappedCars = mappedCars.sort((a: any, b: any) => Number(b.available) - Number(a.available));
          setCars(sortedMappedCars);
        } else {
          const sortedDefaultCars = [...defaultCars].sort((a, b) => Number(b.available) - Number(a.available));
          setCars(sortedDefaultCars);
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
      .then((response: any) => {
        console.log('Réponse API complète:', response);
        // L'API renvoie { data: [], pagination: {} }
        const data = response.data || response;
        console.log('Réservations récupérées:', data.length);
        if (!Array.isArray(data)) return;
        const filteredBookings = data.filter(b => b.status === 'confirmed');
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

            {/* Cartes véhicules avec calendrier individuel */}
            <div className="flex flex-col gap-6">
              {displayedCars.map((car, index) => {
                const carCal = getCarCalendar(car.id?.toString() || index.toString());
                const carId = car.id?.toString() || index.toString();
                const isCalendarOpen = expandedCalendarCarId === carId;
                const _ = forceUpdate;
                const monthAvailabilities = getMonthAvailabilities(carId, carCal.year, carCal.month);

                return (
                  <div key={`${car.brand}-${car.model}-${index}`} className="group">
                    <div
                      className="relative glass rounded-2xl overflow-hidden hover-glow-orange cursor-pointer"
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      onClick={() => setSelectedCar(car)}
                    >
                      <div className="flex flex-col md:flex-row">
                        {/* Image */}
                        <div className="relative md:w-72 h-48 md:h-auto overflow-hidden flex-shrink-0">
                          <img
                            src={car.image}
                            alt={`${car.brand} ${car.model}`}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-background/20" />
                        </div>

                        {/* Infos */}
                        <div className="flex-1 p-4 md:p-6 flex flex-col justify-between">
                          <div>
                            <div className="mb-3">
                              <h3 className="text-lg md:text-xl font-bold mb-1">{car.brand} {car.model}</h3>
                              <p className="text-muted-foreground text-xs md:text-sm">{car.tag}</p>
                              {(car as any).description && (
                                <p className="text-muted-foreground text-xs mt-2 line-clamp-2">{(car as any).description}</p>
                              )}
                            </div>

                            <div className="flex items-center gap-3 mb-3">
                              <div className="flex items-baseline gap-1">
                                <span className="text-2xl md:text-3xl font-black text-gradient-orange">
                                  {calculateDiscountedPrice(car.price)}€
                                </span>
                                <span className="text-muted-foreground text-xs">/jour</span>
                              </div>
                              {globalDiscount > 0 && (
                                <span className="text-xs line-through text-muted-foreground decoration-red-500/50">{car.price}€</span>
                              )}
                              {globalDiscount > 0 && (
                                <Badge className="bg-green-500 hover:bg-green-500 text-[10px] py-0 h-5">-{globalDiscount}%</Badge>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-2 mb-4">
                              {car.specs.map((spec) => (
                                <span key={spec} className="px-2 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">{spec}</span>
                              ))}
                            </div>
                          </div>

                          <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => setSelectedCar(car)}
                              className="flex-1 text-center py-2 md:py-3 rounded-lg font-semibold transition-all duration-300 text-xs md:text-sm bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            >
                              Détails
                            </button>
                            {car.available && !isVacation ? (
                              <button
                                onClick={() => {
                                  setCalendarCar(car);
                                  setExpandedCalendarCarId(isCalendarOpen ? null : carId);
                                  setSelectedDates([]);
                                }}
                                className={`flex-1 text-center py-2 md:py-3 rounded-xl font-bold transition-all duration-300 text-xs md:text-sm ${
                                  isCalendarOpen
                                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                                    : 'bg-primary/90 text-primary-foreground hover:bg-primary'
                                }`}
                              >
                                {isCalendarOpen ? '✕ Fermer' : '📅 Réserver'}
                              </button>
                            ) : (
                              <button disabled className="flex-1 text-center py-2 md:py-3 rounded-xl font-semibold text-xs md:text-sm bg-muted text-muted-foreground cursor-not-allowed border border-dashed border-muted-foreground/30">
                                {isVacation ? 'Agence en pause' : 'Indisponible'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Calendrier individuel inline */}
                    {isCalendarOpen && car.available && !isVacation && (
                      <div className="mt-2 glass rounded-2xl p-4 md:p-6 border border-primary/20 animate-in slide-in-from-top-2 duration-200">
                        <div className="flex flex-col md:flex-row gap-6">
                          {/* Calendrier */}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-primary" />
                                <span className="font-semibold text-sm">Disponibilités — {car.brand} {car.model}</span>
                              </div>
                              <button onClick={loadBookings} className="p-1.5 hover:bg-secondary rounded-lg transition-colors text-xs" title="Recharger">
                                🔄
                              </button>
                            </div>

                            <div className="flex items-center justify-between mb-3">
                              <button
                                className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
                                onClick={() => {
                                  const { month, year } = carCal;
                                  if (month === 0) setCarCalendar(carId, 11, year - 1);
                                  else setCarCalendar(carId, month - 1, year);
                                }}
                              >←</button>
                              <span className="font-semibold text-xs md:text-sm">
                                {new Date(carCal.year, carCal.month).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                              </span>
                              <button
                                className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
                                onClick={() => {
                                  const { month, year } = carCal;
                                  if (month === 11) setCarCalendar(carId, 0, year + 1);
                                  else setCarCalendar(carId, month + 1, year);
                                }}
                              >→</button>
                            </div>

                            <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
                              {['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'].map(d => (
                                <div key={d} className="text-[10px] text-muted-foreground font-medium py-1">{d}</div>
                              ))}
                            </div>
                            <div className="grid grid-cols-7 gap-x-0.5 gap-y-1 justify-items-center">
                              {(() => {
                                const firstDay = new Date(carCal.year, carCal.month, 1);
                                const lastDay = new Date(carCal.year, carCal.month + 1, 0);
                                const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
                                const daysInMonth = lastDay.getDate();
                                const days = [];
                                for (let i = 0; i < startDay; i++) days.push(<div key={`p-${i}`} className="w-8 h-8" />);
                                for (let day = 1; day <= daysInMonth; day++) {
                                  const dateStr = `${carCal.year}-${String(carCal.month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                                  const isAvail = monthAvailabilities.get(dateStr) ?? true;
                                  const isSelected = selectedDates.includes(dateStr);
                                  const today = new Date(); today.setHours(0,0,0,0);
                                  const d = new Date(dateStr); d.setHours(0,0,0,0);
                                  const isPast = d < today;
                                  const sortedSel = [...selectedDates].sort();
                                  const isStart = isSelected && sortedSel[0] === dateStr;
                                  const isEnd = isSelected && sortedSel[sortedSel.length-1] === dateStr;
                                  days.push(
                                    <div
                                      key={day}
                                      onClick={() => {
                                        if (!isAvail || isPast) return;
                                        if (selectedDates.length === 0) { setSelectedDates([dateStr]); return; }
                                        if (selectedDates.includes(dateStr)) {
                                          if ((isStart || isEnd) && selectedDates.length > 1) setSelectedDates([dateStr]);
                                          return;
                                        }
                                        const clicked = new Date(dateStr);
                                        const s = new Date(sortedSel[0]);
                                        const e = new Date(sortedSel[sortedSel.length-1]);
                                        let ns = clicked < s ? clicked : s;
                                        let ne = clicked > e ? clicked : e;
                                        const range: string[] = [];
                                        const cur = new Date(ns);
                                        let blocked = false;
                                        while (cur <= ne) {
                                          const ds = `${cur.getFullYear()}-${String(cur.getMonth()+1).padStart(2,'0')}-${String(cur.getDate()).padStart(2,'0')}`;
                                          if (!(monthAvailabilities.get(ds) ?? true)) { blocked = true; break; }
                                          range.push(ds);
                                          cur.setDate(cur.getDate()+1);
                                        }
                                        setSelectedDates(blocked ? [dateStr] : range);
                                      }}
                                      className={`w-8 h-8 flex items-center justify-center rounded-full text-[10px] font-medium cursor-pointer transition-colors ${
                                        isPast ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-40'
                                        : isSelected ? (isStart || isEnd ? 'bg-primary text-white ring-2 ring-primary ring-offset-2' : 'bg-primary text-white')
                                        : isAvail ? 'bg-primary/80 text-primary-foreground hover:bg-primary'
                                        : 'bg-gray-800 text-gray-400 cursor-not-allowed opacity-50'
                                      }`}
                                    >{day}</div>
                                  );
                                }
                                const total = startDay + daysInMonth;
                                const rem = total > 35 ? 42 - total : 35 - total;
                                for (let i = 0; i < rem; i++) days.push(<div key={`n-${i}`} className="w-8 h-8" />);
                                return days;
                              })()}
                            </div>

                            <div className="flex items-center gap-4 mt-3 text-[10px]">
                              <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-primary" /><span className="text-muted-foreground">Disponible</span></div>
                              <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-gray-800" /><span className="text-muted-foreground">Indisponible</span></div>
                              {selectedDates.length > 0 && <span className="ml-auto text-primary font-medium">{selectedDates.length} jour(s)</span>}
                            </div>
                          </div>

                          {/* Bouton confirmer */}
                          <div className="flex flex-col justify-center gap-3 min-w-[160px]">
                            <p className="text-xs text-muted-foreground">Sélectionnez vos dates sur le calendrier puis confirmez la réservation.</p>
                            <button
                              disabled={selectedDates.length === 0}
                              onClick={() => {
                                setCalendarCar(car);
                                setShowBookingForm(true);
                              }}
                              className="w-full py-3 px-4 rounded-xl font-bold bg-primary text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-all text-sm"
                            >
                              Confirmer les dates →
                            </button>
                            {selectedDates.length > 0 && (
                              <button
                                onClick={() => setSelectedDates([])}
                                className="w-full py-2 px-4 rounded-xl text-xs text-muted-foreground hover:bg-secondary transition-all"
                              >Effacer la sélection</button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
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
                      loading="lazy"
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
        car={selectedCar ? {
          ...selectedCar,
          weekendPrice: selectedCar.weekendPrice,
          weeklyPrice: selectedCar.weeklyPrice,
          monthlyPrice: selectedCar.monthlyPrice
        } : null}
        isOpen={!!selectedCar}
        onClose={() => setSelectedCar(null)}
        onReserve={() => {
          if (selectedCar) {
            setCalendarCar(selectedCar);
            setShowBookingForm(true);
            setSelectedCar(null);
          }
        }}
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
