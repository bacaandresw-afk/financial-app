import Link from "next/link";
import { Tags, Wallet2, Building2, LogOut } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { logoutAction } from "@/actions/auth";
import { Card, CardContent } from "@/components/ui/card";
import { getLanguage } from "@/lib/i18n/language";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LanguageSwitcher } from "@/components/settings/language-switcher";

export default async function SettingsPage() {
  const user = await requireUser();
  const lang = await getLanguage();
  const t = getDictionary(lang);

  const LINKS = [
    {
      href: "/expenses/categories",
      label: t.settings.expenseCategories,
      description: t.settings.expenseCategoriesDesc,
      icon: Tags,
    },
    {
      href: "/income/categories",
      label: t.settings.incomeCategories,
      description: t.settings.incomeCategoriesDesc,
      icon: Wallet2,
    },
    {
      href: "/investments/brokers",
      label: t.settings.brokers,
      description: t.settings.brokersDesc,
      icon: Building2,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{t.settings.title}</h1>

      <Card>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="font-medium">{user.name ?? "—"}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 text-sm font-medium text-destructive hover:opacity-80"
            >
              <LogOut className="h-4 w-4" />
              {t.nav.logOut}
            </button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <div>
            <p className="font-medium">{t.settings.appearance}</p>
            <p className="text-sm text-muted-foreground">{t.settings.appearanceDesc}</p>
          </div>
          <ThemeToggle />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <div>
            <p className="font-medium">{t.settings.language}</p>
            <p className="text-sm text-muted-foreground">{t.settings.languageDesc}</p>
          </div>
          <LanguageSwitcher />
        </CardContent>
      </Card>

      <div className="space-y-3">
        {LINKS.map(({ href, label, description, icon: Icon }) => (
          <Link key={href} href={href}>
            <Card className="hover:bg-accent transition-colors">
              <CardContent className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">{label}</p>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
