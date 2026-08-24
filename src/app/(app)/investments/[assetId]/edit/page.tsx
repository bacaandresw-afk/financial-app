import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AssetEditForm } from "@/components/investments/asset-edit-form";
import { getLanguage } from "@/lib/i18n/language";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default async function EditAssetPage({
  params,
}: {
  params: Promise<{ assetId: string }>;
}) {
  const { assetId } = await params;
  const user = await requireUser();
  const t = getDictionary(await getLanguage());

  const asset = await prisma.asset.findFirst({
    where: { id: assetId, userId: user.id },
  });
  if (!asset) notFound();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link
          href={`/investments/${asset.id}`}
          className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.investments.editPage.backTo(asset.name)}
        </Link>
        <h1 className="text-2xl font-semibold">{t.investments.editPage.title}</h1>
      </div>
      <AssetEditForm
        asset={{
          id: asset.id,
          name: asset.name,
          type: asset.type,
          currency: asset.currency,
          notes: asset.notes,
        }}
      />
    </div>
  );
}
