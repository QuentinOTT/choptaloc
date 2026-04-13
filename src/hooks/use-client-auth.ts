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
      console.error("Erreur lors de l'inscription (API), fallback localStorage:", error);
      // Fallback vers localStorage
      try {
        // Récupérer les utilisateurs existants
        let existingUsers: any[] = [];
        try {
          const stored = localStorage.getItem("users");
          if (stored) {
            existingUsers = JSON.parse(stored);
            if (!Array.isArray(existingUsers)) {
              existingUsers = [];
            }
          }
        } catch (e) {
          existingUsers = [];
        }

        // Vérifier si l'utilisateur existe déjà
        if (existingUsers.some((u: any) => u.email === email)) {
          return { success: false, error: "Un compte avec cet email existe déjà" };
        }

        // Créer le nouvel utilisateur
        const newUser: User = {
          id: `user-${Date.now()}`,
          email,
          firstName,
          lastName,
          phone,
          role: "user",
          emailVerified: false,
        };

        // Stocker l'utilisateur avec le mot de passe
        const userToStore = { ...newUser, passwordHash: password };
        existingUsers.push(userToStore);
        localStorage.setItem("users", JSON.stringify(existingUsers));

        // Connecter l'utilisateur
        setUser(newUser);
        setIsAuthenticated(true);
        localStorage.setItem("currentUser", JSON.stringify(newUser));

        return { success: true };
      } catch (fallbackError) {
        console.error("Erreur lors de l'inscription (fallback):", fallbackError);
        return { success: false, error: "Erreur lors de l'inscription" };
      }
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
      console.error("Erreur lors de la connexion (API), fallback localStorage:", error);
      // Fallback vers localStorage
      try {
        let existingUsers: any[] = [];
        try {
          const stored = localStorage.getItem("users");
          if (stored) {
            existingUsers = JSON.parse(stored);
          }
        } catch (e) {
          existingUsers = [];
        }

        const user = existingUsers.find(
          (u: any) => u.email === email && u.passwordHash === password
        );

        if (!user) {
          return { success: false, error: "Email ou mot de passe incorrect" };
        }

        const userData: User = {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role,
          emailVerified: user.emailVerified,
        };

        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem("currentUser", JSON.stringify(userData));

        // Si "Se souvenir de moi" est coché, stocker l'email pour la prochaine connexion
        if (rememberMe) {
          localStorage.setItem("rememberedEmail", email);
        } else {
          localStorage.removeItem("rememberedEmail");
        }

        return { success: true };
      } catch (fallbackError) {
        console.error("Erreur lors de la connexion (fallback):", fallbackError);
        return { success: false, error: "Erreur lors de la connexion" };
      }
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
