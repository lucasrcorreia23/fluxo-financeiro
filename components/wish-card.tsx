"use client";

import {
  CalendarClock,
  Check,
  ExternalLink,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { CategoryIcon } from "@/components/category-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input } from "@/components/ui/field";
import type { Category, Wishlist } from "@/lib/data/types";
import { daysUntilDate, formatBRL, todayISO } from "@/lib/utils";

const PRIORITY: Record<1 | 2 | 3, { tone: "red" | "amber" | "neutral"; label: string }> =
  {
    1: { tone: "red", label: "Alta" },
    2: { tone: "amber", label: "Média" },
    3: { tone: "neutral", label: "Baixa" },
  };

const FALLBACK_GRADIENT = "from-slate-400 to-slate-600";

export function WishCard({
  wish,
  category,
  onEdit,
  onSchedule,
  onPurchase,
  onDelete,
}: {
  wish: Wishlist;
  category: Category | undefined;
  onEdit: (wish: Wishlist) => void;
  onSchedule: (id: string, date: string) => void;
  onPurchase: (id: string) => void;
  onDelete: (wish: Wishlist) => void;
}) {
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [date, setDate] = useState(todayISO());

  const openSchedule = () => {
    setDate(wish.alert_date?.slice(0, 10) || todayISO());
    setScheduleOpen(true);
  };

  const gradient = category?.gradient ?? FALLBACK_GRADIENT;
  const prio = PRIORITY[wish.priority];

  const showAlert = wish.alert_date && !wish.notified;
  const daysToAlert = showAlert ? daysUntilDate(wish.alert_date) : null;

  const confirmSchedule = () => {
    if (!date) return;
    onSchedule(wish.id, date);
    setScheduleOpen(false);
  };

  return (
    <Card className="flex h-full flex-col gap-3 p-4">
      {/* Image / gradient placeholder */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
        {wish.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={wish.image_url}
            alt={wish.name}
            className="h-full w-full max-w-full object-cover"
          />
        ) : (
          <div
            className={`grid h-full w-full place-items-center bg-gradient-to-br text-white/90 ${gradient}`}
          >
            <CategoryIcon icon={category?.icon ?? "shapes"} className="h-12 w-12" />
          </div>
        )}
        {daysToAlert != null && (
          <div className="absolute right-2 top-2">
            {daysToAlert <= 0 ? (
              <Badge tone="amber" pulse>
                comprar hoje
              </Badge>
            ) : (
              <Badge tone="amber">alerta em {daysToAlert}d</Badge>
            )}
          </div>
        )}
      </div>

      {/* Name + priority */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold leading-snug">{wish.name}</h3>
        <Badge tone={prio.tone} className="shrink-0">
          <Star className="h-3 w-3" /> {prio.label}
        </Badge>
      </div>

      {/* Price */}
      <p className="text-lg font-semibold tnum">{formatBRL(wish.price)}</p>

      {/* Category chip + product link */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        {category && (
          <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
            <span
              className={`h-2.5 w-2.5 rounded-full bg-gradient-to-br ${category.gradient}`}
            />
            {category.name}
          </span>
        )}
        {wish.product_url && (
          <a
            href={wish.product_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-muted)] transition-colors hover:text-[var(--color-foreground)]"
          >
            Ver produto <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>

      {/* Actions */}
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
        <Button size="sm" variant="secondary" onClick={openSchedule}>
          <CalendarClock className="h-4 w-4" /> Agendar
        </Button>
        <Button size="sm" variant="primary" onClick={() => onPurchase(wish.id)}>
          <Check className="h-4 w-4" /> Comprei
        </Button>
        <div className="ml-auto flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            aria-label="Editar desejo"
            onClick={() => onEdit(wish)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            aria-label="Excluir desejo"
            onClick={() => onDelete(wish)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Dialog
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        title="Agendar compra"
        description={`Escolha quando quer ser alertado para comprar "${wish.name}".`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setScheduleOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmSchedule}>
              <CalendarClock className="h-4 w-4" /> Agendar
            </Button>
          </>
        }
      >
        <Field label="Data do alerta" htmlFor={`schedule-${wish.id}`}>
          <Input
            id={`schedule-${wish.id}`}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </Field>
      </Dialog>
    </Card>
  );
}
