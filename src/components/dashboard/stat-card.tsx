"use client";

import { useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

const MAX_FONT_PX = 30;
const MIN_FONT_PX = 10;

/**
 * Renders `children` on a single line at the largest font size (up to
 * MAX_FONT_PX) that still fits the container's width, re-fitting on resize.
 */
function FitText({ children, className }: { children: string; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const text = textRef.current;
    if (!container || !text) return;

    function fit() {
      if (!container || !text) return;
      const available = container.clientWidth;
      if (available === 0) return;
      text.style.fontSize = `${MAX_FONT_PX}px`;
      const needed = text.scrollWidth;
      if (needed > available) {
        const size = Math.max(MIN_FONT_PX, Math.floor(MAX_FONT_PX * (available / needed) * 10) / 10);
        text.style.fontSize = `${size}px`;
      }
    }

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(container);
    return () => observer.disconnect();
  }, [children]);

  return (
    <div ref={containerRef} className="w-full overflow-hidden">
      <p
        ref={textRef}
        className={cn("whitespace-nowrap font-bold tabular-nums leading-tight w-max", className)}
        style={{ fontSize: MAX_FONT_PX }}
      >
        {children}
      </p>
    </div>
  );
}

export function StatCard({
  label,
  value,
  valueClassName,
  hint,
}: {
  label: string;
  value: string;
  valueClassName?: string;
  hint?: string;
}) {
  return (
    <Card>
      <CardContent className="space-y-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <FitText className={valueClassName}>{value}</FitText>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
