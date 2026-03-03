import axiosClient from "@/axiosClient";
import { createContext, useContext, useEffect, useState } from "react";

interface User {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profilePicture?: string;
    role: 'customer' | 'admin' | 'seller'; 
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean; 
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  const handleSetUser = (userData: User | null) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("ACCESS_TOKEN");
    }
  };

  useEffect(() => {
    const refreshUser = async () => {
      try {
        const token = localStorage.getItem("ACCESS_TOKEN");
        if (token) {
          const { data } = await axiosClient.get("/auth/me");
          handleSetUser(data.user); 
        }
      } catch (error) {
        console.error("Session expired");
        handleSetUser(null);
      } finally {
        setLoading(false);
      }
    };

    refreshUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser: handleSetUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used inside UserProvider");
  }
  return context;
};