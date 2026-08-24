"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { createAsset, type ActionState } from "@/actions/investments";
import { ASSET_TYPES, CURRENCIES } from "@/lib/validations";
import { formatCurrency, todayDateInputValue } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea, FieldError } from "@/components/ui/input";
import { getAssetTypeLabels } from "./asset-type-labels";
import { useTranslation } from "@/lib/i18n/language-context";

const initialState: ActionState = { error: null };

export function NewInvestmentForm({ brokers }: { brokers: { id: string; name: string }[] }) {
  const { t } = useTranslation();
  const ASSET_TYPE_LABELS = getAssetTypeLabels(t.investments);
  const [state, formAction, pending] = useActionState(createAsset, initialState);
  const [quantity, setQuantity] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [currency, setCurrency] = useState<(typeof CURRENCIES)[number]>(CURRENCIES[0]);

  const total = useMemo(() => {
    const q = Number(quantity);
    const p = Number(pricePerUnit);
    if (!Number.isFinite(q) || !Number.isFinite(p)) return null;
    return q * p;
  }, [quantity, pricePerUnit]);

  if (brokers.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-5 text-sm space-y-3">
        <p>{t.investments.form.needBroker}</p>
        <Link href="/investments/brokers">
          <Button type="button">{t.investments.form.addBroker}</Button>
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">{t.common.name}</Label>
          <Input
            id="name"
            name="name"
            placeholder={t.investments.form.namePlaceholder}
            required
            autoFocus
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="type">{t.investments.form.type}</Label>
          <Select id="type" name="type" required defaultValue={ASSET_TYPES[0]}>
            {ASSET_TYPES.map((type) => (
              <option key={type} value={type}>
                {ASSET_TYPE_LABELS[type]}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="currency">{t.common.currency}</Label>
          <Select
            id="currency"
            name="currency"
            required
            value={currency}
            onChange={(e) => setCurrency(e.target.value as (typeof CURRENCIES)[number])}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="brokerId">{t.investments.form.broker}</Label>
          <Select id="brokerId" name="brokerId" required defaultValue={brokers[0]?.id}>
            {brokers.map((broker) => (
              <option key={broker.id} value={broker.id}>
                {broker.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="border-t border-border pt-5">
        <h3 className="text-sm font-medium mb-3">{t.investments.form.firstPurchase}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="date">{t.common.date}</Label>
            <Input
              id="date"
              name="date"
              type="date"
              required
              defaultValue={todayDateInputValue()}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="quantity">{t.investments.form.quantity}</Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              step="any"
              min="0"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pricePerUnit">{t.investments.form.pricePerUnit}</Label>
            <Input
              id="pricePerUnit"
              name="pricePerUnit"
              type="number"
              step="any"
              min="0"
              required
              value={pricePerUnit}
              onChange={(e) => setPricePerUnit(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t.investments.form.total}</Label>
            <div className="h-11 flex items-center px-3 rounded-lg border border-border bg-muted text-sm font-medium">
              {total != null ? formatCurrency(total, currency) : "—"}
            </div>
          </div>
        </div>
        <div className="space-y-1.5 mt-4">
          <Label htmlFor="notes">{t.investments.form.notesOptional}</Label>
          <Textarea id="notes" name="notes" placeholder={t.investments.form.notesPlaceholder} />
        </div>
      </div>

      <FieldError>{state.error}</FieldError>
      <Button type="submit" disabled={pending} size="lg">
        {pending ? t.investments.form.submitting : t.investments.form.submit}
      </Button>
    </form>
  );
}
