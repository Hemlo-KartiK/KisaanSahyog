import {
  Bookmark,
  ClipboardList,
  FlaskConical,
  IndianRupee,
  Leaf,
  Mic,
  Store,
  TrendingUp,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import {
  BUYER_TABS,
  FARMER_TABS,
  getDictionary,
  isBuyerTab,
  isFarmerTab,
  type BuyerTab,
  type FarmerTab,
  type NavKey,
} from "@kisaansahyog/shared";
import { useAppStore } from "../../store/useAppStore";
import { useVoiceStore } from "../../store/useVoiceStore";

const farmerIcons: Record<FarmerTab, LucideIcon> = {
  advisory: Leaf,
  soil: FlaskConical,
  sell: IndianRupee,
  market: TrendingUp,
};

const buyerIcons: Record<BuyerTab, LucideIcon> = {
  market: Store,
  requirements: ClipboardList,
  saved: Bookmark,
  account: UserRound,
};

interface NavItem {
  key: NavKey;
  label: string;
  icon: LucideIcon;
}

export function BottomNav() {
  const language = useAppStore((state) => state.language);
  const role = useAppStore((state) => state.role);
  const farmerTab = useAppStore((state) => state.farmerTab);
  const buyerTab = useAppStore((state) => state.buyerTab);
  const setFarmerTab = useAppStore((state) => state.setFarmerTab);
  const setBuyerTab = useAppStore((state) => state.setBuyerTab);

  const openVoiceModal = useVoiceStore((state) => state.openVoiceModal);

  const dictionary = getDictionary(language);
  const activeKey = role === "farmer" ? farmerTab : buyerTab;

  const items: NavItem[] =
    role === "farmer"
      ? FARMER_TABS.map((key) => ({
          key,
          label: dictionary.nav[key],
          icon: farmerIcons[key],
        }))
      : BUYER_TABS.map((key) => ({
          key,
          label: dictionary.nav[key],
          icon: buyerIcons[key],
        }));

  function handleSelect(key: NavKey) {
    if (role === "farmer" && isFarmerTab(key)) {
      setFarmerTab(key);
      return;
    }

    if (role === "buyer" && isBuyerTab(key)) {
      setBuyerTab(key);
    }
  }

  const leftItems = items.slice(0, 2);
  const rightItems = items.slice(2);

  return (
    <nav
      aria-label={dictionary.common.role}
      className="fixed inset-x-0 bottom-0 z-20 border-t border-cream-border bg-cream-card/95 backdrop-blur"
    >
      <div className="mx-auto flex w-full max-w-md items-center justify-around px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1.5">
        {/* Left 2 Tabs */}
        {leftItems.map((item) => {
          const isActive = item.key === activeKey;
          const Icon = item.icon;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => handleSelect(item.key)}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-1 flex-col items-center gap-1 rounded-2xl px-1 py-1.5 text-[10px] font-semibold leading-none transition ${
                isActive
                  ? "bg-leaf-soft text-leaf-deep font-bold"
                  : "text-soil-brown hover:bg-cream-tan/50"
              }`}
            >
              <Icon size={19} strokeWidth={isActive ? 2.4 : 2} aria-hidden="true" />
              <span className="max-w-full truncate">{item.label}</span>
            </button>
          );
        })}

        {/* Central Floating Green Mic Button (56px touch target) */}
        <div className="relative flex items-center justify-center px-1">
          <button
            type="button"
            onClick={openVoiceModal}
            aria-label={dictionary.common.voiceAssistant}
            title={dictionary.common.voiceAssistant}
            className="flex h-14 w-14 -translate-y-3 items-center justify-center rounded-full bg-leaf-green text-cream-card shadow-xl ring-4 ring-cream-card transition-all active:scale-95 hover:bg-leaf-deep"
          >
            <Mic size={24} aria-hidden="true" />
          </button>
        </div>

        {/* Right 2 Tabs */}
        {rightItems.map((item) => {
          const isActive = item.key === activeKey;
          const Icon = item.icon;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => handleSelect(item.key)}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-1 flex-col items-center gap-1 rounded-2xl px-1 py-1.5 text-[10px] font-semibold leading-none transition ${
                isActive
                  ? "bg-leaf-soft text-leaf-deep font-bold"
                  : "text-soil-brown hover:bg-cream-tan/50"
              }`}
            >
              <Icon size={19} strokeWidth={isActive ? 2.4 : 2} aria-hidden="true" />
              <span className="max-w-full truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
