"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type AuthActionState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";
import { useTranslation } from "@/lib/i18n/language-context";

const initialState: AuthActionState = { error: null };

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);
  const { t } = useTranslation();

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">{t.auth.name}</Label>
        <Input id="name" name="name" type="text" autoComplete="name" required autoFocus />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">{t.auth.email}</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">{t.auth.password}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
        <p className="text-xs text-muted-foreground">{t.auth.passwordHint}</p>
      </div>
      <FieldError>{state.error}</FieldError>
      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? t.auth.creatingAccount : t.auth.createAccount}
      </Button>
      <p className="text-sm text-muted-foreground text-center">
        {t.auth.alreadyHaveAccount}{" "}
        <Link href="/login" className="text-primary font-medium">
          {t.auth.signIn}
        </Link>
      </p>
    </form>
  );
}
