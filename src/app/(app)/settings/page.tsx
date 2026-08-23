import Link from "next/link";
import { Tags, Wallet2, Building2, LogOut } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { logoutAction } from "@/actions/auth";
import { Card, CardContent } from "@/components/ui/card";

const LINKS = [
  { href: "/expenses/categories", label: "Expense categories", description: "Create, rename or remove expense categories", icon: Tags },
  { href: "/income/categories", label: "Income categories", description: "Create, rename or remove income categories", icon: Wallet2 },
  { href: "/investments/brokers", label: "Brokers", description: "Manage the brokers you invest through", icon: Building2 },
];

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

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
              Log out
            </button>
          </form>
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
