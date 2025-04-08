
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AuthService } from "@/services/api";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

// Define types
interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: "admin" | "bibliothecaire" | "utilisateur" | "user";
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<boolean>;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Check for stored user data in sessionStorage
        const storedUserData = sessionStorage.getItem('userData');
        if (storedUserData) {
          setUser(JSON.parse(storedUserData));
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log("Attempting login with:", { email });
      const response = await AuthService.login({ email, mot_de_passe : password });
      console.log("Login response:", response);
      
      if (response && response.success) {
        // Set user data from response
        const userData = {
          id: response.data.userId,
          firstName: response.data.userName.split(' ')[0],
          lastName: response.data.userName.split(' ')[1] || '',
          email: email,
          role: response.data.userRole as "admin" | "bibliothecaire" | "utilisateur" | "user",
        };
        
        console.log("User data set:", userData);
        setUser(userData);
        
        // Store user data in sessionStorage
        sessionStorage.setItem('userData', JSON.stringify(userData));
        
        toast({
          title: "Login Successful",
          description: "Welcome to your Maple Biblio account",
        });
        
        return true;
      } else {
        console.error("Login failed:", response?.message);
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: response?.message || "Invalid email or password",
        });
        
        return false;
      }
    } catch (error: any) {
      console.error("Login error details:", error);
      
      // Handle network errors specifically
      if (error.message && error.message.includes("Failed to fetch")) {
        toast({
          variant: "destructive",
          title: "Connection Error",
          description: "Unable to connect to the server. Please check if your server is running.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Login Error",
          description: error?.message || "An error occurred during login",
        });
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await AuthService.logout();
      setUser(null);
      // Clear stored user data
      sessionStorage.removeItem('userData');
      navigate('/');
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        variant: "destructive",
        title: "Erreur de déconnexion",
        description: "Une erreur s'est produite lors de la déconnexion",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await AuthService.register({
        prenom: userData.firstName,
        nom: userData.lastName,
        email: userData.email,
        mot_de_passe: userData.password,
        confirmPassword: userData.confirmPassword,
        agreeTerms: userData.agreeTerms
      });
      
      if (response.success) {
        // Set user data from response
        const newUserData = {
          id: response.data?.userId || 0,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          role: response.data?.userRole || "utilisateur" as "admin" | "bibliothecaire" | "utilisateur",
        };
        
        setUser(newUserData);
        
        // Store user data in sessionStorage
        sessionStorage.setItem('userData', JSON.stringify(newUserData));
        
        toast({
          title: "Inscription réussie",
          description: "Bienvenue sur Maple Biblio !",
        });
        
        setIsLoading(false);
        return true;
      } else {
        toast({
          variant: "destructive",
          title: "Erreur d'inscription",
          description: response.message || "Une erreur est survenue lors de l'inscription",
        });
        
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error("Register error:", error);
      toast({
        variant: "destructive",
        title: "Erreur d'inscription",
        description: "Une erreur s'est produite lors de l'inscription",
      });
      
      setIsLoading(false);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        register
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
