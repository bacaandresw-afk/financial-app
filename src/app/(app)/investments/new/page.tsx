import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NewInvestmentForm } from "@/components/investments/new-investment-form";

export default async function NewInvestmentPage() {
  const user = await requireUser();

  const brokers = await prisma.broker.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold">Add investment</h1>
        <p className="text-sm text-muted-foreground">
          An investment starts life as an asset plus its first purchase.{" "}
          <Link href="/investments/brokers" className="text-primary font-medium">
            Manage brokers
          </Link>
        </p>
      </div>
      <NewInvestmentForm brokers={brokers} />
    </div>
  );
}
