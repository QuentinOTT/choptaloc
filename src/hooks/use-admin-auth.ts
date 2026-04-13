import { useState, useEffect } from "react";

interface AdminUser {
  email: string;
  isAuthenticated: boolean;
}

const ADMIN_CREDENTIALS = {
  email: "admin@choptaloc.com",
  password: "admin123"
};

export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'admin est déjà connecté au chargement
    const storedAuth = sessionStorage.getItem("adminAuth");
    if (storedAuth === "true") {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, password: string): boolean => {
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      setIsAuthenticated(true);
      sessionStorage.setItem("adminAuth", "true");
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("adminAuth");
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    logout
  };
};
