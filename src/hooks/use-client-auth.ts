import { useState, useEffect } from "react";

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
      // Récupérer les utilisateurs existants avec gestion d'erreur
      let existingUsers: any[] = [];
      try {
        const stored = localStorage.getItem("users");
        if (stored) {
          existingUsers = JSON.parse(stored);
          if (!Array.isArray(existingUsers)) {
            console.warn("Données utilisateurs corrompues, réinitialisation");
            existingUsers = [];
          }
        }
      } catch (e) {
        console.error("Erreur lors de la lecture des utilisateurs:", e);
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
      
      // Sauvegarder dans localStorage
      localStorage.setItem("users", JSON.stringify(existingUsers));
      
      // Vérifier que la sauvegarde a fonctionné
      const verifyStored = localStorage.getItem("users");
      if (!verifyStored) {
        console.error("Échec de la sauvegarde des utilisateurs");
        return { success: false, error: "Erreur de sauvegarde. Veuillez réessayer." };
      }

      console.log("Utilisateur créé avec succès:", newUser.id);
      console.log("Nombre total d'utilisateurs:", existingUsers.length);

      // Connecter l'utilisateur
      setUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem("currentUser", JSON.stringify(newUser));

      return { success: true };
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
      // Récupérer les utilisateurs avec gestion d'erreur
      let existingUsers: any[] = [];
      try {
        const stored = localStorage.getItem("users");
        console.log("Tentative de connexion - Données brutes:", stored ? "Présentes" : "Absent");
        if (stored) {
          existingUsers = JSON.parse(stored);
          console.log("Nombre d'utilisateurs trouvés:", existingUsers.length);
        }
      } catch (e) {
        console.error("Erreur lors de la lecture des utilisateurs:", e);
        return { success: false, error: "Erreur système. Veuillez réessayer." };
      }
      
      const user = existingUsers.find(
        (u: any) => u.email === email && u.passwordHash === password
      );

      if (!user) {
        console.log("Utilisateur non trouvé ou mot de passe incorrect");
        return { success: false, error: "Email ou mot de passe incorrect" };
      }
      
      console.log("Utilisateur trouvé:", user.email, "ID:", user.id);

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
    } catch (error) {
      return { success: false, error: "Erreur lors de la connexion" };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("currentUser");
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));

      // Mettre à jour dans la liste des utilisateurs
      const existingUsers = JSON.parse(localStorage.getItem("users") || "[]");
      const userIndex = existingUsers.findIndex((u: any) => u.id === user.id);
      if (userIndex >= 0) {
        existingUsers[userIndex] = { ...existingUsers[userIndex], ...updates };
        localStorage.setItem("users", JSON.stringify(existingUsers));
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
