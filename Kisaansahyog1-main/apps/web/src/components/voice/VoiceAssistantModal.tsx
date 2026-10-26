import React from "react";
import {
  Mic,
  MicOff,
  Volume2,
  X,
  Sparkles,
  RotateCcw,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { useVoiceStore } from "../../store/useVoiceStore";
import { useAppStore } from "../../store/useAppStore";

const QUICK_DEMO_CHIPS = [
  {
    icon: "🌾",
    label: "40 क्विंटल गेहूं बेचना है",
    phrase: "मुझे 40 क्विंटल गेहूं बेचना है",
    intent: "फसल बिक्री (Sell)",
  },
  {
    icon: "🌧️",
    label: "आज का मौसम और सिंचाई सलाह",
    phrase: "आज का मौसम कैसा रहेगा और क्या सिंचाई करें?",
    intent: "मौसम व सिंचाई (Weather)",
  },
  {
    icon: "🧪",
    label: "3 एकड़ के लिए खाद की मात्रा",
    phrase: "3 एकड़ गेहूं के लिए कितनी खाद और यूरिया चाहिए?",
    intent: "उर्वरक नुस्खा (Soil)",
  },
  {
    icon: "📊",
    label: "सीतापुर मंडी में आज का भाव",
    phrase: "सीतापुर मंडी में गेहूं और सरसों का क्या भाव है?",
    intent: "मंडी भाव (Mandi)",
  },
];

export const VoiceAssistantModal: React.FC = () => {
  const isVoiceModalOpen = useVoiceStore((state) => state.isVoiceModalOpen);
  const isListening = useVoiceStore((state) => state.isListening);
  const isSpeaking = useVoiceStore((state) => state.isSpeaking);
  const transcript = useVoiceStore((state) => state.transcript);
  const lastResponseText = useVoiceStore((state) => state.lastResponseText);
  const lastResponseTextEn = useVoiceStore((state) => state.lastResponseTextEn);
  const activeIntent = useVoiceStore((state) => state.activeIntent);

  const startListening = useVoiceStore((state) => state.startListening);
  const stopListening = useVoiceStore((state) => state.stopListening);
  const simulatePhrase = useVoiceStore((state) => state.simulatePhrase);
  const closeVoiceModal = useVoiceStore((state) => state.closeVoiceModal);

  const language = useAppStore((state) => state.language);

  if (!isVoiceModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={closeVoiceModal} />

      <div className="relative w-full max-w-md rounded-t-[2.5rem] bg-cream-bg p-6 shadow-2xl border-t border-cream-border z-10 max-h-[90vh] overflow-y-auto">
        {/* Handle Bar */}
        <div className="mx-auto h-1.5 w-12 rounded-full bg-cream-border/80" />

        {/* Modal Header */}
        <div className="mt-4 flex items-center justify-between pb-3 border-b border-cream-border">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-leaf-green text-cream-card shadow-sm">
              <Sparkles size={20} />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-soil-text">
                किसान आवाज सहायक (AI Voice Assistant)
              </h2>
              <p className="text-[11px] text-soil-brown">
                बोलकर फसल बेचें, मौसम या मंडी भाव जानें
              </p>
            </div>
          </div>
          <button
            onClick={closeVoiceModal}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-cream-card text-soil-brown hover:text-soil-text border border-cream-border"
          >
            <X size={18} />
          </button>
        </div>

        {/* Animated Visual Waveform / Mic Circle */}
        <div className="my-6 flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center">
            {/* Outer Pulsing Rings */}
            {isListening && (
              <>
                <span className="absolute h-32 w-32 animate-ping rounded-full bg-leaf-green/20" />
                <span className="absolute h-24 w-24 animate-pulse rounded-full bg-leaf-green/30" />
              </>
            )}
            {isSpeaking && (
              <>
                <span className="absolute h-28 w-28 animate-pulse rounded-full bg-harvest-gold/25" />
                <span className="absolute h-20 w-20 animate-ping rounded-full bg-harvest-gold/15" />
              </>
            )}

            {/* Central Interactive Mic Button */}
            <button
              onClick={isListening ? stopListening : startListening}
              className={`relative z-10 flex h-20 w-20 items-center justify-center rounded-full shadow-xl transition-all active:scale-95 ${
                isListening
                  ? "bg-leaf-green text-cream-card ring-4 ring-leaf-deep/30 animate-pulse"
                  : isSpeaking
                    ? "bg-harvest-gold text-soil-deep ring-4 ring-harvest-gold/40"
                    : "bg-leaf-deep text-cream-card hover:bg-leaf-green"
              }`}
            >
              {isListening ? (
                <Mic size={32} className="animate-bounce" />
              ) : isSpeaking ? (
                <Volume2 size={32} className="animate-pulse" />
              ) : (
                <MicOff size={28} />
              )}
            </button>
          </div>

          <p className="mt-3 text-xs font-bold text-soil-brown tracking-wide">
            {isListening
              ? "🎙️ सुन रहे हैं... कृपया बोलें (Listening...)"
              : isSpeaking
                ? "🔊 उत्तर बोला जा रहा है... (Speaking Reply)"
                : "माइक्रोफ़ोन पर टैप करें या नीचे डेमो सवाल चुनें"}
          </p>
        </div>

        {/* Live Transcript Display */}
        <div className="rounded-2xl bg-cream-card p-4 border border-cream-border shadow-sm">
          <div className="flex items-center justify-between text-[11px] font-semibold text-soil-brown mb-1.5">
            <span>आपकी आवाज (Live Transcript):</span>
            {isListening && (
              <span className="flex items-center gap-1 text-leaf-deep">
                <span className="h-1.5 w-1.5 rounded-full bg-leaf-green animate-ping" />
                Live
              </span>
            )}
          </div>
          <p className="text-sm font-bold text-soil-text min-h-[36px] italic">
            "{transcript || "कृपया माइक पर टैप करें या प्रश्न चुनें..."}"
          </p>
        </div>

        {/* AI Voice Reply Card */}
        {lastResponseText && (
          <div className="mt-3 rounded-2xl bg-leaf-soft/70 border border-leaf-deep/20 p-4 shadow-sm animate-fade-in">
            <div className="flex items-center justify-between text-xs font-bold text-leaf-deep mb-1">
              <span className="flex items-center gap-1.5">
                <Volume2 size={16} />
                <span>सहायक का उत्तर (AI Assistant Reply):</span>
              </span>
              {activeIntent && (
                <span className="rounded-full bg-leaf-deep/10 px-2 py-0.5 text-[10px] font-bold">
                  {activeIntent.replace("INTENT_", "")}
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-soil-text leading-relaxed">
              {language === "hi" ? lastResponseText : lastResponseTextEn || lastResponseText}
            </p>
            <div className="mt-2.5 flex items-center justify-between text-[11px] text-leaf-deep font-semibold">
              <span className="flex items-center gap-1">
                <CheckCircle2 size={14} /> स्क्रीन स्वतः खुल गई है
              </span>
              <button
                onClick={() =>
                  useVoiceStore.getState().speakText(
                    language === "hi" ? lastResponseText : lastResponseTextEn || lastResponseText,
                  )
                }
                className="hover:underline flex items-center gap-1 font-bold"
              >
                दोबारा सुनें 🔊
              </button>
            </div>
          </div>
        )}

        {/* 1-Tap Quick Demo Chips (Noise-proof hackathon demo) */}
        <div className="mt-4">
          <p className="text-xs font-bold text-soil-brown mb-2 flex items-center gap-1.5">
            <Sparkles size={14} className="text-leaf-green" />
            <span>1-टैप डेमो प्रश्न (Instant 1-Click Simulation):</span>
          </p>
          <div className="grid grid-cols-1 gap-2">
            {QUICK_DEMO_CHIPS.map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => simulatePhrase(chip.phrase)}
                className="flex items-center justify-between rounded-xl border border-cream-border bg-cream-card px-3.5 py-2.5 text-left text-xs transition active:scale-98 hover:border-leaf-green/50 hover:bg-leaf-soft/20 shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{chip.icon}</span>
                  <div>
                    <p className="font-bold text-soil-text">{chip.label}</p>
                    <p className="text-[10px] text-soil-brown">{chip.intent}</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-soil-brown" />
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex items-center gap-2 pt-2 border-t border-cream-border">
          <button
            type="button"
            onClick={startListening}
            className="flex-1 flex min-h-[48px] items-center justify-center gap-1.5 rounded-2xl bg-leaf-green text-xs font-bold text-cream-card shadow-sm active:scale-95 transition hover:bg-leaf-deep"
          >
            <RotateCcw size={15} />
            <span>दोबारा बोलें (Speak Again)</span>
          </button>
          <button
            type="button"
            onClick={closeVoiceModal}
            className="flex-1 flex min-h-[48px] items-center justify-center rounded-2xl bg-cream-card border border-cream-border text-xs font-bold text-soil-brown hover:text-soil-text active:scale-95 transition"
          >
            बंद करें (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
