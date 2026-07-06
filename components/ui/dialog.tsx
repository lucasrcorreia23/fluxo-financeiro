"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className={cn(
              "glass relative z-10 flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-3xl border-white/10 sm:max-w-lg sm:rounded-3xl",
              className,
            )}
          >
            <div className="flex items-start justify-between gap-4 p-6 pb-2">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
                {description && (
                  <p className="mt-0.5 text-sm text-[var(--color-muted)]">{description}</p>
                )}
              </div>
              <button
                onClick={onClose}
                aria-label="Fechar"
                className="rounded-lg p-1.5 text-[var(--color-muted)] transition-colors hover:bg-white/10 hover:text-[var(--color-foreground)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
            {footer && (
              <div className="flex items-center justify-end gap-3 border-t border-[var(--color-border)] p-4">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
