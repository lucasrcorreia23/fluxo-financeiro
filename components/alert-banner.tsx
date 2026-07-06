"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BellRing, Check, ExternalLink, X } from "lucide-react";
import type { Wishlist } from "@/lib/data/types";
import { formatBRL } from "@/lib/utils";

export function AlertBanner({
  alerts,
  onDismiss,
  onPurchase,
}: {
  alerts: Wishlist[];
  onDismiss: (id: string) => void;
  onPurchase: (id: string) => void;
}) {
  return (
    <AnimatePresence initial={false}>
      {alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div className="glass rounded-3xl border-amber-400/30 bg-amber-400/[0.06] p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-amber-400/20 text-amber-400">
                <BellRing className="h-[18px] w-[18px]" />
              </span>
              <div>
                <p className="text-sm font-semibold">Hora de comprar</p>
                <p className="text-xs text-[var(--color-muted)]">
                  {alerts.length} item{alerts.length > 1 ? "s" : ""} agendado
                  {alerts.length > 1 ? "s" : ""} chegou na data
                </p>
              </div>
            </div>
            <ul className="flex flex-col gap-2">
              {alerts.map((w) => (
                <li
                  key={w.id}
                  className="flex flex-wrap items-center gap-2 rounded-2xl bg-white/5 px-3 py-2"
                >
                  <span className="font-medium">{w.name}</span>
                  <span className="text-sm text-[var(--color-muted)] tnum">
                    {formatBRL(w.price)}
                  </span>
                  <div className="ml-auto flex items-center gap-1.5">
                    {w.product_url && (
                      <a
                        href={w.product_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-2.5 py-1.5 text-xs font-medium text-[var(--color-muted)] transition-colors hover:text-[var(--color-foreground)]"
                      >
                        Abrir <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => onPurchase(w.id)}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/15 px-2.5 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/25"
                    >
                      <Check className="h-3.5 w-3.5" /> Comprei
                    </button>
                    <button
                      onClick={() => onDismiss(w.id)}
                      aria-label="Dispensar alerta"
                      className="rounded-lg p-1.5 text-[var(--color-muted)] transition-colors hover:bg-white/10 hover:text-[var(--color-foreground)]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
