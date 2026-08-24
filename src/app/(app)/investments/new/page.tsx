import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NewInvestmentForm } from "@/components/investments/new-investment-form";
import { getLanguage } from "@/lib/i18n/language";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default async function NewInvestmentPage() {
  const user = await requireUser();
  const t = getDictionary(await getLanguage());

  const brokers = await prisma.broker.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold">{t.investments.newPage.title}</h1>
        <p className="text-sm text-muted-foreground">
          {t.investments.newPage.subtitle}{" "}
          <Link href="/investments/brokers" className="text-primary font-medium">
            {t.investments.newPage.manageBrokersLink}
          </Link>
        </p>
      </div>
      <NewInvestmentForm brokers={brokers} />
    </div>
  );
}
