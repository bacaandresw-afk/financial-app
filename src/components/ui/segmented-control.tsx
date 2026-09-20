import { cn } from "@/lib/utils";

export const segmentedControlClasses = "inline-flex items-center rounded-full bg-muted p-1";

export function segmentedItemClasses(active: boolean): string {
  return cn(
    "flex items-center gap-1.5 rounded-full px-3.5 h-9 text-sm font-medium transition-colors",
    active
      ? "bg-primary text-primary-foreground"
      : "text-muted-foreground hover:text-foreground",
  );
}

export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
};

/**
 * Click-driven pill segmented control. For controls that must submit a
 * per-option <form> (e.g. a server action), reuse `segmentedControlClasses` /
 * `segmentedItemClasses` directly instead — see language-switcher.tsx.
 */
export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  className,
  "aria-label": ariaLabel,
}: {
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
  className?: string;
  "aria-label"?: string;
}) {
  return (
    <div className={cn(segmentedControlClasses, className)} role="group" aria-label={ariaLabel}>
      {options.map(({ value: optionValue, label, icon: Icon }) => (
        <button
          key={optionValue}
          type="button"
          onClick={() => onChange(optionValue)}
          aria-pressed={value === optionValue}
          className={segmentedItemClasses(value === optionValue)}
        >
          {Icon ? <Icon className="h-4 w-4" /> : null}
          {label}
        </button>
      ))}
    </div>
  );
}
