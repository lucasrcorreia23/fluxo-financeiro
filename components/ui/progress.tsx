"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** green → amber → red by percentage (income commitment scale). */
export function commitmentColor(pct: number): string {
  if (pct < 50) return "from-emerald-400 to-teal-500";
  if (pct < 70) return "from-amber-400 to-orange-500";
  return "from-rose-500 to-red-600";
}

export function ProgressBar({
  value,
  gradient,
  className,
  height = "h-2.5",
}: {
  value: number; // 0-100
  gradient?: string; // tailwind from-x to-y; defaults to commitment scale
  className?: string;
  height?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  const grad = gradient ?? commitmentColor(pct);
  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-full bg-white/8 dark:bg-white/5",
        height,
        className,
      )}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className={cn("h-full rounded-full bg-gradient-to-r", grad)}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.1 }}
      />
    </div>
  );
}

/** Circular progress ring used on goal cards. */
export function ProgressRing({
  value,
  size = 64,
  stroke = 6,
  gradientId = "ring-grad",
  from = "#818cf8",
  to = "#e879f9",
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  gradientId?: string;
  from?: string;
  to?: string;
  children?: React.ReactNode;
}) {
  const pct = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-white/10"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ type: "spring", stiffness: 90, damping: 20 }}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 grid place-items-center text-xs font-semibold tnum">
          {children}
        </div>
      )}
    </div>
  );
}
