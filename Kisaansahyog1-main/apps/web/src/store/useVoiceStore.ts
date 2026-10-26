import { create } from "zustand";
import { useAppStore } from "./useAppStore";
import {
  parseVoiceIntent,
  type VoiceIntentType,
} from "../utils/voiceIntentParser";

export interface VoiceState {
  isListening: boolean;
  transcript: string;
  lastResponseText: string;
  lastResponseTextEn: string;
  isSpeaking: boolean;
  isVoiceModalOpen: boolean;
  activeIntent: VoiceIntentType | null;

  // Actions
  startListening: () => void;
  stopListening: () => void;
  speakText: (text: string, lang?: string) => void;
  processTranscript: (text: string) => void;
  simulatePhrase: (phrase: string) => void;
  openVoiceModal: () => void;
  closeVoiceModal: () => void;
}

// Keep an active recognition instance reference outside zustand state
let activeRecognition: any = null;

export const useVoiceStore = create<VoiceState>()((set, get) => ({
  isListening: false,
  transcript: "",
  lastResponseText: "",
  lastResponseTextEn: "",
  isSpeaking: false,
  isVoiceModalOpen: false,
  activeIntent: null,

  speakText: (text: string, lang: string = "hi-IN") => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.95; // Slightly slower for clear Hindi cadence
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        set({ isSpeaking: true });
      };

      utterance.onend = () => {
        set({ isSpeaking: false });
      };

      utterance.onerror = () => {
        set({ isSpeaking: false });
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("[useVoiceStore] Speech synthesis error:", err);
      set({ isSpeaking: false });
    }
  },

  processTranscript: (rawText: string) => {
    const language = useAppStore.getState().language;
    const parsed = parseVoiceIntent(rawText, language);

    set({
      transcript: rawText,
      lastResponseText: parsed.ttsResponse,
      lastResponseTextEn: parsed.ttsResponseEn,
      activeIntent: parsed.intent,
      isListening: false,
    });

    // Execute target action if recognized
    if (parsed.targetTab) {
      useAppStore.getState().setFarmerTab(parsed.targetTab);
    }

    // Speak audio reply
    get().speakText(
      language === "hi" ? parsed.ttsResponse : parsed.ttsResponseEn,
      language === "hi" ? "hi-IN" : "en-IN",
    );
  },

  startListening: () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      set({
        isListening: false,
        transcript: "ब्राउज़र में ध्वनि पहचान समर्थित नहीं है। नीचे दिए गए बटनों का उपयोग करें।",
        lastResponseText: "कृपया त्वरित डेमो बटनों से सवाल पूछें।",
      });
      return;
    }

    try {
      if (activeRecognition) {
        activeRecognition.abort();
      }

      const recognition = new SpeechRecognition();
      activeRecognition = recognition;

      const userLang = useAppStore.getState().language;
      recognition.lang = userLang === "hi" ? "hi-IN" : "en-IN";
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        set({
          isListening: true,
          transcript: "सुन रहे हैं... (Listening...)",
        });
      };

      recognition.onresult = (event: any) => {
        let interim = "";
        let final = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item[0]) {
            if (item.isFinal) {
              final += item[0].transcript;
            } else {
              interim += item[0].transcript;
            }
          }
        }

        const currentText = final || interim;
        if (currentText) {
          set({ transcript: currentText });
        }

        if (final) {
          get().processTranscript(final);
        }
      };

      recognition.onerror = (err: any) => {
        console.warn("[useVoiceStore] Recognition error:", err);
        set({ isListening: false });
      };

      recognition.onend = () => {
        set({ isListening: false });
      };

      recognition.start();
    } catch (err) {
      console.warn("[useVoiceStore] Failed to start recognition:", err);
      set({ isListening: false });
    }
  },

  stopListening: () => {
    if (activeRecognition) {
      try {
        activeRecognition.stop();
      } catch {
        // Recognition might already have stopped
      }
      activeRecognition = null;
    }
    set({ isListening: false });
  },

  simulatePhrase: (phrase: string) => {
    get().stopListening();
    get().processTranscript(phrase);
  },

  openVoiceModal: () => {
    set({
      isVoiceModalOpen: true,
      transcript: "कृपया बोलें... (Speak now)",
      lastResponseText: "",
      activeIntent: null,
    });
    get().startListening();
  },

  closeVoiceModal: () => {
    get().stopListening();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    set({
      isVoiceModalOpen: false,
      isSpeaking: false,
      isListening: false,
    });
  },
}));
