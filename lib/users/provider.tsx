"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { APP_USERS, memberFromEmail, type AppUser } from "./types";

const VIEW_KEY = "fluxo.view.v1";

interface StoredView {
  owner: AppUser;
  view: AppUser;
}

interface UserContextValue {
  ready: boolean;
  /** A pessoa dona da conta logada (ou a pessoa local em modo offline). */
  loggedInUser: AppUser;
  /** A pessoa cujos dados estão sendo visualizados (pode ser a outra). */
  currentUser: AppUser;
  setCurrentUser: (user: AppUser) => void;
}

const UserContext = createContext<UserContextValue | null>(null);

function loadView(): StoredView | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(VIEW_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredView;
    if (APP_USERS.includes(parsed.owner) && APP_USERS.includes(parsed.view)) {
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function saveView(owner: AppUser, view: AppUser): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(VIEW_KEY, JSON.stringify({ owner, view }));
  } catch {
    /* ignore */
  }
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [loggedInUser, setLoggedInUser] = useState<AppUser>("Lucas");
  const [currentUser, setCurrentUserState] = useState<AppUser>("Lucas");
  const [ready, setReady] = useState(false);
  const ownerRef = useRef<AppUser>("Lucas");

  useEffect(() => {
    // Resolve which person the account is, and which view to open.
    // Keeps a switched view across refresh (same owner), but defaults to
    // "yourself" whenever the logged-in identity changes.
    const resolve = (member: AppUser) => {
      ownerRef.current = member;
      setLoggedInUser(member);
      const stored = loadView();
      const view = stored && stored.owner === member ? stored.view : member;
      setCurrentUserState(view);
      saveView(member, view);
      setReady(true);
    };

    if (!isSupabaseConfigured()) {
      // Local mode: no auth, treat the stored view's owner as the person.
      const stored = loadView();
      resolve(stored?.owner ?? "Lucas");
      return;
    }

    const supabase = createClient();
    supabase.auth
      .getUser()
      .then(({ data }) => resolve(memberFromEmail(data.user?.email)))
      .catch(() => resolve("Lucas"));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) resolve(memberFromEmail(session.user.email));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const setCurrentUser = (user: AppUser) => {
    setCurrentUserState(user);
    saveView(ownerRef.current, user);
  };

  const value = useMemo(
    () => ({ ready, loggedInUser, currentUser, setCurrentUser }),
    [ready, loggedInUser, currentUser],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within <UserProvider>");
  return ctx;
}
