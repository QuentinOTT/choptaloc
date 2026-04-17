import React, { createContext, useContext, useState, useEffect } from 'react';

interface Settings {
  company_name: string;
  company_siret: string;
  company_address: string;
  company_phone: string;
  company_email: string;
  rental_min_age: string;
  rental_min_license_years: string;
  rental_default_deposit: string;
  opening_hours_week: string;
  opening_hours_weekend: string;
  maintenance_mode: string;
  vacation_mode: string;
  vacation_start: string;
  vacation_end: string;
  alert_message: string;
  global_discount: string;
}

interface SettingsContextType {
  settings: Settings;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: Settings = {
  company_name: "ChopTaLoc",
  company_siret: "",
  company_address: "",
  company_phone: "",
  company_email: "",
  rental_min_age: "21",
  rental_min_license_years: "2",
  rental_default_deposit: "1000",
  opening_hours_week: "09:00 - 18:00",
  opening_hours_weekend: "10:00 - 16:00",
  maintenance_mode: "false",
  vacation_mode: "false",
  vacation_start: "",
  vacation_end: "",
  alert_message: "",
  global_discount: "0"
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

  const refreshSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/settings`);
      if (response.ok) {
        const data = await response.json();
        if (data && Object.keys(data).length > 0) {
          setSettings(prev => ({ ...prev, ...data }));
        }
      }
    } catch (error) {
      console.error("Erreur chargement réglages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, isLoading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
