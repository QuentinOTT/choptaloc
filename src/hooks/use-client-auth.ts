import { useState, useEffect } from "react";
import { API_URL } from "@/config/api";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: "user" | "admin";
  emailVerified: boolean;
}

export const useClientAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const storedUser = localStorage.getItem("currentUser");
    const storedUsers = localStorage.getItem("users");
    
    console.log("Chargement auth - Utilisateurs stockés:", storedUsers ? JSON.parse(storedUsers).length : 0);
    console.log("Chargement auth - Session active:", storedUser ? "Oui" : "Non");
    
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
        console.log("Session restaurée pour:", userData.email);
      } catch (e) {
        console.error("Erreur lors du parsing de la session:", e);
        localStorage.removeItem("currentUser");
      }
    }
    setIsLoading(false);
  }, []);

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, firstName, lastName, phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || "Erreur lors de l'inscription" };
      }

      // Après inscription, connecter l'utilisateur
      const loginResult = await login(email, password, false);
      return loginResult;
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      return { success: false, error: "Erreur lors de l'inscription" };
    }
  };

  const login = async (
    email: string,
    password: string,
    rememberMe: boolean = false
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || "Email ou mot de passe incorrect" };
      }

      setUser(data.user);
      setIsAuthenticated(true);
      localStorage.setItem("currentUser", JSON.stringify(data.user));

      // Si "Se souvenir de moi" est coché, stocker l'email pour la prochaine connexion
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      return { success: true };
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      return { success: false, error: "Erreur lors de la connexion" };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("currentUser");
  };

  const updateUser = async (updates: Partial<User>) => {
    if (user) {
      try {
        const response = await fetch(`${API_URL}/users/${user.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        });

        if (response.ok) {
          const updatedUser = { ...user, ...updates };
          setUser(updatedUser);
          localStorage.setItem("currentUser", JSON.stringify(updatedUser));
        }
      } catch (error) {
        console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
      }
    }
  };

  return {
    isAuthenticated,
    user,
    isLoading,
    register,
    login,
    logout,
    updateUser,
  };
};
