import React from "react";
import {
  Wand2,
  X,
  CloudRain,
  Bug,
  TrendingDown,
  WifiOff,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { useSimulationStore } from "../../store/useSimulationStore";
import { StatusBadge } from "../stitch/StatusBadge";

export const JudgeSimulatorDrawer: React.FC = () => {
  const activeScenario = useSimulationStore((state) => state.activeScenario);
  const isSimDrawerOpen = useSimulationStore((state) => state.isSimDrawerOpen);
  const triggerHeavyRain = useSimulationStore((state) => state.triggerHeavyRain);
  const triggerPestAlert = useSimulationStore((state) => state.triggerPestAlert);
  const triggerMandiCrash = useSimulationStore((state) => state.triggerMandiCrash);
  const trigger2GMode = useSimulationStore((state) => state.trigger2GMode);
  const resetSimulation = useSimulationStore((state) => state.resetSimulation);
  const toggleDrawer = useSimulationStore((state) => state.toggleDrawer);
  const setSimDrawerOpen = useSimulationStore((state) => state.setSimDrawerOpen);

  return (
    <>
      {/* Discreet Floating Trigger Pill Button (Above Voice Assistant on right side) */}
      <div className="fixed bottom-40 right-4 z-30">
        <button
          onClick={toggleDrawer}
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold shadow-xl transition-all active:scale-95 border ${
            activeScenario !== "normal"
              ? "bg-clay-red text-cream-card border-clay-red animate-pulse"
              : "bg-soil-deep text-cream-card border-cream-border/30 hover:bg-soil-brown"
          }`}
          title="Judge Hackathon Simulation Sandbox"
        >
          <Wand2 size={14} className={activeScenario !== "normal" ? "animate-spin" : ""} />
          <span>Judge Demo Sim</span>
          {activeScenario !== "normal" && (
            <span className="flex h-2 w-2 rounded-full bg-harvest-gold" />
          )}
        </button>
      </div>

      {/* Drawer Overlay & Bottom Sheet */}
      {isSimDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          {/* Backdrop Click Dismiss */}
          <div
            className="absolute inset-0"
            onClick={() => setSimDrawerOpen(false)}
          />

          <div className="relative w-full max-w-md rounded-t-3xl bg-cream-bg p-5 shadow-2xl border-t border-cream-border z-10 max-h-[85vh] overflow-y-auto">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-cream-border">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-leaf-soft text-leaf-deep">
                  <Wand2 size={18} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-soil-text">
                    Judge Simulation Sandbox
                  </h2>
                  <p className="text-[11px] text-soil-brown">
                    हैकथॉन लाइव प्रदर्शन नियंत्रण (Hackathon Field Scenarios)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSimDrawerOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-cream-tan/60 text-soil-brown hover:text-soil-text"
              >
                <X size={18} />
              </button>
            </div>

            {/* Current Active Scenario Status */}
            <div className="mt-3 flex items-center justify-between rounded-xl bg-cream-card p-2.5 border border-cream-border">
              <span className="text-xs text-soil-brown font-medium">सक्रिय परिदृश्य (Current):</span>
              <StatusBadge
                tone={
                  activeScenario === "normal"
                    ? "neutral"
                    : activeScenario === "heavy_rain"
                      ? "gold"
                      : activeScenario === "pest_alert"
                        ? "clay"
                        : "leaf"
                }
              >
                {activeScenario === "normal" && "Baseline Normal (सामान्य स्थिति)"}
                {activeScenario === "heavy_rain" && "🌧️ Heavy Rain Alert (85%)"}
                {activeScenario === "pest_alert" && "🐛 Pest Outbreak Active"}
                {activeScenario === "mandi_crash" && "📉 Mandi Price Crashed (-20%)"}
                {activeScenario === "offline_2g" && "📶 2G Offline Mode"}
              </StatusBadge>
            </div>

            {/* 4 Prominent Scenario Action Cards */}
            <div className="mt-4 space-y-2.5">
              {/* Scenario 1: Heavy Rain */}
              <button
                type="button"
                onClick={triggerHeavyRain}
                className={`w-full text-left rounded-2xl p-3.5 transition-all border ${
                  activeScenario === "heavy_rain"
                    ? "bg-harvest-gold/15 border-harvest-gold ring-2 ring-harvest-gold/30"
                    : "bg-cream-card border-cream-border hover:border-harvest-gold/50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                      <CloudRain size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-soil-text">
                        🌧️ भारी बारिश का पूर्वानुमान (Heavy Rain 85%)
                      </h3>
                      <p className="text-xs text-soil-brown mt-0.5">
                        सिंचाई स्थगित होगी और ₹2,400 डीजल बचत दर्ज होगी।
                      </p>
                    </div>
                  </div>
                  {activeScenario === "heavy_rain" && (
                    <CheckCircle2 size={18} className="text-harvest-gold shrink-0 mt-1" />
                  )}
                </div>
              </button>

              {/* Scenario 2: Pest Outbreak */}
              <button
                type="button"
                onClick={triggerPestAlert}
                className={`w-full text-left rounded-2xl p-3.5 transition-all border ${
                  activeScenario === "pest_alert"
                    ? "bg-red-50 border-red-400 ring-2 ring-red-200"
                    : "bg-cream-card border-cream-border hover:border-red-300"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-100 text-red-700">
                      <Bug size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-soil-text">
                        🐛 दीमक/कीट प्रकोप चेतावनी (Pest Outbreak)
                      </h3>
                      <p className="text-xs text-soil-brown mt-0.5">
                        तत्काल क्लोरपायरीफॉस 20 EC उपचार की सलाह जारी होगी।
                      </p>
                    </div>
                  </div>
                  {activeScenario === "pest_alert" && (
                    <CheckCircle2 size={18} className="text-red-600 shrink-0 mt-1" />
                  )}
                </div>
              </button>

              {/* Scenario 3: Mandi Crash */}
              <button
                type="button"
                onClick={triggerMandiCrash}
                className={`w-full text-left rounded-2xl p-3.5 transition-all border ${
                  activeScenario === "mandi_crash"
                    ? "bg-orange-50 border-orange-400 ring-2 ring-orange-200"
                    : "bg-cream-card border-cream-border hover:border-orange-300"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                      <TrendingDown size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-soil-text">
                        📉 मंडी भाव गिरावट (Mandi Crash -20%)
                      </h3>
                      <p className="text-xs text-soil-brown mt-0.5">
                        मार्जिन गार्डरेल किसान को औने-पौने दाम पर बेचने से रोकेगा।
                      </p>
                    </div>
                  </div>
                  {activeScenario === "mandi_crash" && (
                    <CheckCircle2 size={18} className="text-orange-600 shrink-0 mt-1" />
                  )}
                </div>
              </button>

              {/* Scenario 4: 2G / Offline */}
              <button
                type="button"
                onClick={trigger2GMode}
                className={`w-full text-left rounded-2xl p-3.5 transition-all border ${
                  activeScenario === "offline_2g"
                    ? "bg-slate-100 border-slate-400 ring-2 ring-slate-200"
                    : "bg-cream-card border-cream-border hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-200 text-slate-700">
                      <WifiOff size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-soil-text">
                        📶 2G / बिना इंटरनेट मोड (Simulate Offline)
                      </h3>
                      <p className="text-xs text-soil-brown mt-0.5">
                        लोकल फॉलबैक और बिना रुकावट काम करने का प्रमाण।
                      </p>
                    </div>
                  </div>
                  {activeScenario === "offline_2g" && (
                    <CheckCircle2 size={18} className="text-slate-700 shrink-0 mt-1" />
                  )}
                </div>
              </button>
            </div>

            {/* Reset Button */}
            <div className="mt-5 pt-3 border-t border-cream-border">
              <button
                type="button"
                onClick={resetSimulation}
                className="flex w-full min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-cream-card border border-cream-border py-2.5 text-sm font-bold text-soil-brown hover:text-soil-text hover:bg-cream-tan/40 active:scale-98 transition"
              >
                <RotateCcw size={16} />
                <span>🔄 रीसेट (Reset Normal State)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
