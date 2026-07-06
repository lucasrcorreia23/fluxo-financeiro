"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { APP_USERS, type AppUser } from "./types";

const KEY = "fluxo.user.v1";

interface UserContextValue {
  ready: boolean;
  currentUser: AppUser;
  setCurrentUser: (user: AppUser) => void;
}

const UserContext = createContext<UserContextValue | null>(null);

function loadUser(): AppUser {
  if (typeof window === "undefined") return "Lucas";
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw && APP_USERS.includes(raw as AppUser)) return raw as AppUser;
  } catch {
    /* ignore */
  }
  return "Lucas";
}

function saveUser(user: AppUser): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, user);
  } catch {
    /* ignore */
  }
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<AppUser>("Lucas");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCurrentUserState(loadUser());
    setReady(true);
  }, []);

  const setCurrentUser = (user: AppUser) => {
    setCurrentUserState(user);
    saveUser(user);
  };

  const value = useMemo(
    () => ({ ready, currentUser, setCurrentUser }),
    [ready, currentUser],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within <UserProvider>");
  return ctx;
}
