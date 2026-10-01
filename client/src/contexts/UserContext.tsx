// src/contexts/UserContext.tsx
import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "../shared.types";
import userService from "../utils/userService";

type UserContextType = {
  user: User | null;
  logout: () => void;
  refreshUser: () => void;
};

export const UserContext = createContext<UserContextType | null>(null);

type UserProviderProps = {
  children: ReactNode;
};

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(userService.getUser());

  function refreshUser() {
    setUser(userService.getUser());
  }

  function logout() {
    userService.logout();
    setUser(null);
  }

  return (
    <UserContext.Provider value={{ user, logout, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === null) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}