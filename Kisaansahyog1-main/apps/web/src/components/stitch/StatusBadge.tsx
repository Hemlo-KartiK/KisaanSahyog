import type { ReactNode } from "react";

type BadgeTone = "leaf" | "gold" | "clay" | "neutral";

interface StatusBadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}

const toneClasses: Record<BadgeTone, string> = {
  leaf: "border-leaf-green/25 bg-leaf-soft text-leaf-deep",
  gold: "border-harvest-gold/35 bg-harvest-gold/15 text-soil-brown",
  clay: "border-clay-red/25 bg-clay-red/10 text-clay-red",
  neutral: "border-cream-border bg-cream-bg text-soil-brown",
};

export function StatusBadge({
  children,
  tone = "leaf",
  className = "",
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
