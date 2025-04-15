
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

type User = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
};

type AppContextType = {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  user: User | null;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
};

// Create the context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Context provider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  // Check for dark mode preference on initial load
  useEffect(() => {
    const darkModePreference = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkModePreference);
    if (darkModePreference) {
      document.documentElement.classList.add('dark');
    }

    // Simulate a default user for now
    setUser({
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'user'
    });
  }, []);

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

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    // Simulate signup process
    try {
      // In a real app, this would be an API call
      const newUser: User = {
        id: '2',
        name,
        email,
        role: 'user'
      };
      setUser(newUser);
      return true;
    } catch (error) {
      toast({
        title: "Signup Failed",
        description: "An error occurred during signup.",
        variant: "destructive"
      });
      return false;
    }
  };

  const contextValue: AppContextType = {
    isDarkMode,
    toggleDarkMode,
    user,
    signup,
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
