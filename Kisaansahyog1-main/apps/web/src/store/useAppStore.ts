import { create } from "zustand";
import {
  DEFAULT_BUYER_TAB,
  DEFAULT_FARMER_TAB,
  DEFAULT_LANGUAGE,
  DEFAULT_ROLE,
  type BuyerTab,
  type FarmerTab,
  type Language,
  type Role,
} from "@kisaansahyog/shared";

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  location: string;
  role: Role;
}

interface AppState {
  language: Language;
  role: Role;
  is2GMode: boolean;
  farmerTab: FarmerTab;
  buyerTab: BuyerTab;
  isVoiceOpen: boolean;
  isLanguageModalOpen: boolean;
  isAuthenticated: boolean;
  userProfile: UserProfile | null;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  setRole: (role: Role) => void;
  toggleRole: () => void;
  setIs2GMode: (enabled: boolean) => void;
  toggle2GMode: () => void;
  setFarmerTab: (tab: FarmerTab) => void;
  setBuyerTab: (tab: BuyerTab) => void;
  setVoiceOpen: (open: boolean) => void;
  toggleVoice: () => void;
  setLanguageModalOpen: (open: boolean) => void;
  loginAs: (profile: UserProfile) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()((set) => ({
  language: DEFAULT_LANGUAGE,
  role: DEFAULT_ROLE,
  is2GMode: false,
  farmerTab: DEFAULT_FARMER_TAB,
  buyerTab: DEFAULT_BUYER_TAB,
  isVoiceOpen: false,
  isLanguageModalOpen: false,
  isAuthenticated: false,
  userProfile: null,

  setLanguage: (language) => set({ language }),
  toggleLanguage: () =>
    set((state) => {
      const order: Language[] = ["hi", "en", "pa", "mr"];
      const idx = order.indexOf(state.language);
      return { language: order[(idx + 1) % order.length] };
    }),

  setRole: (role) => set({ role }),
  toggleRole: () =>
    set((state) => ({ role: state.role === "farmer" ? "buyer" : "farmer" })),

  setIs2GMode: (is2GMode) => set({ is2GMode }),
  toggle2GMode: () => set((state) => ({ is2GMode: !state.is2GMode })),

  setFarmerTab: (farmerTab) => set({ farmerTab }),
  setBuyerTab: (buyerTab) => set({ buyerTab }),

  setVoiceOpen: (isVoiceOpen) => set({ isVoiceOpen }),
  toggleVoice: () => set((state) => ({ isVoiceOpen: !state.isVoiceOpen })),
  setLanguageModalOpen: (isLanguageModalOpen) => set({ isLanguageModalOpen }),
  loginAs: (profile) => set({ isAuthenticated: true, userProfile: profile, role: profile.role }),
  logout: () => set({ isAuthenticated: false, userProfile: null }),
}));
