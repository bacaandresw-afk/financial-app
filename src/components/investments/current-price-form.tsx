"use client";

import { useActionState } from "react";
import { updateAssetCurrentPrice, type ActionState } from "@/actions/investments";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";
import { useTranslation } from "@/lib/i18n/language-context";

const initialState: ActionState = { error: null };

export function CurrentPriceForm({
  assetId,
  currentPricePerUnit,
  currentPriceUpdatedAt,
  currency,
}: {
  assetId: string;
  currentPricePerUnit: number | null;
  currentPriceUpdatedAt: Date | null;
  currency: string;
}) {
  const { t } = useTranslation();
  const [state, formAction, pending] = useActionState(updateAssetCurrentPrice, initialState);

  return (
    <form action={formAction} className="flex items-end gap-3 flex-wrap">
      <input type="hidden" name="id" value={assetId} />
      <div className="space-y-1.5">
        <Label htmlFor="currentPricePerUnit">
          {t.investments.assetDetail.currentPriceLabel(currency)}
        </Label>
        <Input
          id="currentPricePerUnit"
          name="currentPricePerUnit"
          type="number"
          step="any"
          min="0"
          defaultValue={currentPricePerUnit ?? ""}
          placeholder={t.investments.assetDetail.notSet}
          className="w-40"
        />
      </div>
      <Button type="submit" disabled={pending} variant="secondary">
        {pending ? t.investments.assetDetail.updating : t.investments.assetDetail.updatePrice}
      </Button>
      {currentPriceUpdatedAt && (
        <span className="text-xs text-muted-foreground pb-2.5">
          {t.investments.assetDetail.lastUpdated(formatDate(currentPriceUpdatedAt))}
        </span>
      )}
      <FieldError>{state.error}</FieldError>
    </form>
  );
}
