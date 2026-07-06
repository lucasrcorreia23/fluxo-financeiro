import { daysUntilDate, daysUntilDueDay } from "@/lib/utils";
import { findCategory } from "@/lib/data/categories";
import type {
  Category,
  Expense,
  MonthlyHistory,
  Wishlist,
} from "@/lib/data/types";

export interface Totals {
  fixed: number;
  variable: number;
  total: number;
}

export function totalsByType(expenses: Expense[]): Totals {
  let fixed = 0;
  let variable = 0;
  for (const e of expenses) {
    if (e.amount == null) continue;
    if (e.type === "fixed") fixed += e.amount;
    else variable += e.amount;
  }
  return { fixed, variable, total: fixed + variable };
}

export interface CategorySpend {
  category: Category;
  total: number;
  pct: number; // of grand total
}

export function spendByCategory(
  expenses: Expense[],
  categories: Category[],
): CategorySpend[] {
  const byId = new Map<string, number>();
  for (const e of expenses) {
    if (e.amount == null) continue;
    const key = e.category_id ?? "cat-outros";
    byId.set(key, (byId.get(key) ?? 0) + e.amount);
  }
  const grand = Array.from(byId.values()).reduce((a, b) => a + b, 0) || 1;
  return Array.from(byId.entries())
    .map(([id, total]) => {
      const category =
        findCategory(categories, id) ??
        categories.find((c) => c.id === "cat-outros")!;
      return { category, total, pct: (total / grand) * 100 };
    })
    .sort((a, b) => b.total - a.total);
}

export function commitmentPct(total: number, income: number): number {
  if (income <= 0) return 0;
  return (total / income) * 100;
}

export function predictedSurplus(income: number, total: number): number {
  return income - total;
}

export interface UpcomingDue {
  expense: Expense;
  category: Category | undefined;
  days: number;
}

/** Expenses with a due day, sorted by soonest, unpaid first. */
export function upcomingDue(
  expenses: Expense[],
  categories: Category[],
  limit = 5,
): UpcomingDue[] {
  return expenses
    .filter((e) => e.due_day != null && !e.is_paid)
    .map((e) => ({
      expense: e,
      category: findCategory(categories, e.category_id),
      days: daysUntilDueDay(e.due_day) ?? 999,
    }))
    .sort((a, b) => a.days - b.days)
    .slice(0, limit);
}

/** Wishlist items whose alert date has arrived and haven't been dismissed. */
export function activeAlerts(wishlist: Wishlist[]): Wishlist[] {
  return wishlist.filter((w) => {
    if (w.status !== "wanted" || w.notified || !w.alert_date) return false;
    const d = daysUntilDate(w.alert_date);
    return d !== null && d <= 0;
  });
}

export interface CategoryTrend {
  category: Category;
  current: number;
  avgPrev: number;
  changePct: number; // vs avg of previous months
}

/**
 * Compare current-month per-category totals against the average of the
 * previous `lookback` months from monthly_history.
 */
export function categoryTrends(
  expenses: Expense[],
  categories: Category[],
  history: MonthlyHistory[],
  currentMonth: string,
  lookback = 3,
): CategoryTrend[] {
  // current from live expenses
  const current = new Map<string, number>();
  for (const e of expenses) {
    if (e.amount == null || !e.category_id) continue;
    current.set(e.category_id, (current.get(e.category_id) ?? 0) + e.amount);
  }

  // previous months (exclude current)
  const prevMonths = Array.from(
    new Set(history.map((h) => h.month).filter((m) => m !== currentMonth)),
  )
    .sort()
    .slice(-lookback);

  const prevByCat = new Map<string, number[]>();
  for (const h of history) {
    if (!prevMonths.includes(h.month) || !h.category_id) continue;
    const arr = prevByCat.get(h.category_id) ?? [];
    arr.push(h.total);
    prevByCat.set(h.category_id, arr);
  }

  const ids = new Set<string>([...current.keys(), ...prevByCat.keys()]);
  const trends: CategoryTrend[] = [];
  for (const id of ids) {
    const category = findCategory(categories, id);
    if (!category) continue;
    const cur = current.get(id) ?? 0;
    const prev = prevByCat.get(id) ?? [];
    const avgPrev = prev.length ? prev.reduce((a, b) => a + b, 0) / prev.length : 0;
    const changePct = avgPrev > 0 ? ((cur - avgPrev) / avgPrev) * 100 : 0;
    trends.push({ category, current: cur, avgPrev, changePct });
  }
  return trends.sort((a, b) => b.changePct - a.changePct);
}

/** Average monthly surplus using history totals vs income. */
export function avgMonthlySurplus(
  income: number,
  history: MonthlyHistory[],
): number {
  const byMonth = new Map<string, number>();
  for (const h of history) {
    byMonth.set(h.month, (byMonth.get(h.month) ?? 0) + h.total);
  }
  if (byMonth.size === 0) return income;
  const avgSpend =
    Array.from(byMonth.values()).reduce((a, b) => a + b, 0) / byMonth.size;
  return income - avgSpend;
}
