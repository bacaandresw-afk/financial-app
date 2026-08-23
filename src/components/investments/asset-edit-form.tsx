"use client";

import { useActionState } from "react";
import { updateAsset, type ActionState } from "@/actions/investments";
import { ASSET_TYPES, CURRENCIES } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea, FieldError } from "@/components/ui/input";
import { ASSET_TYPE_LABELS } from "./asset-type-labels";

const initialState: ActionState = { error: null };

export type EditableAsset = {
  id: string;
  name: string;
  type: (typeof ASSET_TYPES)[number];
  currency: (typeof CURRENCIES)[number];
  notes: string | null;
};

export function AssetEditForm({ asset }: { asset: EditableAsset }) {
  const [state, formAction, pending] = useActionState(updateAsset, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={asset.id} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" defaultValue={asset.name} required autoFocus />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="type">Type</Label>
          <Select id="type" name="type" required defaultValue={asset.type}>
            {ASSET_TYPES.map((type) => (
              <option key={type} value={type}>
                {ASSET_TYPE_LABELS[type]}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="currency">Currency</Label>
          <Select id="currency" name="currency" required defaultValue={asset.currency}>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea id="notes" name="notes" defaultValue={asset.notes ?? ""} />
      </div>
      <FieldError>{state.error}</FieldError>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
