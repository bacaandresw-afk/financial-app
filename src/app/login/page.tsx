import { LoginForm } from "@/components/auth/login-form";
import { getLanguage } from "@/lib/i18n/language";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default async function LoginPage() {
  const t = getDictionary(await getLanguage());

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold">{t.auth.welcomeBack}</h1>
          <p className="text-muted-foreground mt-1">{t.auth.signInSubtitle}</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
