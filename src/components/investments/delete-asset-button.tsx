"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { deleteAsset, type ActionState } from "@/actions/investments";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/input";
import { useTranslation } from "@/lib/i18n/language-context";

const initialState: ActionState = { error: null };

export function DeleteAssetButton({ assetId, assetName }: { assetId: string; assetName: string }) {
  const { t } = useTranslation();
  const [state, formAction, pending] = useActionState(deleteAsset, initialState);

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={assetId} />
      <Button
        type="submit"
        variant="destructive"
        disabled={pending}
        onClick={(e) => {
          if (!confirm(t.investments.assetDetail.confirmDelete(assetName))) {
            e.preventDefault();
          }
        }}
      >
        <Trash2 className="h-4 w-4" />
        {pending ? t.investments.assetDetail.deleting : t.investments.assetDetail.deleteInvestment}
      </Button>
      <FieldError>{state.error}</FieldError>
    </form>
  );
}
