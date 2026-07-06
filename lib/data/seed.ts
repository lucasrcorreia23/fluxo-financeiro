import { uid } from "@/lib/utils";
import type { AppUser } from "@/lib/users/types";
import { CATEGORIES } from "./categories";
import type { Database, Expense, Goal, MonthlyHistory, Wishlist } from "./types";

function monthsAgoKey(n: number): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - n);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${d.getFullYear()}-${m}-01`;
}

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function seedExpenses(user: AppUser): Expense[] {
  const now = new Date().toISOString();
  const shared: Array<Omit<Expense, "id" | "created_at">> = [
    { name: "Aluguel", amount: 2800, type: "fixed", category_id: "cat-moradia", due_day: 5, is_paid: false, owner: null },
    { name: "Condomínio", amount: 680, type: "fixed", category_id: "cat-moradia", due_day: 10, is_paid: false, owner: null },
    { name: "Luz", amount: null, type: "variable", category_id: "cat-utilidades", due_day: 20, is_paid: false, owner: null },
    { name: "Internet", amount: null, type: "fixed", category_id: "cat-utilidades", due_day: 15, is_paid: false, owner: null },
    { name: "Gás", amount: null, type: "variable", category_id: "cat-utilidades", due_day: null, is_paid: false, owner: null },
  ];

  const lucas: Array<Omit<Expense, "id" | "created_at">> = [
    ...shared,
    { name: "Telefone", amount: 50, type: "fixed", category_id: "cat-telefonia", due_day: 8, is_paid: false, owner: "Lucas" },
    { name: "Cartão de crédito", amount: 3000, type: "variable", category_id: "cat-cartao", due_day: 7, is_paid: false, owner: "Lucas" },
    { name: "Youtube", amount: 34.9, type: "fixed", category_id: "cat-assinaturas", due_day: 2, is_paid: false, owner: "Lucas" },
  ];

  const vanessa: Array<Omit<Expense, "id" | "created_at">> = [
    ...shared,
    { name: "Telefone", amount: 45, type: "fixed", category_id: "cat-telefonia", due_day: 8, is_paid: false, owner: "Vanessa" },
    { name: "Dentista", amount: 360, type: "fixed", category_id: "cat-saude", due_day: 12, is_paid: false, owner: "Vanessa" },
    { name: "Apple", amount: 5.9, type: "fixed", category_id: "cat-assinaturas", due_day: 3, is_paid: false, owner: "Vanessa" },
    { name: "Spotify", amount: 23.9, type: "fixed", category_id: "cat-assinaturas", due_day: 18, is_paid: false, owner: "Vanessa" },
  ];

  const rows = user === "Lucas" ? lucas : vanessa;
  return rows.map((r) => ({ ...r, id: uid(), created_at: now }));
}

function seedGoals(user: AppUser): Goal[] {
  const now = new Date().toISOString();

  if (user === "Lucas") {
    return [
      {
        id: uid(),
        name: "Reserva de emergência",
        target_amount: 18000,
        current_amount: 6200,
        deadline: null,
        color: "from-emerald-400 to-teal-600",
        created_at: now,
      },
      {
        id: uid(),
        name: "Trocar notebook",
        target_amount: 7500,
        current_amount: 800,
        deadline: daysFromNow(150),
        color: "from-fuchsia-500 to-purple-600",
        created_at: now,
      },
    ];
  }

  return [
    {
      id: uid(),
      name: "Viagem Chile",
      target_amount: 9000,
      current_amount: 2400,
      deadline: daysFromNow(240),
      color: "from-sky-400 to-indigo-600",
      created_at: now,
    },
    {
      id: uid(),
      name: "Curso de inglês",
      target_amount: 3200,
      current_amount: 900,
      deadline: daysFromNow(120),
      color: "from-rose-400 to-pink-600",
      created_at: now,
    },
  ];
}

function seedWishlist(user: AppUser): Wishlist[] {
  const now = new Date().toISOString();

  if (user === "Lucas") {
    return [
      {
        id: uid(),
        name: "Monitor LG UltraWide 34”",
        price: 2199,
        product_url: "https://www.lg.com/br/monitores",
        image_url: null,
        priority: 1,
        alert_date: daysFromNow(14),
        notified: false,
        status: "wanted",
        category_id: "cat-outros",
        purchased_at: null,
        created_at: now,
      },
      {
        id: uid(),
        name: "Cadeira ergonômica",
        price: 1290,
        product_url: "https://example.com/cadeira",
        image_url: null,
        priority: 2,
        alert_date: daysFromNow(30),
        notified: false,
        status: "wanted",
        category_id: "cat-outros",
        purchased_at: null,
        created_at: now,
      },
    ];
  }

  return [
    {
      id: uid(),
      name: "AirFryer Mondial",
      price: 459.9,
      product_url: "https://example.com/airfryer",
      image_url: null,
      priority: 1,
      alert_date: daysFromNow(0),
      notified: false,
      status: "wanted",
      category_id: "cat-alimentacao",
      purchased_at: null,
      created_at: now,
    },
    {
      id: uid(),
      name: "Kit skincare",
      price: 289,
      product_url: "https://example.com/skincare",
      image_url: null,
      priority: 2,
      alert_date: daysFromNow(10),
      notified: false,
      status: "wanted",
      category_id: "cat-outros",
      purchased_at: null,
      created_at: now,
    },
  ];
}

// Prior 3 months of per-category snapshots so trend insights have something to
// compare against. Multipliers create a small realistic drift per category.
function seedHistory(expenses: Expense[]): MonthlyHistory[] {
  const baseByCat = new Map<string, number>();
  for (const e of expenses) {
    if (!e.category_id) continue;
    baseByCat.set(e.category_id, (baseByCat.get(e.category_id) ?? 0) + (e.amount ?? 0));
  }
  // Fill in a plausible base for utilities (Luz/Gás are null in current month).
  baseByCat.set("cat-utilidades", (baseByCat.get("cat-utilidades") ?? 0) + 260);

  // month index 3 = oldest, 1 = last month. factor per category & month.
  const drift: Record<string, number[]> = {
    "cat-cartao": [0.78, 0.9, 1.05],
    "cat-assinaturas": [0.72, 0.85, 1.0],
    "cat-utilidades": [1.15, 0.95, 1.05],
  };

  const rows: MonthlyHistory[] = [];
  for (let n = 3; n >= 1; n--) {
    const month = monthsAgoKey(n);
    for (const [catId, base] of baseByCat) {
      const factors = drift[catId] ?? [0.98, 1.0, 1.02];
      const factor = factors[3 - n] ?? 1;
      rows.push({
        id: uid(),
        month,
        category_id: catId,
        total: Math.round(base * factor * 100) / 100,
      });
    }
  }
  return rows;
}

export function buildSeed(user: AppUser = "Lucas"): Database {
  const expenses = seedExpenses(user);
  return {
    profile: {
      id: uid(),
      monthly_income: 0,
      currency: "BRL",
      onboarded: false,
    },
    categories: CATEGORIES,
    expenses,
    goals: seedGoals(user),
    wishlist: seedWishlist(user),
    monthly_history: seedHistory(expenses),
  };
}
