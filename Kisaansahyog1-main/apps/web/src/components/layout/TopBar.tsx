import { Globe, LogOut, Sliders, Sprout, UserRound, Wifi, WifiOff } from "lucide-react";
import { getDictionary } from "@kisaansahyog/shared";
import { useAppStore } from "../../store/useAppStore";
import { useFarmerProfileStore } from "../../store/useFarmerProfileStore";

function getGreetingKey(): "morning" | "afternoon" | "evening" {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "morning";
  }

  if (hour < 17) {
    return "afternoon";
  }

  return "evening";
}

const languageLabels: Record<string, string> = {
  hi: "हिं",
  en: "EN",
  pa: "ਪੰ",
  mr: "मर",
};

export function TopBar() {
  const language = useAppStore((state) => state.language);
  const is2GMode = useAppStore((state) => state.is2GMode);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const userProfile = useAppStore((state) => state.userProfile);
  const setLanguageModalOpen = useAppStore((state) => state.setLanguageModalOpen);
  const toggle2GMode = useAppStore((state) => state.toggle2GMode);
  const logout = useAppStore((state) => state.logout);

  const farmerProfile = useFarmerProfileStore((state) => state.profile);
  const toggleProfileDrawer = useFarmerProfileStore((state) => state.toggleProfileDrawer);

  const dictionary = getDictionary(language);
  const isHi = language === "hi";
  const greeting = dictionary.greetings[getGreetingKey()];

  return (
    <header className="sticky top-0 z-20 border-b border-cream-border bg-cream-bg/95 px-4 pb-3 pt-4 backdrop-blur">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-leaf-green text-cream-card shadow-sm">
            <Sprout size={21} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-base font-extrabold leading-tight text-soil-text">
              {dictionary.app.name}
            </p>
            <p className="truncate text-[11px] leading-tight text-soil-brown">
              {dictionary.app.tagline}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {/* Farm Profile & Settings Trigger */}
          <button
            type="button"
            onClick={toggleProfileDrawer}
            title={isHi ? "किसान प्रोफ़ाइल व खेत सेटिंग्स" : "Farmer Profile & Farm Settings"}
            aria-label="Profile and Farm Settings"
            className="inline-flex min-h-9 items-center gap-1 rounded-full border border-leaf-green/40 bg-leaf-soft px-2.5 text-[11px] font-bold text-leaf-deep transition hover:bg-leaf-green hover:text-cream-card active:scale-95 shadow-sm"
          >
            <Sliders size={13} aria-hidden="true" />
            <span className="max-w-[70px] truncate">{farmerProfile.district || "खेत"}</span>
          </button>

          <button
            type="button"
            onClick={toggle2GMode}
            aria-pressed={is2GMode}
            aria-label={`${dictionary.common.twoGMode}: ${
              is2GMode ? dictionary.common.enabled : dictionary.common.disabled
            }`}
            className={`inline-flex min-h-9 items-center gap-1 rounded-full border px-2.5 text-[10px] font-bold transition ${
              is2GMode
                ? "border-harvest-gold/50 bg-harvest-gold/15 text-soil-brown"
                : "border-cream-border bg-cream-card text-soil-brown"
            }`}
          >
            {is2GMode ? (
              <WifiOff size={13} aria-hidden="true" />
            ) : (
              <Wifi size={13} aria-hidden="true" />
            )}
            2G
          </button>

          <button
            type="button"
            onClick={() => setLanguageModalOpen(true)}
            aria-label={dictionary.common.changeLanguage}
            className="inline-flex min-h-9 items-center gap-1 rounded-full border border-cream-border bg-cream-card px-2.5 text-[11px] font-semibold text-soil-brown transition hover:bg-cream-tan/60"
          >
            <Globe size={14} aria-hidden="true" />
            {languageLabels[language] ?? language.toUpperCase()}
          </button>
        </div>
      </div>

      {isAuthenticated && (
        <div className="mt-3 flex items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={toggleProfileDrawer}
            className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-cream-border bg-cream-card px-3 py-2 text-left transition hover:bg-cream-tan/50 active:scale-[0.99] shadow-sm"
            title={isHi ? "किसान प्रोफ़ाइल व खेत सेटिंग्स संपादित करें" : "Edit Profile & Farm Settings"}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-leaf-soft text-leaf-deep">
              <UserRound size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-soil-text">
                {greeting}, {farmerProfile.name || userProfile?.name}
              </p>
              <p className="truncate text-[10px] text-soil-brown">
                📍 {farmerProfile.district}, {farmerProfile.state} • {farmerProfile.landAcres} {isHi ? "एकड़" : "Acres"} ({farmerProfile.activeCrop.split(" ")[0]})
              </p>
            </div>
            <Sliders size={13} className="shrink-0 text-soil-brown" />
          </button>

          <button
            type="button"
            onClick={logout}
            aria-label={dictionary.auth.logout}
            className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border border-clay-red/25 bg-clay-red/10 px-3 text-xs font-semibold text-clay-red transition hover:bg-clay-red/15"
          >
            <LogOut size={14} aria-hidden="true" />
            {dictionary.auth.logout}
          </button>
        </div>
      )}

      {!isAuthenticated && (
        <div className="mt-3 flex items-center justify-between gap-2 rounded-2xl bg-cream-tan/50 px-3 py-2">
          <div className="flex items-center gap-2 min-w-0">
            <UserRound size={14} className="text-soil-brown shrink-0" />
            <p className="text-xs text-soil-brown truncate">{dictionary.auth.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={toggleProfileDrawer}
            className="shrink-0 text-[11px] font-bold text-leaf-deep hover:underline"
          >
            {isHi ? "खेत सेटिंग्स ⚙️" : "Farm Settings ⚙️"}
          </button>
        </div>
      )}
    </header>
  );
}
