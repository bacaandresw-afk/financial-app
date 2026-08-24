"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TransactionForm } from "./transaction-form";
import { useTranslation } from "@/lib/i18n/language-context";

export function AddTransactionSection({
  assetId,
  currency,
  brokers,
}: {
  assetId: string;
  currency: string;
  brokers: { id: string; name: string }[];
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  if (brokers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {t.investments.addTransactionSection.needBroker}
      </p>
    );
  }

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        {t.investments.addTransactionSection.addTransaction}
      </Button>
    );
  }

  return (
    <div className="rounded-lg border border-border p-4 bg-muted/40">
      <TransactionForm
        assetId={assetId}
        currency={currency}
        brokers={brokers}
        onCancel={() => setOpen(false)}
      />
    </div>
  );
}
