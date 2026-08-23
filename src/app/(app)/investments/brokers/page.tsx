import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BrokerManager } from "@/components/investments/broker-manager";

export default async function BrokersPage() {
  const user = await requireUser();

  const brokers = await prisma.broker.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <Link
          href="/investments"
          className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to investments
        </Link>
        <h1 className="text-2xl font-semibold">Brokers</h1>
        <p className="text-sm text-muted-foreground">
          Brokers are used to record which account each transaction happened in.
        </p>
      </div>
      <BrokerManager brokers={brokers} />
    </div>
  );
}
