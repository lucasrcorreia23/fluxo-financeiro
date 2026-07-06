import { createClient } from "@/lib/supabase/client";
import type { AppUser } from "@/lib/users/types";
import { CATEGORIES } from "./categories";
import { buildSeed } from "./seed";
import type {
  Database,
  Expense,
  Goal,
  MonthlyHistory,
  Profile,
  Wishlist,
} from "./types";

// A single browser client for the whole app (avoids multiple GoTrue instances).
let cached: ReturnType<typeof createClient> | null = null;
function db() {
  return (cached ??= createClient());
}

/* ------------------------------------------------------------------ *
 * Row shapes (DB adds a `member` column the domain types don't carry) *
 * ------------------------------------------------------------------ */

type Num = number | string | null;
const num = (v: Num): number => (v == null ? 0 : Number(v));
const numOrNull = (v: Num): number | null => (v == null ? null : Number(v));

interface ProfileRow {
  member: string;
  monthly_income: Num;
  currency: string;
  onboarded: boolean;
}
interface ExpenseRow {
  id: string;
  name: string;
  amount: Num;
  type: Expense["type"];
  category_id: string | null;
  due_day: number | null;
  is_paid: boolean;
  owner: string | null;
  created_at: string;
}
interface GoalRow {
  id: string;
  name: string;
  target_amount: Num;
  current_amount: Num;
  deadline: string | null;
  color: string | null;
  created_at: string;
}
interface WishRow {
  id: string;
  name: string;
  price: Num;
  product_url: string | null;
  image_url: string | null;
  priority: number;
  alert_date: string | null;
  notified: boolean;
  status: Wishlist["status"];
  purchased_at: string | null;
  category_id: string | null;
  created_at: string;
}
interface HistoryRow {
  id: string;
  month: string;
  category_id: string | null;
  total: Num;
}

function mapProfile(r: ProfileRow): Profile {
  return {
    id: r.member,
    monthly_income: num(r.monthly_income),
    currency: r.currency,
    onboarded: r.onboarded,
  };
}
function mapExpense(r: ExpenseRow): Expense {
  return {
    id: r.id,
    name: r.name,
    amount: numOrNull(r.amount),
    type: r.type,
    category_id: r.category_id,
    due_day: r.due_day,
    is_paid: r.is_paid,
    owner: r.owner,
    created_at: r.created_at,
  };
}
function mapGoal(r: GoalRow): Goal {
  return {
    id: r.id,
    name: r.name,
    target_amount: num(r.target_amount),
    current_amount: num(r.current_amount),
    deadline: r.deadline,
    color: r.color,
    created_at: r.created_at,
  };
}
function mapWish(r: WishRow): Wishlist {
  return {
    id: r.id,
    name: r.name,
    price: numOrNull(r.price),
    product_url: r.product_url,
    image_url: r.image_url,
    priority: (r.priority as Wishlist["priority"]) ?? 2,
    alert_date: r.alert_date,
    notified: r.notified,
    status: r.status,
    purchased_at: r.purchased_at,
    category_id: r.category_id,
    created_at: r.created_at,
  };
}
function mapHistory(r: HistoryRow): MonthlyHistory {
  return {
    id: r.id,
    month: r.month,
    category_id: r.category_id,
    total: num(r.total),
  };
}

/* ------------------------------------------------------------------ *
 * Granular mutations (Change union) — persisted after optimistic UI    *
 * ------------------------------------------------------------------ */

export type Change =
  | { table: "expenses"; op: "insert"; row: Expense }
  | { table: "expenses"; op: "update"; id: string; patch: Partial<Expense> }
  | { table: "expenses"; op: "delete"; id: string }
  | { table: "goals"; op: "insert"; row: Goal }
  | { table: "goals"; op: "update"; id: string; patch: Partial<Goal> }
  | { table: "goals"; op: "delete"; id: string }
  | { table: "wishlist"; op: "insert"; row: Wishlist }
  | { table: "wishlist"; op: "update"; id: string; patch: Partial<Wishlist> }
  | { table: "wishlist"; op: "delete"; id: string }
  | { table: "profile"; op: "upsert"; patch: Partial<Profile> };

export async function applyChange(member: AppUser, change: Change): Promise<void> {
  const c = db();

  if (change.table === "profile") {
    const { error } = await c.from("profiles").upsert(
      {
        member,
        monthly_income: change.patch.monthly_income,
        currency: change.patch.currency,
        onboarded: change.patch.onboarded,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "member" },
    );
    if (error) throw error;
    return;
  }

  if (change.op === "insert") {
    const { error } = await c.from(change.table).insert({ ...change.row, member });
    if (error) throw error;
    return;
  }
  if (change.op === "update") {
    const { error } = await c
      .from(change.table)
      .update(change.patch)
      .eq("id", change.id)
      .eq("member", member);
    if (error) throw error;
    return;
  }
  // delete
  const { error } = await c
    .from(change.table)
    .delete()
    .eq("id", change.id)
    .eq("member", member);
  if (error) throw error;
}

/* ------------------------------------------------------------------ *
 * Load / seed / reset per member                                       *
 * ------------------------------------------------------------------ */

async function seedMember(member: AppUser): Promise<Database> {
  const c = db();
  const seed = buildSeed(member);

  const stamp = <T extends object>(rows: T[]) => rows.map((r) => ({ ...r, member }));

  const results = await Promise.all([
    c.from("expenses").insert(stamp(seed.expenses)),
    c.from("goals").insert(stamp(seed.goals)),
    c.from("wishlist").insert(stamp(seed.wishlist)),
    c.from("monthly_history").insert(stamp(seed.monthly_history)),
    c.from("profiles").insert({
      member,
      monthly_income: seed.profile.monthly_income,
      currency: seed.profile.currency,
      onboarded: seed.profile.onboarded,
    }),
  ]);
  const failed = results.find((r) => r.error);
  if (failed?.error) throw failed.error;

  return seed;
}

// Dedupe concurrent loads for the same member (e.g. React StrictMode's
// double-invoke in dev) so first-run seeding only happens once.
const inflight = new Map<AppUser, Promise<Database>>();

/** Load a member's full dataset, seeding the demo data on first access. */
export function loadMember(member: AppUser): Promise<Database> {
  const existing = inflight.get(member);
  if (existing) return existing;
  const p = loadMemberImpl(member).finally(() => inflight.delete(member));
  inflight.set(member, p);
  return p;
}

async function loadMemberImpl(member: AppUser): Promise<Database> {
  const c = db();

  const { data: profileRow, error: profileErr } = await c
    .from("profiles")
    .select("*")
    .eq("member", member)
    .maybeSingle();
  if (profileErr) throw profileErr;

  // Profile row is the "seeded" sentinel — absent means first run.
  if (!profileRow) return seedMember(member);

  const [expenses, goals, wishlist, history] = await Promise.all([
    c.from("expenses").select("*").eq("member", member),
    c.from("goals").select("*").eq("member", member),
    c.from("wishlist").select("*").eq("member", member),
    c.from("monthly_history").select("*").eq("member", member),
  ]);
  const failed = [expenses, goals, wishlist, history].find((r) => r.error);
  if (failed?.error) throw failed.error;

  return {
    profile: mapProfile(profileRow as ProfileRow),
    categories: CATEGORIES,
    expenses: ((expenses.data ?? []) as ExpenseRow[]).map(mapExpense),
    goals: ((goals.data ?? []) as GoalRow[]).map(mapGoal),
    wishlist: ((wishlist.data ?? []) as WishRow[]).map(mapWish),
    monthly_history: ((history.data ?? []) as HistoryRow[]).map(mapHistory),
  };
}

/** Wipe a member's data and reseed from scratch. */
export async function resetMember(member: AppUser): Promise<Database> {
  const c = db();
  const results = await Promise.all([
    c.from("expenses").delete().eq("member", member),
    c.from("goals").delete().eq("member", member),
    c.from("wishlist").delete().eq("member", member),
    c.from("monthly_history").delete().eq("member", member),
    c.from("profiles").delete().eq("member", member),
  ]);
  const failed = results.find((r) => r.error);
  if (failed?.error) throw failed.error;
  return seedMember(member);
}
