"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { createAsset, type ActionState } from "@/actions/investments";
import { ASSET_TYPES, CURRENCIES } from "@/lib/validations";
import { formatCurrency, todayDateInputValue } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea, FieldError } from "@/components/ui/input";
import { ASSET_TYPE_LABELS } from "./asset-type-labels";

const initialState: ActionState = { error: null };

export function NewInvestmentForm({ brokers }: { brokers: { id: string; name: string }[] }) {
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
        <p>You need at least one broker before adding an investment.</p>
        <Link href="/investments/brokers">
          <Button type="button">Add a broker</Button>
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" placeholder="e.g. Apple Inc." required autoFocus />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="type">Type</Label>
          <Select id="type" name="type" required defaultValue={ASSET_TYPES[0]}>
            {ASSET_TYPES.map((type) => (
              <option key={type} value={type}>
                {ASSET_TYPE_LABELS[type]}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="currency">Currency</Label>
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
          <Label htmlFor="brokerId">Broker</Label>
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
        <h3 className="text-sm font-medium mb-3">First purchase</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              required
              defaultValue={todayDateInputValue()}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="quantity">Quantity</Label>
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
            <Label htmlFor="pricePerUnit">Price per unit</Label>
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
            <Label>Total</Label>
            <div className="h-11 flex items-center px-3 rounded-lg border border-border bg-muted text-sm font-medium">
              {total != null ? formatCurrency(total, currency) : "—"}
            </div>
          </div>
        </div>
        <div className="space-y-1.5 mt-4">
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea id="notes" name="notes" placeholder="Optional notes about this purchase" />
        </div>
      </div>

      <FieldError>{state.error}</FieldError>
      <Button type="submit" disabled={pending} size="lg">
        {pending ? "Adding…" : "Add investment"}
      </Button>
    </form>
  );
}
