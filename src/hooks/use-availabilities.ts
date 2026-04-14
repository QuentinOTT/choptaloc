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
    const availability = availabilities.find(a => a.carId === carId && a.date === date);
    return availability ? availability.isAvailable : true;
  };

  // ── Mise à jour unitaire (avec functional update pour éviter le stale closure) ──
  const setCarAvailability = (carId: string, date: string, isAvailable: boolean) => {
    setAvailabilitiesState(prev => {
      const idx = prev.findIndex(a => a.carId === carId && a.date === date);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { carId, date, isAvailable };
        return next;
      }
      return [...prev, { carId, date, isAvailable }];
    });
  };

  /**
   * Bloque toutes les dates d'une réservation en UN SEUL setState.
   * Evite le bug de stale closure qui ne gardait que la dernière date.
   */
  const blockDatesForBooking = (
    carId: string,
    startDate: string,
    endDate: string,
    dropoffTime?: string
  ) => {
    // Construire les dates à bloquer en local (on force minuit local, pas UTC)
    const [sy, sm, sd] = startDate.split("-").map(Number);
    const [ey, em, ed] = endDate.split("-").map(Number);
    const start = new Date(sy, sm - 1, sd);
    const end   = new Date(ey, em - 1, ed);

    // Si restitution avant 12h, le dernier jour reste disponible
    const shouldBlockLastDay =
      !dropoffTime || parseInt(dropoffTime.split(":")[0], 10) >= 12;

    const datesToBlock: string[] = [];
    const cur = new Date(start);

    while (cur <= end) {
      const isLastDay = cur.getTime() === end.getTime();
      if (!isLastDay || shouldBlockLastDay) {
        const dateStr = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}-${String(cur.getDate()).padStart(2, "0")}`;
        datesToBlock.push(dateStr);
      }
      cur.setDate(cur.getDate() + 1);
    }

    if (datesToBlock.length === 0) return;

    // Un seul setState pour toutes les dates → pas de stale closure
    setAvailabilitiesState(prev => {
      const next = [...prev];
      for (const dateStr of datesToBlock) {
        const idx = next.findIndex(a => a.carId === carId && a.date === dateStr);
        if (idx >= 0) {
          next[idx] = { carId, date: dateStr, isAvailable: false };
        } else {
          next.push({ carId, date: dateStr, isAvailable: false });
        }
      }
      return next;
    });
  };

  const getMonthAvailabilities = (
    carId: string,
    year: number,
    month: number
  ): Map<string, boolean> => {
    const map = new Map<string, boolean>();
    const first = new Date(year, month, 1);
    const last  = new Date(year, month + 1, 0);
    const cur   = new Date(first);

    while (cur <= last) {
      const dateStr = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}-${String(cur.getDate()).padStart(2, "0")}`;
      const entry = availabilities.find(a => a.carId === carId && a.date === dateStr);
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
