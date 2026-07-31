import { useState } from "react";

interface Availability {
  carId: string;
  date: string; // Format: YYYY-MM-DD
  isAvailable: boolean;
}

export const useAvailabilities = () => {
  const [availabilities, setAvailabilitiesState] = useState<Availability[]>([]);

  const getAvailabilities = (): Availability[] => availabilities;

  const setAvailabilities = (newAvailabilities: Availability[]) => {
    setAvailabilitiesState(newAvailabilities);
  };

  const isCarAvailable = (carId: string, date: string): boolean => {
    const availability = availabilities.find(a => String(a.carId) === String(carId) && a.date === date);
    return availability ? availability.isAvailable : true;
  };

  const setCarAvailability = (carId: string, date: string, isAvailable: boolean) => {
    setAvailabilitiesState(prev => {
      const targetCarId = String(carId);
      const idx = prev.findIndex(a => String(a.carId) === targetCarId && a.date === date);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { carId: targetCarId, date, isAvailable };
        return next;
      }
      return [...prev, { carId: targetCarId, date, isAvailable }];
    });
  };

  /**
   * Bloque toutes les dates d'une réservation du début à la fin inclus.
   */
  const blockDatesForBooking = (
    carId: string | number,
    startDate: string,
    endDate: string
  ) => {
    if (!carId || !startDate || !endDate) return;

    const targetCarId = String(carId);
    const [sy, sm, sd] = startDate.slice(0, 10).split("-").map(Number);
    const [ey, em, ed] = endDate.slice(0, 10).split("-").map(Number);
    
    if (isNaN(sy) || isNaN(sm) || isNaN(sd) || isNaN(ey) || isNaN(em) || isNaN(ed)) return;

    const start = new Date(sy, sm - 1, sd);
    const end   = new Date(ey, em - 1, ed);

    const datesToBlock: string[] = [];
    const cur = new Date(start);

    while (cur <= end) {
      const dateStr = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}-${String(cur.getDate()).padStart(2, "0")}`;
      datesToBlock.push(dateStr);
      cur.setDate(cur.getDate() + 1);
    }

    if (datesToBlock.length === 0) return;

    setAvailabilitiesState(prev => {
      const next = [...prev];
      for (const dateStr of datesToBlock) {
        const idx = next.findIndex(a => String(a.carId) === targetCarId && a.date === dateStr);
        if (idx >= 0) {
          next[idx] = { carId: targetCarId, date: dateStr, isAvailable: false };
        } else {
          next.push({ carId: targetCarId, date: dateStr, isAvailable: false });
        }
      }
      return next;
    });
  };

  const getMonthAvailabilities = (
    carId: string | number,
    year: number,
    month: number
  ): Map<string, boolean> => {
    const targetCarId = String(carId);
    const map = new Map<string, boolean>();
    const first = new Date(year, month, 1);
    const last  = new Date(year, month + 1, 0);
    const cur   = new Date(first);

    while (cur <= last) {
      const dateStr = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}-${String(cur.getDate()).padStart(2, "0")}`;
      const entry = availabilities.find(a => String(a.carId) === targetCarId && a.date === dateStr);
      map.set(dateStr, entry ? entry.isAvailable : true);
      cur.setDate(cur.getDate() + 1);
    }

    return map;
  };

  return {
    getAvailabilities,
    setAvailabilities,
    isCarAvailable,
    setCarAvailability,
    blockDatesForBooking,
    getMonthAvailabilities,
  };
};
