import Image from "next/image";
import { Receipt as ReceiptIcon } from "lucide-react";
import { getReceiptSignedUrl } from "@/lib/storage";
import { getLanguage } from "@/lib/i18n/language";
import { getDictionary } from "@/lib/i18n/dictionaries";

/** Small receipt indicator for a list row: a real thumbnail when we can sign
 * a URL, otherwise a plain icon so a storage hiccup never breaks the row. */
export async function ReceiptThumbnail({ storagePath }: { storagePath: string }) {
  try {
    const url = await getReceiptSignedUrl(storagePath);
    const t = getDictionary(await getLanguage());
    return (
      <Image
        src={url}
        alt={t.expenses.receipt.alt}
        width={36}
        height={36}
        unoptimized
        className="h-9 w-9 rounded-md object-cover border border-border shrink-0"
      />
    );
  } catch {
    return (
      <div className="h-9 w-9 rounded-md border border-border flex items-center justify-center shrink-0 text-muted-foreground">
        <ReceiptIcon className="h-4 w-4" />
      </div>
    );
  }
}
