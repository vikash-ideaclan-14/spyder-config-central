
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useToast } from "@/hooks/use-toast";

// Define types
type User = {
  id: string;
  name: string;
  email: string;
  role: string;
} | null;

type AppContextType = {
  user: User;
  isAuthenticated: boolean;
  isDarkMode: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  toggleDarkMode: () => void;
};

// Create the context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Context provider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const { toast } = useToast();

  // Check for existing user in localStorage on initial load
  React.useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Check for dark mode preference
    const darkModePreference = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkModePreference);
    if (darkModePreference) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // This would normally be an API call
      // For demo purposes, just check if email is admin@spyder.com and password is password
      if (email === 'admin@spyder.com' && password === 'password') {
        const fakeUser = {
          id: '1',
          name: 'Admin User',
          email: email,
          role: 'admin'
        };
        setUser(fakeUser);
        localStorage.setItem('user', JSON.stringify(fakeUser));
        toast({
          title: "Login successful",
          description: "Welcome back, Admin User!",
        });
        return true;
      } else {
        toast({
          title: "Login failed",
          description: "Invalid credentials. Please try again.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      // This would normally be an API call
      const fakeUser = {
        id: Date.now().toString(),
        name,
        email,
        role: 'user'
      };
      setUser(fakeUser);
      localStorage.setItem('user', JSON.stringify(fakeUser));
      toast({
        title: "Account created",
        description: "Your account has been created successfully!",
      });
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: "Signup failed",
        description: "An error occurred during signup. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      localStorage.setItem('darkMode', String(newMode));
      if (newMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return newMode;
    });
  };

  const contextValue: AppContextType = {
    user,
    isAuthenticated: !!user,
    isDarkMode,
    login,
    logout,
    signup,
    toggleDarkMode,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the app context
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
