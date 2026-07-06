import type { Category } from "./types";

// Visual catalog from the spec's "Direção visual" table. Stable ids so seeded
// expenses/history can reference them.
export const CATEGORIES: Category[] = [
  {
    id: "cat-moradia",
    name: "Moradia",
    gradient: "from-indigo-500 to-violet-600",
    accent: "indigo",
    icon: "home",
  },
  {
    id: "cat-utilidades",
    name: "Utilidades",
    gradient: "from-amber-400 to-orange-600",
    accent: "amber",
    icon: "zap",
  },
  {
    id: "cat-telefonia",
    name: "Telefonia",
    gradient: "from-cyan-400 to-blue-600",
    accent: "cyan",
    icon: "smartphone",
  },
  {
    id: "cat-saude",
    name: "Saúde",
    gradient: "from-rose-400 to-pink-600",
    accent: "rose",
    icon: "heart-pulse",
  },
  {
    id: "cat-assinaturas",
    name: "Assinaturas",
    gradient: "from-fuchsia-500 to-purple-600",
    accent: "fuchsia",
    icon: "repeat",
  },
  {
    id: "cat-cartao",
    name: "Cartão de Crédito",
    gradient: "from-emerald-400 to-teal-600",
    accent: "emerald",
    icon: "credit-card",
  },
  {
    id: "cat-alimentacao",
    name: "Alimentação",
    gradient: "from-lime-400 to-green-600",
    accent: "lime",
    icon: "utensils",
  },
  {
    id: "cat-lazer",
    name: "Lazer",
    gradient: "from-sky-400 to-indigo-600",
    accent: "sky",
    icon: "party-popper",
  },
  {
    id: "cat-outros",
    name: "Outros",
    gradient: "from-slate-400 to-slate-600",
    accent: "slate",
    icon: "shapes",
  },
];

// Accent → concrete color values for glows, rings, chart slices (Tailwind can't
// build class names from runtime strings, so we keep an explicit map).
export const ACCENT_HEX: Record<string, string> = {
  indigo: "#6366f1",
  amber: "#f59e0b",
  cyan: "#22d3ee",
  rose: "#fb7185",
  fuchsia: "#d946ef",
  emerald: "#10b981",
  lime: "#84cc16",
  sky: "#38bdf8",
  slate: "#94a3b8",
};

export function accentHex(accent: string | undefined): string {
  return (accent && ACCENT_HEX[accent]) || "#94a3b8";
}

export function findCategory(
  categories: Category[],
  id: string | null | undefined,
): Category | undefined {
  if (!id) return undefined;
  return categories.find((c) => c.id === id);
}
