"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TransactionForm } from "./transaction-form";

export function AddTransactionSection({
  assetId,
  currency,
  brokers,
}: {
  assetId: string;
  currency: string;
  brokers: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);

  if (brokers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Add a broker before recording more transactions.
      </p>
    );
  }

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Add transaction
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
