"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type AuthActionState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";
import { useTranslation } from "@/lib/i18n/language-context";

const initialState: AuthActionState = { error: null };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const { t } = useTranslation();

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">{t.auth.email}</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required autoFocus />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">{t.auth.password}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <FieldError>{state.error}</FieldError>
      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? t.auth.signingIn : t.auth.signIn}
      </Button>
      <p className="text-sm text-muted-foreground text-center">
        {t.auth.noAccount}{" "}
        <Link href="/register" className="text-primary font-medium">
          {t.auth.createOne}
        </Link>
      </p>
    </form>
  );
}
