"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select } from "@/components/ui/field";
import type { Category, Wishlist } from "@/lib/data/types";

/** Shape accepted by addWish / updateWish (mirrors the mutable Wishlist fields). */
export interface WishFormValues {
  name: string;
  price: number | null;
  product_url: string | null;
  image_url: string | null;
  priority: 1 | 2 | 3;
  alert_date: string | null;
  category_id: string | null;
}

export function WishDialog({
  open,
  onClose,
  categories,
  initial,
  onSave,
  onDelete,
}: {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  initial: Wishlist | null;
  onSave: (values: WishFormValues, id?: string) => void;
  onDelete?: () => void;
}) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [priority, setPriority] = useState("2");
  const [alertDate, setAlertDate] = useState("");
  const [categoryId, setCategoryId] = useState("");

  // Re-seed the form during render the moment the dialog transitions to open
  // (create → blank, edit → prefill). Render-phase reset avoids effect churn.
  const [wasOpen, setWasOpen] = useState(false);
  if (open && !wasOpen) {
    setWasOpen(true);
    setName(initial?.name ?? "");
    setPrice(initial?.price != null ? String(initial.price) : "");
    setProductUrl(initial?.product_url ?? "");
    setImageUrl(initial?.image_url ?? "");
    setPriority(String(initial?.priority ?? 2));
    setAlertDate(initial?.alert_date ? initial.alert_date.slice(0, 10) : "");
    setCategoryId(initial?.category_id ?? "");
  } else if (!open && wasOpen) {
    setWasOpen(false);
  }

  const submit = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    const parsedPrice = price.trim() ? parseFloat(price.replace(",", ".")) : null;
    const values: WishFormValues = {
      name: trimmedName,
      price: parsedPrice != null && Number.isFinite(parsedPrice) ? parsedPrice : null,
      product_url: productUrl.trim() || null,
      image_url: imageUrl.trim() || null,
      priority: Number(priority) as 1 | 2 | 3,
      alert_date: alertDate || null,
      category_id: categoryId || null,
    };
    onSave(values, initial?.id);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={initial ? "Editar desejo" : "Novo desejo"}
      description="Algo que você quer comprar — priorize, agende e vire um gasto quando comprar."
      footer={
        <>
          {initial && onDelete && (
            <Button
              variant="danger"
              className="mr-auto"
              onClick={() => {
                onDelete();
                onClose();
              }}
            >
              <Trash2 className="h-4 w-4" /> Excluir
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={submit}>{initial ? "Salvar" : "Adicionar"}</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Nome" htmlFor="wish-name">
          <Input
            id="wish-name"
            autoFocus
            placeholder="Ex: Cadeira ergonômica"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Preço (R$)" htmlFor="wish-price">
            <Input
              id="wish-price"
              inputMode="decimal"
              placeholder="Opcional"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </Field>
          <Field label="Prioridade" htmlFor="wish-priority">
            <Select
              id="wish-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="1">Alta</option>
              <option value="2">Média</option>
              <option value="3">Baixa</option>
            </Select>
          </Field>
        </div>

        <Field label="Link do produto" htmlFor="wish-url">
          <Input
            id="wish-url"
            type="url"
            placeholder="https://..."
            value={productUrl}
            onChange={(e) => setProductUrl(e.target.value)}
          />
        </Field>

        <Field label="Imagem (URL)" htmlFor="wish-image">
          <Input
            id="wish-image"
            placeholder="https://.../foto.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Data de alerta" htmlFor="wish-alert">
            <Input
              id="wish-alert"
              type="date"
              value={alertDate}
              onChange={(e) => setAlertDate(e.target.value)}
            />
          </Field>
          <Field label="Categoria" htmlFor="wish-category">
            <Select
              id="wish-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Sem categoria</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </div>
    </Dialog>
  );
}
