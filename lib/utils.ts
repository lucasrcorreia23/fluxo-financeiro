import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes with conflict resolution. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/** Format a number as Brazilian Real. Nullish → em-dash placeholder. */
export function formatBRL(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return brl.format(value);
}

/** Compact currency for tight spaces, e.g. R$ 2,8 mil. */
export function formatBRLCompact(value: number): string {
  if (Math.abs(value) >= 1000) {
    return `R$ ${(value / 1000).toLocaleString("pt-BR", {
      maximumFractionDigits: 1,
    })} mil`;
  }
  return brl.format(value);
}

/** Percent with pt-BR formatting. */
export function formatPercent(value: number, digits = 0): string {
  return `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}%`;
}

const monthFmt = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
});
const dayFmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
});

export function formatMonth(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return monthFmt.format(d);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return dayFmt.format(d);
}

/** First day of the current month as an ISO date (YYYY-MM-01). */
export function currentMonthKey(): string {
  const now = new Date();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${m}-01`;
}

/**
 * Days from today until the next occurrence of `dueDay` (1-31) this or next month.
 * Returns the number of days (0 = today).
 */
export function daysUntilDueDay(dueDay: number | null | undefined): number | null {
  if (!dueDay) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const year = today.getFullYear();
  const month = today.getMonth();
  const clamp = (y: number, m: number) => {
    const last = new Date(y, m + 1, 0).getDate();
    return Math.min(dueDay, last);
  };
  let due = new Date(year, month, clamp(year, month));
  if (due < today) {
    due = new Date(year, month + 1, clamp(year, month + 1));
  }
  return Math.round((due.getTime() - today.getTime()) / 86_400_000);
}

/** Days from today until a given ISO date (negative = in the past). */
export function daysUntilDate(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(iso + (iso.length <= 10 ? "T00:00:00" : ""));
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Lightweight unique id (crypto when available). */
export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e9).toString(36)}`;
}
