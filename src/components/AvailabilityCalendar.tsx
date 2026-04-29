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
}

interface AvailabilityCalendarProps {
  car: Car;
  bookings: Booking[];
}

const AvailabilityCalendar = ({ car, bookings }: AvailabilityCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Obtenir le premier et dernier jour du mois
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  // Obtenir les jours du mois précédent pour remplir le début du calendrier
  const startDayOfWeek = firstDay.getDay();
  const prevMonthDays = [];
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const day = new Date(currentDate.getFullYear(), currentDate.getMonth(), -i);
    prevMonthDays.push(day);
  }
  
  // Obtenir tous les jours du mois
  const daysInMonth = [];
  for (let day = 1; day <= lastDay.getDate(); day++) {
    daysInMonth.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
  }
  
  // Obtenir les jours du mois suivant pour remplir la fin du calendrier
  const endDayOfWeek = lastDay.getDay();
  const nextMonthDays = [];
  for (let i = 1; i < 7 - endDayOfWeek; i++) {
    const day = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i);
    nextMonthDays.push(day);
  }
  
  // Vérifier si une date est réservée pour cette voiture (uniquement si confirmée)
  const isDateBooked = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookings.some(booking => 
      booking.carId === car.id &&
      booking.status === 'confirmed' &&
      dateStr >= booking.startDate &&
      dateStr <= booking.endDate
    );
  };
  
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  
  return (
    <div className="space-y-6">
      {/* Header avec navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={previousMonth}
          className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="text-3xl font-black bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <button
          onClick={nextMonth}
          className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {/* Calendrier */}
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-orange-200">
        {/* En-tête avec jours de la semaine */}
        <div className="grid grid-cols-7 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 text-white">
          {dayNames.map(day => (
            <div key={day} className="p-4 text-center font-bold text-sm uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>
        
        {/* Grille des jours */}
        <div className="grid grid-cols-7 gap-2 p-4 bg-gradient-to-b from-orange-50 to-white">
          {/* Jours du mois précédent */}
          {prevMonthDays.map((day, index) => (
            <div
              key={`prev-${index}`}
              className="aspect-square p-3 text-center text-sm text-gray-300 font-semibold"
            >
              {day.getDate()}
            </div>
          ))}
          
          {/* Jours du mois courant */}
          {daysInMonth.map((day, index) => {
            const booked = isDateBooked(day);
            return (
              <div
                key={`current-${index}`}
                title={booked ? "Réservé" : `Disponible : ${car.price}€ / jour`}
                className={`aspect-square p-3 text-center text-sm font-bold rounded-2xl shadow-md transition-all duration-300 transform hover:scale-105 cursor-pointer ${
                  booked 
                    ? 'bg-gradient-to-br from-gray-700 to-gray-900 text-white shadow-gray-500/30' 
                    : 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-orange-500/30'
                }`}
              >
                {day.getDate()}
              </div>
            );
          })}
          
          {/* Jours du mois suivant */}
          {nextMonthDays.map((day, index) => (
            <div
              key={`next-${index}`}
              className="aspect-square p-3 text-center text-sm text-gray-300 font-semibold"
            >
              {day.getDate()}
            </div>
          ))}
        </div>
      </div>
      
      {/* Légende */}
      <div className="flex items-center justify-center gap-8 mt-6">
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-md">
          <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg shadow-md"></div>
          <span className="text-sm font-semibold text-gray-700">Disponible</span>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-md">
          <div className="w-6 h-6 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg shadow-md"></div>
          <span className="text-sm font-semibold text-gray-700">Réservé</span>
        </div>
      </div>
      
      {/* Informations sur la voiture */}
      <div className="bg-gradient-to-br from-orange-100 via-orange-50 to-orange-100 rounded-2xl p-6 shadow-lg border-2 border-orange-200">
        <h4 className="font-black text-2xl mb-3 bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
          {car.brand} {car.model}
        </h4>
        <div className="space-y-2">
          <p className="text-lg font-semibold text-gray-700">
            💰 {car.price}€ / jour
          </p>
          <p className="text-base font-semibold text-gray-600">
            {car.isAvailable ? '✅ Disponible' : '❌ Indisponible'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
