"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Select } from "@/components/ui/input";

type CategoryOption = { id: string; name: string };

function monthOptions(count = 12): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    options.push({ value, label });
  }
  return options;
}

export function FilterBar({
  categories,
  month,
  categoryId,
}: {
  categories: CategoryOption[];
  month: string;
  categoryId: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Select
        aria-label="Filter by month"
        value={month}
        onChange={(e) => updateParam("month", e.target.value)}
        className="w-auto"
      >
        <option value="all">All time</option>
        {monthOptions().map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </Select>

      <Select
        aria-label="Filter by category"
        value={categoryId}
        onChange={(e) => updateParam("categoryId", e.target.value)}
        className="w-auto"
      >
        <option value="all">All categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </Select>
    </div>
  );
}
