import { useState } from "react";

interface Car {
  id: string;
  brand: string;
  model: string;
  price: number;
  isAvailable: boolean;
}

interface Booking {
  id: string;
  carId: string;
  startDate: string;
  endDate: string;
  status: string;
  userEmail?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  pickupTime?: string;
  dropoffTime?: string;
}

interface GlobalCalendarProps {
  cars: Car[];
  bookings: Booking[];
}

const GlobalCalendar = ({ cars, bookings }: GlobalCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [hoveredBooking, setHoveredBooking] = useState<Booking | null>(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  
  const today = new Date();
  
  // Obtenir le début de la semaine (lundi)
  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };
  
  // Obtenir les 7 jours de la semaine
  const getWeekDays = (date: Date) => {
    const start = getStartOfWeek(date);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };
  
  // Obtenir tous les jours du mois
  const getMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };
  
  const weekDays = getWeekDays(currentDate);
  const monthDays = getMonthDays(currentDate);
  
  // Obtenir les réservations pour une voiture
  const getBookingsForCar = (carId: string) => {
    return bookings.filter(booking => 
      booking.carId === carId &&
      booking.status !== 'cancelled'
    );
  };
  
  // Obtenir le véhicule pour une réservation
  const getCarForBooking = (booking: Booking) => {
    return cars.find(car => car.id === booking.carId);
  };
  
  // Obtenir le statut du véhicule
  const getCarStatus = (carId: string) => {
    const carBookings = getBookingsForCar(carId);
    const todayStr = today.toISOString().split('T')[0];
    
    const hasActiveBooking = carBookings.some(booking => 
      todayStr >= booking.startDate && todayStr <= booking.endDate
    );
    
    if (hasActiveBooking) return 'LOUÉ';
    return 'DISPO';
  };
  
  // Obtenir la couleur selon le statut
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'DISPO':
        return 'bg-green-500 text-white';
      case 'LOUÉ':
        return 'bg-orange-500 text-white';
      case 'MAINT':
        return 'bg-orange-800 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };
  
  // Obtenir la couleur de la barre selon le statut
  const getBookingBarColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-orange-500';
      case 'pending':
        return 'bg-orange-400';
      case 'completed':
        return 'bg-blue-500';
      case 'cancelled':
        return 'bg-gray-500';
      default:
        return 'bg-orange-500';
    }
  };
  
  // Calculer la position et la largeur d'une barre de réservation (vue hebdomadaire)
  const getBookingBarStyle = (booking: Booking) => {
    const startDate = new Date(booking.startDate);
    const endDate = new Date(booking.endDate);
    const weekStart = getStartOfWeek(currentDate);
    
    const startDiff = Math.max(0, (startDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
    const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    return {
      gridColumnStart: Math.min(8, Math.max(2, startDiff + 2)),
      gridColumnEnd: Math.min(9, Math.max(2, startDiff + 2 + duration)),
    };
  };
  
  // Calculer la position et la largeur d'une barre de réservation (vue mensuelle)
  const getMonthlyBookingBarStyle = (booking: Booking) => {
    const startDate = new Date(booking.startDate);
    const endDate = new Date(booking.endDate);
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    const startDiff = Math.max(0, (startDate.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24));
    const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    return {
      gridColumnStart: Math.min(32, Math.max(2, startDiff + 2)),
      gridColumnEnd: Math.min(33, Math.max(2, startDiff + 2 + duration)),
    };
  };
  
  const previousPeriod = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };
  
  const nextPeriod = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  const handleMouseEnter = (booking: Booking, event: React.MouseEvent) => {
    setHoveredBooking(booking);
    setHoverPosition({ x: event.clientX, y: event.clientY });
  };
  
  const handleMouseLeave = () => {
    setHoveredBooking(null);
  };
  
  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const dayNames = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'];
  const monthDayNames = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'];
  
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-white text-xl font-bold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Aujourd'hui
          </button>
          <button
            onClick={previousPeriod}
            className="p-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
          >
            ←
          </button>
          <button
            onClick={nextPeriod}
            className="p-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
          >
            →
          </button>
          <button
            onClick={() => setViewMode(viewMode === 'week' ? 'month' : 'week')}
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
          >
            {viewMode === 'week' ? 'Mois' : 'Semaine'}
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-white text-sm">Réservé</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-800 rounded-full"></div>
            <span className="text-white text-sm">Maintenance</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-white text-sm">Disponible</span>
          </div>
        </div>
      </div>
      
      {/* Calendrier Gantt - Vue Hebdomadaire */}
      {viewMode === 'week' && (
        <div className="bg-[#0f0f0f] border border-[#222] rounded-lg overflow-hidden">
          {/* En-tête des jours */}
          <div className="grid grid-cols-8 border-b border-[#222]">
            <div className="p-3 text-gray-500 text-sm font-medium border-r border-[#222]"></div>
            {weekDays.map((day, index) => {
              const isToday = day.toDateString() === today.toDateString();
              return (
                <div key={index} className="p-3 text-center border-r border-[#222] last:border-r-0">
                  <div className="text-gray-500 text-xs font-medium">{dayNames[index]}</div>
                  <div className={`text-lg font-bold ${isToday ? 'text-orange-500' : 'text-white'}`}>
                    {day.getDate()}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Lignes des véhicules */}
          {cars.map((car) => {
            const carStatus = getCarStatus(car.id);
            const carBookings = getBookingsForCar(car.id);
            
            return (
              <div key={car.id} className="grid grid-cols-8 border-b border-[#222] last:border-b-0">
                {/* Colonne véhicule enrichie */}
                <div className="p-3 border-r border-[#222] min-w-[200px]">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-white font-bold">{car.brand} {car.model}</div>
                    <div className={`px-2 py-0.5 text-xs font-medium rounded-md ${getStatusBadgeColor(carStatus)}`}>
                      {carStatus}
                    </div>
                  </div>
                  <div className="text-gray-500 text-xs">
                    {car.id} • {car.brand === 'Mercedes' ? 'Noir' : car.brand === 'Volkswagen' ? 'Bleu' : car.brand === 'Audi' ? 'Rouge' : 'Gris'}
                  </div>
                </div>
                
                {/* Colonnes des jours */}
                <div className="col-span-7 relative h-12">
                  {weekDays.map((day, dayIndex) => (
                    <div key={dayIndex} className="absolute top-0 bottom-0 border-r border-[#222] last:border-r-0" style={{ left: `${(dayIndex / 7) * 100}%`, width: `${100 / 7}%` }}>
                      <div className="h-full"></div>
                    </div>
                  ))}
                  
                  {/* Barres de réservation */}
                  {carBookings.map((booking) => {
                    const barStyle = getBookingBarStyle(booking);
                    
                    return (
                      <div
                        key={booking.id}
                        className={`absolute top-2 bottom-2 rounded-md ${getBookingBarColor(booking.status)} px-2 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity`}
                        style={{
                          left: `${((barStyle.gridColumnStart - 2) / 7) * 100}%`,
                          width: `${((barStyle.gridColumnEnd - barStyle.gridColumnStart) / 7) * 100}%`,
                        }}
                        onMouseEnter={(e) => handleMouseEnter(booking, e)}
                        onMouseLeave={handleMouseLeave}
                      >
                        <span className="text-white text-xs font-bold uppercase truncate">
                          {booking.userEmail ? booking.userEmail.split('@')[0] : 'CLIENT'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Calendrier Gantt - Vue Mensuelle */}
      {viewMode === 'month' && (
        <div className="bg-[#0f0f0f] border border-[#222] rounded-lg overflow-x-auto">
          {/* En-tête des jours */}
          <div className="grid grid-cols-[200px_repeat(31,minmax(40px,1fr))] border-b border-[#222] min-w-[1200px]">
            <div className="p-2 text-gray-500 text-sm font-medium border-r border-[#222]"></div>
            {monthDays.map((day, index) => {
              const isToday = day.toDateString() === today.toDateString();
              return (
                <div key={index} className="p-2 text-center border-r border-[#222] last:border-r-0">
                  <div className="text-gray-500 text-[10px] font-medium">{monthDayNames[index % 7]}</div>
                  <div className={`text-sm font-bold ${isToday ? 'text-orange-500' : 'text-white'}`}>
                    {day.getDate()}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Lignes des véhicules */}
          {cars.map((car) => {
            const carStatus = getCarStatus(car.id);
            const carBookings = getBookingsForCar(car.id);
            
            return (
              <div key={car.id} className="grid grid-cols-[200px_repeat(31,minmax(40px,1fr))] border-b border-[#222] last:border-b-0 min-w-[1200px]">
                {/* Colonne véhicule enrichie */}
                <div className="p-3 border-r border-[#222]">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-white font-bold">{car.brand} {car.model}</div>
                    <div className={`px-2 py-0.5 text-xs font-medium rounded-md ${getStatusBadgeColor(carStatus)}`}>
                      {carStatus}
                    </div>
                  </div>
                  <div className="text-gray-500 text-xs">
                    {car.id} • {car.brand === 'Mercedes' ? 'Noir' : car.brand === 'Volkswagen' ? 'Bleu' : car.brand === 'Audi' ? 'Rouge' : 'Gris'}
                  </div>
                </div>
                
                {/* Colonnes des jours */}
                <div className="col-span-31 relative h-12">
                  {monthDays.map((day, dayIndex) => (
                    <div key={dayIndex} className="absolute top-0 bottom-0 border-r border-[#222] last:border-r-0" style={{ left: `${(dayIndex / 31) * 100}%`, width: `${100 / 31}%` }}>
                      <div className="h-full"></div>
                    </div>
                  ))}
                  
                  {/* Barres de réservation */}
                  {carBookings.map((booking) => {
                    const barStyle = getMonthlyBookingBarStyle(booking);
                    
                    return (
                      <div
                        key={booking.id}
                        className={`absolute top-2 bottom-2 rounded-md ${getBookingBarColor(booking.status)} px-2 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity`}
                        style={{
                          left: `${((barStyle.gridColumnStart - 2) / 31) * 100}%`,
                          width: `${((barStyle.gridColumnEnd - barStyle.gridColumnStart) / 31) * 100}%`,
                        }}
                        onMouseEnter={(e) => handleMouseEnter(booking, e)}
                        onMouseLeave={handleMouseLeave}
                      >
                        <span className="text-white text-[10px] font-bold uppercase truncate">
                          {booking.userEmail ? booking.userEmail.split('@')[0] : 'CLIENT'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Tooltip au survol */}
      {hoveredBooking && (
        <div
          className="fixed z-50 bg-[#1a1a1a] border border-orange-500 rounded-lg shadow-2xl p-4 min-w-[200px] pointer-events-none"
          style={{
            left: `${hoverPosition.x + 15}px`,
            top: `${hoverPosition.y + 15}px`,
          }}
        >
          {(() => {
            const car = getCarForBooking(hoveredBooking);
            return (
              <div className="space-y-2">
                <div className="font-bold text-orange-500 text-sm">
                  Détails réservation
                </div>
                <div className="text-xs text-white">
                  <span className="font-semibold">Véhicule:</span> {car ? `${car.brand} ${car.model}` : 'Inconnu'}
                </div>
                <div className="text-xs text-white">
                  <span className="font-semibold">Client:</span> {hoveredBooking.userEmail}
                </div>
                <div className="text-xs text-white">
                  <span className="font-semibold">Du:</span> {new Date(hoveredBooking.startDate).toLocaleDateString('fr-FR')} {hoveredBooking.pickupTime || ''}
                </div>
                <div className="text-xs text-white">
                  <span className="font-semibold">Au:</span> {new Date(hoveredBooking.endDate).toLocaleDateString('fr-FR')} {hoveredBooking.dropoffTime || ''}
                </div>
                <div className="text-xs text-white">
                  <span className="font-semibold">Statut:</span> {hoveredBooking.status}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default GlobalCalendar;
