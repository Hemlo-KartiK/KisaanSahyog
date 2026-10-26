import {
  CheckCircle2,
  FolderInput,
  Layers,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import {
  getDictionary,
  type Language,
  type NavKey,
  type Role,
} from "@kisaansahyog/shared";
import { StatusBadge } from "../components/stitch/StatusBadge";
import { SurfaceCard } from "../components/stitch/SurfaceCard";

interface ScaffoldScreenProps {
  title: string;
  navLabel: string;
  screenKey: string;
  icon: LucideIcon;
  language: Language;
  role: Role;
  activeTab: NavKey;
  is2GMode: boolean;
}

export function ScaffoldScreen({
  title,
  navLabel,
  screenKey,
  icon,
  language,
  role,
  activeTab,
  is2GMode,
}: ScaffoldScreenProps) {
  const dictionary = getDictionary(language);
  const ScreenIcon = icon;

  const stateItems = [
    {
      label: dictionary.common.language,
      value: language === "hi" ? "हिंदी" : "English",
    },
    { label: dictionary.common.role, value: dictionary.roles[role] },
    { label: dictionary.common.activeTab, value: dictionary.nav[activeTab] },
    {
      label: dictionary.common.twoGMode,
      value: is2GMode ? dictionary.common.enabled : dictionary.common.disabled,
    },
  ];

  return (
    <div className="space-y-3.5">
      <SurfaceCard className="relative overflow-hidden border-leaf-green/25 bg-gradient-to-br from-leaf-soft via-cream-card to-cream-card">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-harvest-gold/15"
        />
        <div className="relative">
          <StatusBadge>
            <Sparkles size={11} aria-hidden="true" />
            {dictionary.scaffold.badge}
          </StatusBadge>

          <div className="mt-4 flex items-start gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-leaf-green text-cream-card shadow-sm">
              <ScreenIcon size={24} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h1 className="text-2xl font-extrabold leading-tight">{title}</h1>
              <p className="mt-1 text-sm font-medium text-soil-brown">
                {navLabel} · {dictionary.app.name}
              </p>
            </div>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-soil-brown">
            {dictionary.scaffold.body}
          </p>
        </div>
      </SurfaceCard>

      <SurfaceCard>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold">{dictionary.scaffold.stateTitle}</h2>
          <code className="rounded-lg bg-cream-bg px-2 py-1 text-[10px] font-semibold text-soil-brown">
            {screenKey}
          </code>
        </div>

        <dl className="mt-3 grid grid-cols-2 gap-2">
          {stateItems.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-cream-border bg-cream-bg px-3 py-2.5"
            >
              <dt className="text-[10px] font-medium uppercase tracking-wide text-soil-brown/80">
                {item.label}
              </dt>
              <dd className="mt-0.5 truncate text-sm font-semibold text-soil-text">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </SurfaceCard>

      <div className="grid grid-cols-2 gap-3">
        <SurfaceCard className="p-3.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-leaf-soft text-leaf-deep">
            <CheckCircle2 size={17} aria-hidden="true" />
          </span>
          <h2 className="mt-2.5 text-sm font-bold leading-snug">
            {dictionary.scaffold.workspaceTitle}
          </h2>
          <p className="mt-1 text-[11px] leading-relaxed text-soil-brown">
            {dictionary.scaffold.workspaceBody}
          </p>
        </SurfaceCard>

        <SurfaceCard className="p-3.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-harvest-gold/15 text-soil-brown">
            <Layers size={17} aria-hidden="true" />
          </span>
          <h2 className="mt-2.5 text-sm font-bold leading-snug">
            {dictionary.scaffold.stackTitle}
          </h2>
          <p className="mt-1 text-[11px] leading-relaxed text-soil-brown">
            {dictionary.scaffold.stackBody}
          </p>
        </SurfaceCard>
      </div>

      <SurfaceCard className="border-dashed border-soil-brown/25 bg-cream-tan/40">
        <div className="flex gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cream-card text-soil-brown">
            <FolderInput size={18} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-sm font-bold">{dictionary.scaffold.stitchTitle}</h2>
            <p className="mt-1 text-[11px] leading-relaxed text-soil-brown">
              {dictionary.scaffold.stitchBody}
            </p>
            <code className="mt-2 block break-all rounded-lg bg-cream-card px-2 py-1 text-[10px] font-semibold text-leaf-deep">
              apps/web/src/screens/{screenKey}
            </code>
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard className="border-clay-red/20 bg-clay-red/[0.04]">
        <div className="flex gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-clay-red/10 text-clay-red">
            <ShieldCheck size={18} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-clay-red">
              {dictionary.disclaimers.kvkTitle}
            </h2>
            <p className="mt-1 text-[11px] leading-relaxed text-soil-brown">
              {dictionary.disclaimers.kvkShort}
            </p>
          </div>
        </div>
      </SurfaceCard>
    </div>
  );
}
