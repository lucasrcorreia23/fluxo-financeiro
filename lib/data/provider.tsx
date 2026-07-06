"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { currentMonthKey, todayISO, uid } from "@/lib/utils";
import { useUser } from "@/lib/users/provider";
import type { AppUser } from "@/lib/users/types";
import { loadDatabase, resetDatabase, saveDatabase } from "./store";
import type { Database, Expense, Goal, Wishlist } from "./types";
import { buildSeed } from "./seed";

type NewExpense = Omit<Expense, "id" | "created_at" | "is_paid"> & {
  is_paid?: boolean;
};
type NewGoal = Omit<Goal, "id" | "created_at" | "current_amount"> & {
  current_amount?: number;
};
type NewWish = Omit<
  Wishlist,
  "id" | "created_at" | "notified" | "status" | "purchased_at"
>;

interface DataContextValue {
  ready: boolean;
  currentUser: AppUser;
  db: Database;

  // profile
  setIncome: (value: number) => void;
  completeOnboarding: (income: number) => void;
  resetAll: () => void;

  // expenses
  addExpense: (input: NewExpense) => Expense;
  updateExpense: (id: string, patch: Partial<Expense>) => void;
  removeExpense: (id: string) => void;
  togglePaid: (id: string) => void;

  // goals
  addGoal: (input: NewGoal) => void;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  removeGoal: (id: string) => void;
  contributeGoal: (id: string, amount: number) => void;

  // wishlist
  addWish: (input: NewWish) => void;
  updateWish: (id: string, patch: Partial<Wishlist>) => void;
  removeWish: (id: string) => void;
  scheduleWish: (id: string, date: string) => void;
  dismissAlert: (id: string) => void;
  markPurchased: (id: string) => Wishlist | undefined;
}

const DataContext = createContext<DataContextValue | null>(null);

/** Recompute the current-month snapshot in monthly_history from live expenses. */
function syncCurrentMonth(db: Database): Database {
  const month = currentMonthKey();
  const totals = new Map<string, number>();
  for (const e of db.expenses) {
    if (!e.category_id || e.amount == null) continue;
    totals.set(e.category_id, (totals.get(e.category_id) ?? 0) + e.amount);
  }
  const others = db.monthly_history.filter((h) => h.month !== month);
  const currentRows = Array.from(totals.entries()).map(([category_id, total]) => ({
    id: uid(),
    month,
    category_id,
    total,
  }));
  return { ...db, monthly_history: [...others, ...currentRows] };
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { ready: userReady, currentUser } = useUser();
  const [db, setDb] = useState<Database>(() => buildSeed(currentUser));
  const [ready, setReady] = useState(false);
  const skipPersist = useRef(true);
  const activeUser = useRef(currentUser);
  const dbRef = useRef(db);
  dbRef.current = db;

  // Load from localStorage after mount (client-only), then sync current month.
  useEffect(() => {
    if (!userReady) return;
    setDb(syncCurrentMonth(loadDatabase(currentUser)));
    activeUser.current = currentUser;
    setReady(true);
    skipPersist.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial load only
  }, [userReady]);

  // Save the previous user's data before switching profiles.
  useEffect(() => {
    if (!userReady || !ready) return;
    if (activeUser.current === currentUser) return;

    saveDatabase(activeUser.current, dbRef.current);
    setDb(syncCurrentMonth(loadDatabase(currentUser)));
    activeUser.current = currentUser;
    skipPersist.current = true;
  }, [currentUser, userReady, ready]);

  // Persist on every change once loaded.
  useEffect(() => {
    if (!ready || !userReady) return;
    if (skipPersist.current) {
      skipPersist.current = false;
      return;
    }
    saveDatabase(activeUser.current, db);
  }, [db, ready, userReady]);

  const mutate = useCallback((fn: (db: Database) => Database) => {
    setDb((prev) => fn(prev));
  }, []);

  const value = useMemo<DataContextValue>(() => {
    return {
      ready,
      currentUser,
      db,

      setIncome: (income) =>
        mutate((d) => ({ ...d, profile: { ...d.profile, monthly_income: income } })),

      completeOnboarding: (income) =>
        mutate((d) => ({
          ...d,
          profile: { ...d.profile, monthly_income: income, onboarded: true },
        })),

      resetAll: () => {
        const seed = syncCurrentMonth(resetDatabase(currentUser));
        setDb(seed);
      },

      addExpense: (input) => {
        const expense: Expense = {
          ...input,
          owner: input.owner ?? currentUser,
          is_paid: input.is_paid ?? false,
          id: uid(),
          created_at: new Date().toISOString(),
        };
        mutate((d) => syncCurrentMonth({ ...d, expenses: [...d.expenses, expense] }));
        return expense;
      },

      updateExpense: (id, patch) =>
        mutate((d) =>
          syncCurrentMonth({
            ...d,
            expenses: d.expenses.map((e) => (e.id === id ? { ...e, ...patch } : e)),
          }),
        ),

      removeExpense: (id) =>
        mutate((d) =>
          syncCurrentMonth({ ...d, expenses: d.expenses.filter((e) => e.id !== id) }),
        ),

      togglePaid: (id) =>
        mutate((d) => ({
          ...d,
          expenses: d.expenses.map((e) =>
            e.id === id ? { ...e, is_paid: !e.is_paid } : e,
          ),
        })),

      addGoal: (input) =>
        mutate((d) => ({
          ...d,
          goals: [
            ...d.goals,
            {
              ...input,
              current_amount: input.current_amount ?? 0,
              id: uid(),
              created_at: new Date().toISOString(),
            },
          ],
        })),

      updateGoal: (id, patch) =>
        mutate((d) => ({
          ...d,
          goals: d.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)),
        })),

      removeGoal: (id) =>
        mutate((d) => ({ ...d, goals: d.goals.filter((g) => g.id !== id) })),

      contributeGoal: (id, amount) =>
        mutate((d) => ({
          ...d,
          goals: d.goals.map((g) =>
            g.id === id
              ? { ...g, current_amount: Math.max(0, g.current_amount + amount) }
              : g,
          ),
        })),

      addWish: (input) =>
        mutate((d) => ({
          ...d,
          wishlist: [
            ...d.wishlist,
            {
              ...input,
              notified: false,
              status: "wanted",
              purchased_at: null,
              id: uid(),
              created_at: new Date().toISOString(),
            },
          ],
        })),

      updateWish: (id, patch) =>
        mutate((d) => ({
          ...d,
          wishlist: d.wishlist.map((w) => (w.id === id ? { ...w, ...patch } : w)),
        })),

      removeWish: (id) =>
        mutate((d) => ({ ...d, wishlist: d.wishlist.filter((w) => w.id !== id) })),

      scheduleWish: (id, date) =>
        mutate((d) => ({
          ...d,
          wishlist: d.wishlist.map((w) =>
            w.id === id ? { ...w, alert_date: date, notified: false } : w,
          ),
        })),

      dismissAlert: (id) =>
        mutate((d) => ({
          ...d,
          wishlist: d.wishlist.map((w) => (w.id === id ? { ...w, notified: true } : w)),
        })),

      markPurchased: (id) => {
        let purchased: Wishlist | undefined;
        mutate((d) => {
          const wish = d.wishlist.find((w) => w.id === id);
          if (!wish) return d;
          purchased = wish;
          const newExpense: Expense = {
            id: uid(),
            name: wish.name,
            amount: wish.price,
            type: "variable",
            category_id: wish.category_id,
            due_day: null,
            is_paid: true,
            owner: currentUser,
            created_at: new Date().toISOString(),
          };
          return syncCurrentMonth({
            ...d,
            expenses: [...d.expenses, newExpense],
            wishlist: d.wishlist.map((w) =>
              w.id === id
                ? { ...w, status: "purchased", purchased_at: todayISO(), notified: true }
                : w,
            ),
          });
        });
        return purchased;
      },
    };
  }, [db, ready, mutate, currentUser]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within <DataProvider>");
  return ctx;
}
