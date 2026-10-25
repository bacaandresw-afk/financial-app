// ARS-per-USD rate used to convert dollar income into pesos. Scraped from
// dolarhoy.com (Dólar MEP, "venta" side). If the page layout changes or the
// site is unreachable, falls back to dolarapi.com's MEP quote.

export type UsdRate = {
  /** ARS per 1 USD (MEP, sell side). */
  rate: number;
  source: "dolarhoy.com" | "dolarapi.com";
  fetchedAt: Date;
};

const REVALIDATE_SECONDS = 15 * 60;

// dolarhoy.com markup: <div class="title">Dólar MEP</div><div class="compra">1.557,40</div><div class="venta">1.563,90</div>
const MEP_PATTERN = /Dólar MEP<\/div>\s*<div class="compra">[^<]*<\/div>\s*<div class="venta">([\d.,]+)<\/div>/i;

/** Parses Argentine-formatted numbers: "1.563,90" -> 1563.9 */
function parseArgentineNumber(raw: string): number {
  return Number(raw.replace(/\./g, "").replace(",", "."));
}

async function scrapeDolarHoy(): Promise<number | null> {
  const res = await fetch("https://dolarhoy.com/", {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; FinancialApp/1.0)" },
    next: { revalidate: REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return null;
  const match = MEP_PATTERN.exec(await res.text());
  if (!match) return null;
  const value = parseArgentineNumber(match[1]);
  return Number.isFinite(value) && value > 0 ? value : null;
}

async function fetchDolarApi(): Promise<number | null> {
  const res = await fetch("https://dolarapi.com/v1/dolares/bolsa", {
    next: { revalidate: REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { venta?: number };
  return typeof json.venta === "number" && json.venta > 0 ? json.venta : null;
}

export async function getUsdRate(): Promise<UsdRate | null> {
  try {
    const rate = await scrapeDolarHoy();
    if (rate) return { rate, source: "dolarhoy.com", fetchedAt: new Date() };
  } catch {
    // fall through to the backup source
  }
  try {
    const rate = await fetchDolarApi();
    if (rate) return { rate, source: "dolarapi.com", fetchedAt: new Date() };
  } catch {
    // no rate available
  }
  return null;
}
