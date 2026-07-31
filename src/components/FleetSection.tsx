import { useState, useEffect } from "react";
import { Calendar, ChevronDown, Check } from "lucide-react";
import mercedesImg from "@/assets/Mercedesbachée.png";
import golfImg from "@/assets/goldbachée.png";
import audiImg from "@/assets/Rs3bachée.png";
import clioImg from "@/assets/ClioVbleu.png";
import { API_URL } from "@/config/api";
import CarModal from "@/components/CarModal";
import BookingForm from "@/components/BookingForm";
import { useAvailabilities } from "@/hooks/use-availabilities";
import { Badge } from "@/components/ui/badge";
import { useSettings } from "@/context/SettingsContext";

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
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
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

  // Charger les véhicules depuis l'API
  useEffect(() => {
    fetch(`${API_URL}/cars`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const mappedCars = data.map((car: any) => {
            const hasValidImage = car.image_url && (car.image_url.startsWith('http') || car.image_url.startsWith('data:image'));
            let parsedSpecs = car.specs;
            if (typeof car.specs === 'string') {
              try {
                parsedSpecs = JSON.parse(car.specs);
              } catch (e) {
                parsedSpecs = [];
              }
            }
            let parsedFeatures = car.features;
            if (typeof car.features === 'string') {
              try { parsedFeatures = JSON.parse(car.features); } catch (e) { parsedFeatures = []; }
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
              caution_amount: car.caution_amount ? parseFloat(car.caution_amount) : undefined,
              min_license_years: car.min_license_years ? parseInt(car.min_license_years) : undefined,
              description: car.description || undefined,
              features: Array.isArray(parsedFeatures) ? parsedFeatures : [],
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

  // Charger les réservations pour bloquer les dates dans le calendrier
  const loadBookings = () => {
    setAvailabilities([]);
    
    fetch(`${API_URL}/bookings?limit=1000`)
      .then(res => res.json())
      .then((response: any) => {
        const data = Array.isArray(response) ? response : (response.data || []);
        if (!Array.isArray(data)) return;

        const activeBookings = data.filter((b: any) => {
          const st = (b.status || '').toString().toLowerCase();
          return st === 'confirmed' || st === 'pending' || st === 'confirmée' || st === 'en attente';
        });
        
        activeBookings.forEach((b: any) => {
          const carId = (b.car_id || b.carId || '').toString();
          
          let startRaw = b.start_date || b.startDate;
          let endRaw = b.end_date || b.endDate;
          
          if (carId && startRaw && endRaw) {
            const startStr = typeof startRaw === 'string' ? startRaw.slice(0, 10) : new Date(startRaw).toISOString().slice(0, 10);
            const endStr = typeof endRaw === 'string' ? endRaw.slice(0, 10) : new Date(endRaw).toISOString().slice(0, 10);
            
            blockDatesForBooking(carId, startStr, endStr);
          }
        });
        
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
              {/* Carte véhicule (gauche) */}
              <div className="flex-1 max-w-2xl space-y-6">
                {displayedCars.map((car, index) => {
                  const isSelectedForCalendar = calendarCar?.id === car.id;

                  return (
                    <div
                      key={`${car.brand}-${car.model}-${index}`}
                      className={`group relative glass rounded-2xl overflow-hidden hover-glow-orange cursor-pointer transition-all duration-300 ${
                        isSelectedForCalendar ? 'ring-2 ring-primary shadow-lg shadow-primary/20' : ''
                      }`}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      onClick={() => {
                        setCalendarCar(car);
                        setSelectedDates([]);
                      }}
                    >
                      <div className="relative h-48 md:h-56 lg:h-64 overflow-hidden">
                        <img
                          src={car.image}
                          alt={`${car.brand} ${car.model}`}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                        
                        {isSelectedForCalendar && (
                          <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                            <Check className="w-3.5 h-3.5" /> Sélectionné
                          </div>
                        )}
                      </div>

                      <div className="p-4 md:p-6">
                        <div className="mb-3 md:mb-4">
                          <h3 className="text-lg md:text-xl font-bold mb-1">{car.brand} {car.model}</h3>
                          <p className="text-muted-foreground text-xs md:text-sm">{car.tag}</p>
                          {(car as any).description && (
                            <p className="text-muted-foreground text-xs mt-2 line-clamp-2">{(car as any).description}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-3 mb-3 md:mb-4">
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl md:text-3xl font-black text-gradient-orange">
                              {calculateDiscountedPrice(car.price)}€
                            </span>
                            <span className="text-muted-foreground text-xs md:text-sm">/jour</span>
                          </div>
                          {globalDiscount > 0 && (
                            <span className="text-xs line-through text-muted-foreground decoration-red-500/50">
                              {car.price}€
                            </span>
                          )}
                          {globalDiscount > 0 && (
                            <Badge className="bg-green-500 hover:bg-green-500 text-[10px] py-0 h-5">
                              -{globalDiscount}%
                            </Badge>
                          )}
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
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCar(car);
                            }}
                            className="flex-1 text-center py-2 md:py-3 rounded-lg font-semibold transition-all duration-300 text-xs md:text-sm bg-secondary text-secondary-foreground hover:bg-secondary/80"
                          >
                            Détails
                          </button>
                          {car.available && !isVacation ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setCalendarCar(car);
                                setShowBookingForm(true);
                              }}
                              className="flex-1 text-center py-2 md:py-3 rounded-xl font-bold transition-all duration-300 text-xs md:text-sm bg-primary/90 hover:bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                            >
                              Réserver
                            </button>
                          ) : (
                            <button
                              disabled
                              className="flex-1 text-center py-2 md:py-3 rounded-xl font-semibold transition-all duration-300 text-xs md:text-sm bg-muted text-muted-foreground cursor-not-allowed border border-dashed border-muted-foreground/30"
                            >
                              {isVacation ? "Agence en pause" : "Indisponible"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Calendrier à droite (exactement le design d'origine) */}
              <div className="flex-1 glass rounded-2xl p-4 md:p-6 max-w-sm h-fit sticky top-24">
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

                {/* Sélecteur de véhicule dans le calendrier */}
                <div className="mb-4 bg-secondary/40 p-2 rounded-xl border border-border/50">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    Véhicule affiché :
                  </label>
                  <select
                    className="w-full bg-background border border-input rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                    value={calendarCar?.id || ""}
                    onChange={(e) => {
                      const found = cars.find(c => c.id.toString() === e.target.value);
                      if (found) {
                        setCalendarCar(found);
                        setSelectedDates([]);
                      }
                    }}
                  >
                    {cars.map((car) => (
                      <option key={car.id} value={car.id}>
                        {car.brand} {car.model} ({car.available ? 'Disponible' : 'Indisponible'})
                      </option>
                    ))}
                  </select>
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
                    const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
                    const daysInMonth = lastDay.getDate();
                    const monthAvailabilities = calendarCar ? getMonthAvailabilities(calendarCar.id, currentYear, currentMonth) : new Map();
                    const _ = forceUpdate;
                    
                    const days = [];
                    for (let i = 0; i < startDay; i++) {
                      days.push(<div key={`prev-${i}`} className="w-7 md:w-9 h-7 md:h-9" />);
                    }
                    for (let day = 1; day <= daysInMonth; day++) {
                      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const isAvailable = monthAvailabilities.get(dateStr) ?? true;
                      const isSelected = selectedDates.includes(dateStr);
                      
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const currentDate = new Date(dateStr);
                      currentDate.setHours(0, 0, 0, 0);
                      const isPastDate = currentDate < today;
                      
                      const sortedDates = [...selectedDates].sort();
                      const isStart = isSelected && sortedDates[0] === dateStr;
                      const isEnd = isSelected && sortedDates[sortedDates.length - 1] === dateStr;
                      
                      days.push(
                        <div
                          key={day}
                          onClick={() => {
                            if (!isAvailable || !calendarCar || isPastDate) return;
                            
                            if (selectedDates.length === 0) {
                              setSelectedDates([dateStr]);
                              return;
                            }
                            
                            if (selectedDates.includes(dateStr)) {
                              if ((isStart || isEnd) && selectedDates.length > 1) {
                                setSelectedDates([dateStr]);
                              }
                              return;
                            }
                            
                            const clickedDate = new Date(dateStr);
                            const currentStart = new Date(sortedDates[0]);
                            const currentEnd = new Date(sortedDates[sortedDates.length - 1]);
                            
                            let newStart: Date;
                            let newEnd: Date;
                            
                            if (clickedDate < currentStart) {
                              newStart = clickedDate;
                              newEnd = currentEnd;
                            } else if (clickedDate > currentEnd) {
                              newStart = currentStart;
                              newEnd = clickedDate;
                            } else {
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
                              ? 'bg-primary text-primary-foreground hover:bg-primary/80'
                              : 'bg-gray-800 text-gray-400 cursor-not-allowed opacity-50'
                          }`}
                        >
                          {day}
                        </div>
                      );
                    }
                    const totalCells = startDay + daysInMonth;
                    const remainingCells = totalCells > 35 ? 42 - totalCells : 35 - totalCells;
                    for (let i = 0; i < remainingCells; i++) {
                      days.push(<div key={`next-${i}`} className="w-7 md:w-9 h-7 md:h-9" />);
                    }
                    
                    return days;
                  })()}
                </div>

                {/* Légende & Action */}
                <div className="space-y-3 mt-3 md:mt-4">
                  <div className="flex items-center gap-2 md:gap-4 text-[10px] md:text-xs">
                    <div className="flex items-center gap-1 md:gap-2">
                      <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-primary" />
                      <span className="text-muted-foreground">Disponible</span>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2">
                      <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-gray-800" />
                      <span className="text-muted-foreground">Indisponible</span>
                    </div>
                  </div>

                  {selectedDates.length > 0 && calendarCar && (
                    <div className="pt-2 border-t border-border/50">
                      <p className="text-xs text-primary font-semibold mb-2">
                        {selectedDates.length} jour(s) sélectionné(s) pour {calendarCar.brand} {calendarCar.model}
                      </p>
                      <button
                        onClick={() => setShowBookingForm(true)}
                        className="w-full py-2.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
                      >
                        Réserver avec ces dates →
                      </button>
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
