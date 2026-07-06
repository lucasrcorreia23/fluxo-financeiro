"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { currentMonthKey, todayISO, uid } from "@/lib/utils";
import { useUser } from "@/lib/users/provider";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { AppUser } from "@/lib/users/types";
import { loadDatabase, resetDatabase, saveDatabase } from "./store";
import {
  applyChange,
  loadMember,
  resetMember,
  type Change,
} from "./supabase-repo";
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

const CONFIGURED = isSupabaseConfigured();

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
  const activeMember = useRef<AppUser>(currentUser);
  const dbRef = useRef(db);
  dbRef.current = db;
  // Bumped on each load; a resolved load only commits if it's still the latest.
  const loadToken = useRef(0);

  // Load the viewed member's data whenever it changes (login, switch, mount).
  useEffect(() => {
    if (!userReady) return;
    const token = ++loadToken.current;
    setReady(false);

    const run = async (): Promise<Database> =>
      CONFIGURED ? loadMember(currentUser) : loadDatabase(currentUser);

    run()
      .then((data) => {
        if (token !== loadToken.current) return; // superseded by a newer load
        setDb(syncCurrentMonth(data));
        activeMember.current = currentUser;
        skipPersist.current = true;
        setReady(true);
      })
      .catch((err) => {
        if (token !== loadToken.current) return;
        console.error("Falha ao carregar dados", err);
        toast.error("Não foi possível carregar seus dados", {
          description: "Mostrando dados locais. Verifique sua conexão.",
        });
        setDb(syncCurrentMonth(buildSeed(currentUser)));
        activeMember.current = currentUser;
        skipPersist.current = true;
        setReady(true);
      });
  }, [userReady, currentUser]);

  // Local mode only: persist the whole DB to localStorage on every change.
  // In Supabase mode, mutations persist granularly (see persist()).
  useEffect(() => {
    if (CONFIGURED || !ready || !userReady) return;
    if (skipPersist.current) {
      skipPersist.current = false;
      return;
    }
    saveDatabase(activeMember.current, db);
  }, [db, ready, userReady]);

  const mutate = useCallback((fn: (db: Database) => Database) => {
    setDb((prev) => fn(prev));
  }, []);

  const persist = useCallback((change: Change) => {
    if (!CONFIGURED) return;
    applyChange(activeMember.current, change).catch((err) => {
      console.error("Falha ao salvar", err);
      toast.error("Não foi possível salvar", {
        description: "Sua alteração pode não ter sido gravada.",
      });
    });
  }, []);

  const value = useMemo<DataContextValue>(() => {
    return {
      ready,
      currentUser,
      db,

      setIncome: (income) => {
        mutate((d) => ({ ...d, profile: { ...d.profile, monthly_income: income } }));
        persist({ table: "profile", op: "upsert", patch: { monthly_income: income } });
      },

      completeOnboarding: (income) => {
        mutate((d) => ({
          ...d,
          profile: { ...d.profile, monthly_income: income, onboarded: true },
        }));
        persist({
          table: "profile",
          op: "upsert",
          patch: { monthly_income: income, onboarded: true },
        });
      },

      resetAll: () => {
        if (CONFIGURED) {
          const token = ++loadToken.current;
          setReady(false);
          resetMember(activeMember.current)
            .then((seed) => {
              if (token !== loadToken.current) return;
              setDb(syncCurrentMonth(seed));
              skipPersist.current = true;
              setReady(true);
            })
            .catch((err) => {
              console.error("Falha ao resetar", err);
              toast.error("Não foi possível resetar os dados");
              setReady(true);
            });
        } else {
          setDb(syncCurrentMonth(resetDatabase(currentUser)));
        }
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
        persist({ table: "expenses", op: "insert", row: expense });
        return expense;
      },

      updateExpense: (id, patch) => {
        mutate((d) =>
          syncCurrentMonth({
            ...d,
            expenses: d.expenses.map((e) => (e.id === id ? { ...e, ...patch } : e)),
          }),
        );
        persist({ table: "expenses", op: "update", id, patch });
      },

      removeExpense: (id) => {
        mutate((d) =>
          syncCurrentMonth({ ...d, expenses: d.expenses.filter((e) => e.id !== id) }),
        );
        persist({ table: "expenses", op: "delete", id });
      },

      togglePaid: (id) => {
        const cur = dbRef.current.expenses.find((e) => e.id === id);
        if (!cur) return;
        const is_paid = !cur.is_paid;
        mutate((d) => ({
          ...d,
          expenses: d.expenses.map((e) => (e.id === id ? { ...e, is_paid } : e)),
        }));
        persist({ table: "expenses", op: "update", id, patch: { is_paid } });
      },

      addGoal: (input) => {
        const goal: Goal = {
          ...input,
          current_amount: input.current_amount ?? 0,
          id: uid(),
          created_at: new Date().toISOString(),
        };
        mutate((d) => ({ ...d, goals: [...d.goals, goal] }));
        persist({ table: "goals", op: "insert", row: goal });
      },

      updateGoal: (id, patch) => {
        mutate((d) => ({
          ...d,
          goals: d.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)),
        }));
        persist({ table: "goals", op: "update", id, patch });
      },

      removeGoal: (id) => {
        mutate((d) => ({ ...d, goals: d.goals.filter((g) => g.id !== id) }));
        persist({ table: "goals", op: "delete", id });
      },

      contributeGoal: (id, amount) => {
        const cur = dbRef.current.goals.find((g) => g.id === id);
        if (!cur) return;
        const current_amount = Math.max(0, cur.current_amount + amount);
        mutate((d) => ({
          ...d,
          goals: d.goals.map((g) => (g.id === id ? { ...g, current_amount } : g)),
        }));
        persist({ table: "goals", op: "update", id, patch: { current_amount } });
      },

      addWish: (input) => {
        const wish: Wishlist = {
          ...input,
          notified: false,
          status: "wanted",
          purchased_at: null,
          id: uid(),
          created_at: new Date().toISOString(),
        };
        mutate((d) => ({ ...d, wishlist: [...d.wishlist, wish] }));
        persist({ table: "wishlist", op: "insert", row: wish });
      },

      updateWish: (id, patch) => {
        mutate((d) => ({
          ...d,
          wishlist: d.wishlist.map((w) => (w.id === id ? { ...w, ...patch } : w)),
        }));
        persist({ table: "wishlist", op: "update", id, patch });
      },

      removeWish: (id) => {
        mutate((d) => ({ ...d, wishlist: d.wishlist.filter((w) => w.id !== id) }));
        persist({ table: "wishlist", op: "delete", id });
      },

      scheduleWish: (id, date) => {
        const patch = { alert_date: date, notified: false };
        mutate((d) => ({
          ...d,
          wishlist: d.wishlist.map((w) => (w.id === id ? { ...w, ...patch } : w)),
        }));
        persist({ table: "wishlist", op: "update", id, patch });
      },

      dismissAlert: (id) => {
        mutate((d) => ({
          ...d,
          wishlist: d.wishlist.map((w) => (w.id === id ? { ...w, notified: true } : w)),
        }));
        persist({ table: "wishlist", op: "update", id, patch: { notified: true } });
      },

      markPurchased: (id) => {
        const wish = dbRef.current.wishlist.find((w) => w.id === id);
        if (!wish) return undefined;

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
        const wishPatch: Partial<Wishlist> = {
          status: "purchased",
          purchased_at: todayISO(),
          notified: true,
        };

        mutate((d) =>
          syncCurrentMonth({
            ...d,
            expenses: [...d.expenses, newExpense],
            wishlist: d.wishlist.map((w) => (w.id === id ? { ...w, ...wishPatch } : w)),
          }),
        );
        persist({ table: "expenses", op: "insert", row: newExpense });
        persist({ table: "wishlist", op: "update", id, patch: wishPatch });
        return wish;
      },
    };
  }, [db, ready, mutate, persist, currentUser]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within <DataProvider>");
  return ctx;
}
