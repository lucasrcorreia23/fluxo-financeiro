"use client";

import { motion } from "framer-motion";
import {
  CircleCheck,
  CreditCard,
  Gauge,
  Info,
  Lightbulb,
  PiggyBank,
  Repeat,
  Target,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Insight } from "@/lib/insights";
import { fadeUp } from "@/lib/motion";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  gauge: Gauge,
  "trending-up": TrendingUp,
  "trending-down": TrendingDown,
  "triangle-alert": TriangleAlert,
  "circle-check": CircleCheck,
  info: Info,
  lightbulb: Lightbulb,
  "piggy-bank": PiggyBank,
  target: Target,
  repeat: Repeat,
  "credit-card": CreditCard,
};

const SEVERITY: Record<
  Insight["severity"],
  { chip: string; value: string; border: string }
> = {
  good: {
    chip: "from-emerald-400 to-teal-600",
    value: "text-emerald-400",
    border: "border-emerald-500/20",
  },
  warn: {
    chip: "from-amber-400 to-orange-600",
    value: "text-amber-400",
    border: "border-amber-500/20",
  },
  bad: {
    chip: "from-rose-500 to-red-600",
    value: "text-rose-400",
    border: "border-rose-500/20",
  },
  info: {
    chip: "from-indigo-500 to-violet-600",
    value: "text-indigo-300",
    border: "border-indigo-500/20",
  },
};

export function InsightCard({ insight }: { insight: Insight }) {
  const Icon = ICONS[insight.icon] ?? Info;
  const s = SEVERITY[insight.severity];
  return (
    <motion.div variants={fadeUp}>
      <Card className={cn("flex h-full flex-col gap-3", s.border)}>
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white",
              s.chip,
            )}
          >
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold tracking-tight">{insight.title}</h3>
            <p className="mt-0.5 text-sm text-[var(--color-muted)]">
              {insight.description}
            </p>
          </div>
        </div>
        {insight.value && (
          <p className={cn("mt-auto text-2xl font-semibold tnum", s.value)}>
            {insight.value}
          </p>
        )}
      </Card>
    </motion.div>
  );
}
