"use client";

import { motion } from "framer-motion";
import { Heart, Plus, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CategoryIcon } from "@/components/category-icon";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/page-header";
import { WishCard } from "@/components/wish-card";
import { WishDialog, type WishFormValues } from "@/components/wish-dialog";
import { findCategory } from "@/lib/data/categories";
import { useData } from "@/lib/data/provider";
import type { Wishlist } from "@/lib/data/types";
import { fadeUp, stagger } from "@/lib/motion";
import { formatBRL, formatDate } from "@/lib/utils";

type SortKey = "priority" | "price" | "alert";

function sortWishes(list: Wishlist[], key: SortKey): Wishlist[] {
  const arr = [...list];
  arr.sort((a, b) => {
    if (key === "price") {
      // desc, nulls last
      if (a.price == null && b.price == null) return 0;
      if (a.price == null) return 1;
      if (b.price == null) return -1;
      return b.price - a.price;
    }
    if (key === "alert") {
      // asc by date, nulls last
      if (!a.alert_date && !b.alert_date) return 0;
      if (!a.alert_date) return 1;
      if (!b.alert_date) return -1;
      return a.alert_date.localeCompare(b.alert_date);
    }
    // priority asc (1 = alta first)
    return a.priority - b.priority;
  });
  return arr;
}

export default function DesejosPage() {
  const { ready, db, addWish, updateWish, removeWish, scheduleWish, markPurchased } =
    useData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Wishlist | null>(null);
  const [sort, setSort] = useState<SortKey>("priority");

  if (!ready) {
    return (
      <div className="flex flex-col gap-5">
        <div className="skeleton h-9 w-40 rounded-xl" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <CardSkeleton className="h-72" />
          <CardSkeleton className="h-72" />
          <CardSkeleton className="h-72" />
        </div>
      </div>
    );
  }

  const wanted = sortWishes(
    db.wishlist.filter((w) => w.status === "wanted"),
    sort,
  );
  const purchased = db.wishlist.filter((w) => w.status === "purchased");

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (wish: Wishlist) => {
    setEditing(wish);
    setDialogOpen(true);
  };

  const handleSave = (values: WishFormValues, id?: string) => {
    if (id) {
      updateWish(id, values);
      toast.success("Desejo atualizado");
    } else {
      addWish(values);
      toast.success("Desejo adicionado", { description: values.name });
    }
  };

  const handleDelete = (wish: Wishlist) => {
    removeWish(wish.id);
    toast(`${wish.name} removido`);
  };

  const handleSchedule = (id: string, date: string) => {
    scheduleWish(id, date);
    toast.success("Compra agendada", { description: `Alerta em ${formatDate(date)}` });
  };

  const handlePurchase = (id: string) => {
    const wish = markPurchased(id);
    if (wish) toast.success(`${wish.name} comprado`, { description: "Virou um gasto." });
  };

  return (
    <>
      <PageHeader
        title="Desejos"
        subtitle="Sua lista de compras futuras — priorize, agende e transforme em gasto."
        action={
          <div className="flex items-center gap-2">
            <Select
              aria-label="Ordenar por"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="w-auto"
            >
              <option value="priority">Prioridade</option>
              <option value="price">Preço</option>
              <option value="alert">Data de alerta</option>
            </Select>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> Novo desejo
            </Button>
          </div>
        }
      />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-8"
      >
        <section>
          {wanted.length === 0 ? (
            <EmptyState
              icon={Heart}
              title="Nenhum desejo ainda"
              description="Adicione algo que você quer comprar e organize por prioridade."
              action={
                <Button onClick={openCreate}>
                  <Plus className="h-4 w-4" /> Novo desejo
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {wanted.map((wish) => (
                <motion.div key={wish.id} variants={fadeUp}>
                  <WishCard
                    wish={wish}
                    category={findCategory(db.categories, wish.category_id)}
                    onEdit={openEdit}
                    onSchedule={handleSchedule}
                    onPurchase={handlePurchase}
                    onDelete={handleDelete}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {purchased.length > 0 && (
          <motion.section variants={fadeUp}>
            <div className="mb-3 flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-[var(--color-muted)]" />
              <h2 className="text-sm font-semibold text-[var(--color-muted)]">
                Comprados
              </h2>
              <span className="text-xs text-[var(--color-muted)]">
                ({purchased.length})
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {purchased.map((wish) => {
                const category = findCategory(db.categories, wish.category_id);
                return (
                  <div
                    key={wish.id}
                    className="glass flex items-center gap-3 rounded-2xl p-3 opacity-70"
                  >
                    <span
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white ${
                        category?.gradient ?? "from-slate-400 to-slate-600"
                      }`}
                    >
                      <CategoryIcon
                        icon={category?.icon ?? "shapes"}
                        className="h-5 w-5"
                      />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{wish.name}</p>
                      <p className="text-xs text-[var(--color-muted)]">
                        {wish.purchased_at
                          ? `Comprado em ${formatDate(wish.purchased_at)}`
                          : "Comprado"}
                      </p>
                    </div>
                    <span className="ml-auto text-sm font-semibold tnum text-[var(--color-muted)]">
                      {formatBRL(wish.price)}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.section>
        )}
      </motion.div>

      <WishDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        categories={db.categories}
        initial={editing}
        onSave={handleSave}
        onDelete={editing ? () => handleDelete(editing) : undefined}
      />
    </>
  );
}
