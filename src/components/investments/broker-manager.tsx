"use client";

import { useActionState, useState } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import { createBroker, updateBroker, deleteBroker, type ActionState } from "@/actions/brokers";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";

const initialState: ActionState = { error: null };

export type BrokerRowData = { id: string; name: string };

export function BrokerManager({ brokers }: { brokers: BrokerRowData[] }) {
  return (
    <div className="space-y-6">
      <AddBrokerForm />
      <div className="space-y-2">
        {brokers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No brokers yet. Add one above to start recording transactions.
          </p>
        ) : (
          brokers.map((broker) => <BrokerRow key={broker.id} broker={broker} />)
        )}
      </div>
    </div>
  );
}

function AddBrokerForm() {
  const [state, formAction, pending] = useActionState(createBroker, initialState);

  return (
    <form action={formAction} className="flex items-start gap-3">
      <div className="flex-1 space-y-1.5">
        <Label htmlFor="new-broker-name">New broker</Label>
        <Input id="new-broker-name" name="name" placeholder="e.g. Interactive Brokers" required />
        <FieldError>{state.error}</FieldError>
      </div>
      <Button type="submit" disabled={pending} className="mt-6">
        {pending ? "Adding…" : "Add broker"}
      </Button>
    </form>
  );
}

function BrokerRow({ broker }: { broker: BrokerRowData }) {
  const [editing, setEditing] = useState(false);
  const [updateState, updateFormAction, updatePending] = useActionState(updateBroker, initialState);
  const [deleteState, deleteFormAction, deletePending] = useActionState(deleteBroker, initialState);

  if (editing) {
    return (
      <div className="rounded-lg border border-border p-3">
        <form action={updateFormAction} className="flex items-start gap-3">
          <input type="hidden" name="id" value={broker.id} />
          <div className="flex-1 space-y-1.5">
            <Input name="name" defaultValue={broker.name} required autoFocus />
            <FieldError>{updateState.error}</FieldError>
          </div>
          <Button type="submit" size="sm" disabled={updatePending}>
            {updatePending ? "Saving…" : "Save"}
          </Button>
          <Button type="button" variant="ghost" size="icon" onClick={() => setEditing(false)}>
            <X className="h-4 w-4" />
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="font-medium">{broker.name}</span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setEditing(true)} aria-label="Rename">
            <Pencil className="h-4 w-4" />
          </Button>
          <form action={deleteFormAction}>
            <input type="hidden" name="id" value={broker.id} />
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              disabled={deletePending}
              aria-label="Delete"
              onClick={(e) => {
                if (!confirm(`Delete broker "${broker.name}"?`)) e.preventDefault();
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </form>
        </div>
      </div>
      <FieldError>{deleteState.error}</FieldError>
    </div>
  );
}
