import type { ReactNode } from "react";

interface SurfaceCardProps {
  children: ReactNode;
  className?: string;
}

export function SurfaceCard({ children, className = "" }: SurfaceCardProps) {
  return (
    <section
      className={`rounded-3xl border border-cream-border bg-cream-card p-4 shadow-card ${className}`}
    >
      {children}
    </section>
  );
}
