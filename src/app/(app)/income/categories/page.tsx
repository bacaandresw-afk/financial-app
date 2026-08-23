import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AddCategoryForm } from "@/components/income/add-category-form";
import { CategoryList } from "@/components/income/category-list";

export default async function IncomeCategoriesPage() {
  const user = await requireUser();

  const categories = await prisma.incomeCategory.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <Link href="/income" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to income
        </Link>
        <h1 className="text-2xl font-semibold mt-2">Income categories</h1>
        <p className="text-muted-foreground mt-1">Manage the categories you use to organize income</p>
      </div>

      <AddCategoryForm />
      <CategoryList categories={categories} />
    </div>
  );
}
