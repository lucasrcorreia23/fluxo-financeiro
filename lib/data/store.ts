import { CATEGORIES } from "./categories";
import { buildSeed } from "./seed";
import type { Database } from "./types";
import type { AppUser } from "@/lib/users/types";

const LEGACY_KEY = "fluxo.db.v1";

function storageKey(user: AppUser): string {
  return `fluxo.db.v1.${user}`;
}

function migrateLegacyDatabase(): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(LEGACY_KEY);
    if (!raw) return;
    if (window.localStorage.getItem(storageKey("Lucas"))) return;

    window.localStorage.setItem(storageKey("Lucas"), raw);
    window.localStorage.removeItem(LEGACY_KEY);
  } catch {
    /* ignore */
  }
}

/** Load the database for a user from localStorage, seeding on first run. */
export function loadDatabase(user: AppUser): Database {
  if (typeof window === "undefined") return buildSeed(user);
  try {
    migrateLegacyDatabase();
    const key = storageKey(user);
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      const seed = buildSeed(user);
      window.localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw) as Database;
    // The visual catalog is code-owned — always refresh it so new categories
    // or gradient tweaks land without a reset.
    parsed.categories = CATEGORIES;
    return parsed;
  } catch {
    return buildSeed(user);
  }
}

export function saveDatabase(user: AppUser, db: Database): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(user), JSON.stringify(db));
  } catch {
    /* quota / privacy mode — ignore, state stays in memory */
  }
}

export function resetDatabase(user: AppUser): Database {
  const seed = buildSeed(user);
  saveDatabase(user, seed);
  return seed;
}
