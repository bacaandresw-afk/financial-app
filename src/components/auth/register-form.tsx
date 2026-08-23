"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type AuthActionState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";

const initialState: AuthActionState = { error: null };

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" type="text" autoComplete="name" required autoFocus />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
        <p className="text-xs text-muted-foreground">At least 8 characters</p>
      </div>
      <FieldError>{state.error}</FieldError>
      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </Button>
      <p className="text-sm text-muted-foreground text-center">
        Already have an account?{" "}
        <Link href="/login" className="text-primary font-medium">
          Sign in
        </Link>
      </p>
    </form>
  );
}
