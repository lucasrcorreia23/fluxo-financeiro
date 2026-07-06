"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "icon";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40",
  secondary:
    "bg-white/5 text-[var(--color-foreground)] border border-[var(--color-border)] hover:bg-white/10 dark:bg-white/5",
  ghost: "text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-white/5",
  danger:
    "bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  icon: "h-9 w-9 justify-center",
};

export interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "inline-flex cursor-pointer items-center rounded-xl font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
