import { useEffect } from "react";
import { Mic } from "lucide-react";
import { getDictionary, type BuyerTab, type FarmerTab } from "@kisaansahyog/shared";
import { BottomNav } from "./components/layout/BottomNav";
import { LanguageModal } from "./components/layout/LanguageModal";
import { TopBar } from "./components/layout/TopBar";
import { VoiceSheet } from "./components/layout/VoiceSheet";
import { JudgeSimulatorDrawer } from "./components/demo/JudgeSimulatorDrawer";
import { ProfileSettingsDrawer } from "./components/profile/ProfileSettingsDrawer";
import AdvisoryScreen from "./screens/AdvisoryScreen";
import BuyerScreens from "./screens/BuyerScreens";
import LoginScreen from "./screens/LoginScreen";
import MarketScreen from "./screens/MarketScreen";
import SellScreen from "./screens/SellScreen";
import SoilScreen from "./screens/SoilScreen";
import { useAppStore } from "./store/useAppStore";
import { useVoiceStore } from "./store/useVoiceStore";
import { initOfflineSyncWatcher } from "./utils/offlineQueue";

export default function App() {
  const language = useAppStore((state) => state.language);
  const role = useAppStore((state) => state.role);
  const farmerTab = useAppStore((state) => state.farmerTab);
  const buyerTab = useAppStore((state) => state.buyerTab);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const openVoiceModal = useVoiceStore((state) => state.openVoiceModal);

  useEffect(() => {
    const unbind = initOfflineSyncWatcher((res) => {
      if (res.syncedCount > 0) {
        console.log(`[PWA Offline Sync] Successfully synced ${res.syncedCount} queued mutations`);
      }
    });
    return unbind;
  }, []);

  const dictionary = getDictionary(language);

  function renderFarmerScreen(tab: FarmerTab) {
    switch (tab) {
      case "advisory":
        return <AdvisoryScreen />;
      case "soil":
        return <SoilScreen />;
      case "sell":
        return <SellScreen />;
      case "market":
        return <MarketScreen />;
      default:
        return <AdvisoryScreen />;
    }
  }

  function renderBuyerScreen(_tab: BuyerTab) {
    return <BuyerScreens />;
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto min-h-screen w-full max-w-md bg-cream-bg sm:border-x sm:border-cream-border">
        <TopBar />
        <LoginScreen />
        <LanguageModal />
        <JudgeSimulatorDrawer />
        <ProfileSettingsDrawer />
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-cream-bg pb-24 sm:border-x sm:border-cream-border">
      <TopBar />

      <main className="px-4 py-4">
        {role === "farmer"
          ? renderFarmerScreen(farmerTab)
          : renderBuyerScreen(buyerTab)}
      </main>

      {role === "farmer" && (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-30">
          <div className="mx-auto flex w-full max-w-md justify-end px-4">
            <button
              type="button"
              onClick={openVoiceModal}
              aria-label={dictionary.common.voiceAssistant}
              className="pointer-events-auto flex h-14 w-14 min-h-[56px] min-w-[56px] items-center justify-center rounded-full bg-harvest-gold text-soil-deep shadow-lg transition active:scale-95"
            >
              <Mic size={24} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Judge Simulation Sandbox Drawer */}
      <JudgeSimulatorDrawer />

      {/* Interactive Farmer Profile & Farm Settings Drawer */}
      <ProfileSettingsDrawer />

      <VoiceSheet />
      <BottomNav />
      <LanguageModal />
    </div>
  );
}
