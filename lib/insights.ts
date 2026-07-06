// Pure insight-derivation layer. No React, no "use client" — just data in,
// insights out. Reuses the finance.ts helpers so the math stays in one place.

import { findCategory } from "@/lib/data/categories";
import type { Database, Goal } from "@/lib/data/types";
import {
  avgMonthlySurplus,
  categoryTrends,
  commitmentPct,
  predictedSurplus,
  spendByCategory,
  totalsByType,
} from "@/lib/finance";
import { currentMonthKey, formatBRL, formatPercent } from "@/lib/utils";

export interface Insight {
  id: string;
  title: string;
  description: string;
  value?: string;
  severity: "good" | "warn" | "bad" | "info";
  icon: string; // lucide key the page maps to a component
}

function plural(n: number): string {
  return n === 1 ? "mês" : "meses";
}

export function buildInsights(db: Database): Insight[] {
  const insights: Insight[] = [];
  const income = db.profile.monthly_income;
  const totals = totalsByType(db.expenses);
  const spend = spendByCategory(db.expenses, db.categories);
  const month = currentMonthKey();

  // 1 — Comprometimento de renda ------------------------------------------
  if (income <= 0) {
    insights.push({
      id: "no-income",
      title: "Defina sua renda",
      description: "Defina sua renda para liberar as análises.",
      severity: "info",
      icon: "info",
    });
  } else {
    const commit = commitmentPct(totals.total, income);
    const severity: Insight["severity"] =
      commit < 50 ? "good" : commit <= 70 ? "warn" : "bad";
    insights.push({
      id: "commitment",
      title: "Comprometimento de renda",
      description:
        severity === "good"
          ? "Seus gastos cabem com folga na sua renda."
          : severity === "warn"
            ? "Boa parte da renda já está comprometida — atenção."
            : "Alerta: os gastos consomem quase toda a renda.",
      value: formatPercent(commit),
      severity,
      icon: severity === "bad" ? "triangle-alert" : "gauge",
    });

    // 2 — Sobra prevista ---------------------------------------------------
    const surplus = predictedSurplus(income, totals.total);
    insights.push({
      id: "surplus",
      title: "Sobra prevista",
      description:
        surplus > 0
          ? "É quanto deve sobrar no fim do mês no ritmo atual."
          : "Seus gastos superam a renda — hora de cortar.",
      value: formatBRL(surplus),
      severity: surplus > 0 ? "good" : "bad",
      icon: surplus > 0 ? "piggy-bank" : "trending-down",
    });
  }

  // 3 — Maior categoria ----------------------------------------------------
  if (spend.length > 0) {
    const top = spend[0];
    insights.push({
      id: "top-category",
      title: "Maior categoria",
      description: `${top.category.name} é sua maior categoria de gasto.`,
      value: formatPercent(top.pct),
      severity: "info",
      icon: "info",
    });
  }

  // 4 — Peso das assinaturas ----------------------------------------------
  const subsTotal = db.expenses.reduce((sum, e) => {
    if (e.amount == null) return sum;
    const cat = findCategory(db.categories, e.category_id);
    const isSubs = e.category_id === "cat-assinaturas" || cat?.name === "Assinaturas";
    return isSubs ? sum + e.amount : sum;
  }, 0);
  if (subsTotal > 0 && income > 0) {
    const subsPct = (subsTotal / income) * 100;
    insights.push({
      id: "subscriptions",
      title: "Peso das assinaturas",
      description:
        subsPct > 8
          ? "Assinaturas pesam na renda — revise o que ainda usa."
          : "Suas assinaturas estão sob controle.",
      value: formatPercent(subsPct, 1),
      severity: subsPct > 8 ? "warn" : "info",
      icon: "repeat",
    });
  }

  // 5 — Variação vs histórico ---------------------------------------------
  const trends = categoryTrends(db.expenses, db.categories, db.monthly_history, month);
  const prevMonths = new Set(
    db.monthly_history.map((h) => h.month).filter((m) => m !== month),
  );
  const riser = trends.find((t) => t.changePct > 15);
  if (riser) {
    insights.push({
      id: "trend-rise",
      title: "Variação vs histórico",
      description: `${riser.category.name} subiu ${formatPercent(riser.changePct)} vs média dos últimos meses.`,
      value: formatPercent(riser.changePct),
      severity: riser.changePct > 40 ? "bad" : "warn",
      icon: "trending-up",
    });
  } else if (prevMonths.size > 0) {
    insights.push({
      id: "trend-stable",
      title: "Gastos estáveis",
      description: "Seus gastos estão estáveis vs meses anteriores.",
      severity: "good",
      icon: "circle-check",
    });
  }
  if (prevMonths.size < 2) {
    insights.push({
      id: "trend-sparse",
      title: "Histórico curto",
      description: "Colete mais meses para análises de tendência.",
      severity: "info",
      icon: "info",
    });
  }

  // 6 — Tempo para metas ---------------------------------------------------
  const rate = avgMonthlySurplus(income, db.monthly_history);
  if (rate > 0 && db.goals.length > 0) {
    let best: { goal: Goal; months: number } | null = null;
    for (const g of db.goals) {
      const remaining = g.target_amount - g.current_amount;
      if (remaining <= 0) continue;
      const months = Math.ceil(remaining / rate);
      if (!best || months < best.months) best = { goal: g, months };
    }
    if (best) {
      insights.push({
        id: "goal-eta",
        title: "Tempo para metas",
        description: `Sua meta ${best.goal.name} chega em ~${best.months} ${plural(best.months)} no ritmo atual.`,
        value: `${best.months} ${plural(best.months)}`,
        severity: "info",
        icon: "target",
      });
    }
  }

  // 7 — Sugestões acionáveis (1–2) ----------------------------------------
  const suggestions: Insight[] = [];
  const nearestGoal = db.goals.find((g) => g.target_amount - g.current_amount > 0);
  if (subsTotal > 0 && nearestGoal) {
    suggestions.push({
      id: "suggest-subs",
      title: "Ideia para acelerar",
      description: `Reduzindo Assinaturas em R$ 30/mês, você chega em ${nearestGoal.name} mais rápido.`,
      severity: "info",
      icon: "lightbulb",
    });
  }
  const cartao = spend.find((s) => s.category.id === "cat-cartao");
  if (cartao && cartao.pct > 25) {
    suggestions.push({
      id: "suggest-cartao",
      title: "Cartão de crédito",
      description: `Cartão de Crédito representa ${formatPercent(cartao.pct)} dos seus gastos.`,
      value: formatPercent(cartao.pct),
      severity: "warn",
      icon: "credit-card",
    });
  }
  insights.push(...suggestions.slice(0, 2));

  return insights;
}
