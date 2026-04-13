import { useState } from "react";

interface Availability {
  carId: string;
  date: string; // Format: YYYY-MM-DD
  isAvailable: boolean;
}

export const useAvailabilities = () => {
  const [availabilities, setAvailabilitiesState] = useState<Availability[]>([]);

  const getAvailabilities = (): Availability[] => {
    return availabilities;
  };

  const setAvailabilities = (newAvailabilities: Availability[]) => {
    setAvailabilitiesState(newAvailabilities);
  };

  const isCarAvailable = (carId: string, date: string): boolean => {
    const availability = availabilities.find(a => a.carId === carId && a.date === date);
    // Si aucune donnée n'existe pour cette date, considérer comme disponible
    return availability ? availability.isAvailable : true;
  };

  const setCarAvailability = (carId: string, date: string, isAvailable: boolean) => {
    const existingIndex = availabilities.findIndex(a => a.carId === carId && a.date === date);
    
    if (existingIndex >= 0) {
      const newAvailabilities = [...availabilities];
      newAvailabilities[existingIndex] = { carId, date, isAvailable };
      setAvailabilitiesState(newAvailabilities);
    } else {
      setAvailabilitiesState([...availabilities, { carId, date, isAvailable }]);
    }
  };

  const blockDatesForBooking = (carId: string, startDate: string, endDate: string, dropoffTime?: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Si l'heure de restitution est avant 12h, ne pas bloquer le dernier jour
    const shouldBlockLastDay = !dropoffTime || parseInt(dropoffTime.split(':')[0]) >= 12;
    
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split('T')[0];
      // Ne pas bloquer le dernier jour si restitution avant 12h
      if (currentDate.getTime() === end.getTime() && !shouldBlockLastDay) {
        // Ne pas bloquer ce jour
      } else {
        setCarAvailability(carId, dateStr, false);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
  };

  const getMonthAvailabilities = (carId: string, year: number, month: number): Map<string, boolean> => {
    const monthAvailabilities = new Map<string, boolean>();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const currentDate = new Date(firstDay);
    while (currentDate <= lastDay) {
      const dateStr = currentDate.toISOString().split('T')[0];
      monthAvailabilities.set(dateStr, isCarAvailable(carId, dateStr));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return monthAvailabilities;
  };

  return {
    getAvailabilities,
    setAvailabilities,
    isCarAvailable,
    setCarAvailability,
    blockDatesForBooking,
    getMonthAvailabilities
  };
};
