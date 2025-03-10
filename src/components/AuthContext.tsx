import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { apiService } from "../services/apiService";

interface Role {
  id: string;
  name: string;
}

interface AuthUser {
  id: string;
  name: string;
  email: string;
  roles: Role[];
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  token: string | null;
  isLoading: boolean;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from token
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          // TODO: Add endpoint to fetch user profile
          const userProfile = await apiService.getUserProfile();
          setUser(userProfile);
          setIsAuthenticated(true);
          setToken(storedToken);
        } catch (error) {
          // If token is invalid, clear authentication
          console.error("Error fetching users:", error);
          localStorage.removeItem("token");
          setIsAuthenticated(false);
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await apiService.login({ email, password });

      localStorage.setItem("token", response.token);

      setToken(response.token);
      setIsAuthenticated(true);

      // TODO: Add endpoint to fetch user profile after login
      const userProfile = await apiService.getUserProfile();
      setUser(userProfile);
    } catch (error: unknown) {
      console.error("Login error:", error); // Puedes enviar esto a Sentry, LogRocket, etc.
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error(
          "El nombre de usuario o contraseña ingresado es incorrecto, por favor intente nuevamente."
        );
      }
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    apiService.logout(); // This clears the token from apiService
    window.location.reload();
  }, []);

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      try {
        const response = await apiService.signup({ name, email, password });

        localStorage.setItem("token", response.token);
        setToken(response.token);
        setIsAuthenticated(true);

        const userProfile = await apiService.getUserProfile();
        setUser(userProfile);
      } catch (error: unknown) {
        console.error("Signup error:", error);

        let errorMessage = "El correo ya está registrado";

        if (
          typeof error === "object" &&
          error !== null &&
          "response" in error &&
          typeof error.response === "object" &&
          error.response !== null &&
          "data" in error.response &&
          typeof error.response.data === "object" &&
          error.response.data !== null &&
          "message" in error.response.data
        ) {
          errorMessage = (error.response.data as { message: string }).message;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        throw new Error(errorMessage);
      }
    },
    []
  );

  // Update apiService token when it changes
  useEffect(() => {
    if (token) {
      // Update axios instance configuration
      const axiosInstance = apiService["api"];
      axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;
    }
  }, [token]);

  const value = {
    isAuthenticated,
    user,
    login,
    signup,
    logout,
    token,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
