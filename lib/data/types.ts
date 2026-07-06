// Domain types — mirror the Supabase schema so the store can flip from
// localStorage to Supabase without touching the UI.

export type ExpenseType = "fixed" | "variable";
export type WishStatus = "wanted" | "purchased";

export interface Category {
  id: string;
  name: string;
  gradient: string; // e.g. 'from-indigo-500 to-violet-600'
  accent: string; // e.g. 'indigo'
  icon: string; // lucide icon key, e.g. 'home'
}

export interface Expense {
  id: string;
  name: string;
  amount: number | null; // null = value not filled yet (e.g. Luz)
  type: ExpenseType;
  category_id: string | null;
  due_day: number | null; // 1-31
  is_paid: boolean;
  owner: string | null; // 'Lucas' | 'Vanessa' | null
  created_at: string;
}

export interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null; // ISO date
  color: string | null; // optional gradient
  created_at: string;
}

export interface Wishlist {
  id: string;
  name: string;
  price: number | null;
  product_url: string | null;
  image_url: string | null;
  priority: 1 | 2 | 3; // 1 alta, 2 média, 3 baixa
  alert_date: string | null; // "me alerte no dia X"
  notified: boolean;
  status: WishStatus;
  purchased_at: string | null;
  category_id: string | null;
  created_at: string;
}

export interface MonthlyHistory {
  id: string;
  month: string; // first day of month, ISO date
  category_id: string | null;
  total: number;
}

export interface Profile {
  id: string;
  monthly_income: number;
  currency: string;
  onboarded: boolean;
}

export interface Database {
  profile: Profile;
  categories: Category[];
  expenses: Expense[];
  goals: Goal[];
  wishlist: Wishlist[];
  monthly_history: MonthlyHistory[];
}
