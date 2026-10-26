import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface FarmerProfile {
  name: string;
  phone: string;
  state: string;
  district: string;
  village: string;
  lat: number;
  lon: number;
  landAcres: number;
  activeCrop: string;
  sowingDate: string; // YYYY-MM-DD
  soilType: string;
  soilPh: number;
  soilMoisturePct: number;
}

export interface RegionalPresetInfo {
  state: string;
  district: string;
  lat: number;
  lon: number;
  defaultSoil: string;
  soilPh: number;
  mandiBenchmark: number;
}

export const REGIONAL_PRESETS: Record<string, RegionalPresetInfo> = {
  Sitapur: {
    state: "Uttar Pradesh",
    district: "Sitapur",
    lat: 27.56,
    lon: 80.68,
    defaultSoil: "Alluvial Loam (जलोढ़ दोमट)",
    soilPh: 7.2,
    mandiBenchmark: 2400,
  },
  Agra: {
    state: "Uttar Pradesh",
    district: "Agra",
    lat: 27.18,
    lon: 78.01,
    defaultSoil: "Sandy Loam (बलुई दोमट)",
    soilPh: 7.6,
    mandiBenchmark: 2380,
  },
  Karnal: {
    state: "Haryana",
    district: "Karnal",
    lat: 29.68,
    lon: 76.99,
    defaultSoil: "Clay Loam (मटियार दोमट)",
    soilPh: 7.4,
    mandiBenchmark: 2450,
  },
  Ludhiana: {
    state: "Punjab",
    district: "Ludhiana",
    lat: 30.90,
    lon: 75.85,
    defaultSoil: "Loamy Sand (हल्की दोमट)",
    soilPh: 7.1,
    mandiBenchmark: 2480,
  },
  Alwar: {
    state: "Rajasthan",
    district: "Alwar",
    lat: 27.55,
    lon: 76.63,
    defaultSoil: "Arid Sand Loam (रेतीली दोमट)",
    soilPh: 7.8,
    mandiBenchmark: 2360,
  },
  Nashik: {
    state: "Maharashtra",
    district: "Nashik",
    lat: 19.99,
    lon: 73.78,
    defaultSoil: "Black Soil (काली मिट्टी / Regur)",
    soilPh: 7.5,
    mandiBenchmark: 2500,
  },
};

// Calculate a sowing date 28 days in the past as standard baseline
function calculateDefaultSowingDate(): string {
  const d = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000);
  return d.toISOString().split("T")[0];
}

export const DEFAULT_FARMER_PROFILE: FarmerProfile = {
  name: "रमेश कुमार / Ramesh Kumar",
  phone: "9876543210",
  state: "Uttar Pradesh",
  district: "Sitapur",
  village: "महोली (Maholi)",
  lat: 27.56,
  lon: 80.68,
  landAcres: 3.0,
  activeCrop: "Wheat HD-2967 (गेहूं)",
  sowingDate: calculateDefaultSowingDate(),
  soilType: "Alluvial Loam (जलोढ़ दोमट)",
  soilPh: 7.2,
  soilMoisturePct: 34,
};

export interface FarmerProfileState {
  profile: FarmerProfile;
  isProfileDrawerOpen: boolean;
  lastUpdated: number;

  // Actions
  setProfileDrawerOpen: (open: boolean) => void;
  toggleProfileDrawer: () => void;
  updateProfile: (updates: Partial<FarmerProfile>) => void;
  applyRegionalPreset: (presetKey: string) => void;
  resetToDefaults: () => void;
  getDaysSinceSowing: () => number;
}

export const useFarmerProfileStore = create<FarmerProfileState>()(
  persist(
    (set, get) => ({
      profile: DEFAULT_FARMER_PROFILE,
      isProfileDrawerOpen: false,
      lastUpdated: Date.now(),

      setProfileDrawerOpen: (isProfileDrawerOpen: boolean) =>
        set({ isProfileDrawerOpen }),

      toggleProfileDrawer: () =>
        set((state) => ({ isProfileDrawerOpen: !state.isProfileDrawerOpen })),

      updateProfile: (updates: Partial<FarmerProfile>) =>
        set((state) => ({
          profile: { ...state.profile, ...updates },
          lastUpdated: Date.now(),
        })),

      applyRegionalPreset: (presetKey: string) => {
        const preset = REGIONAL_PRESETS[presetKey];
        if (!preset) return;
        set((state) => ({
          profile: {
            ...state.profile,
            district: preset.district,
            state: preset.state,
            lat: preset.lat,
            lon: preset.lon,
            soilType: preset.defaultSoil,
            soilPh: preset.soilPh,
          },
          lastUpdated: Date.now(),
        }));
      },

      resetToDefaults: () =>
        set({
          profile: {
            ...DEFAULT_FARMER_PROFILE,
            sowingDate: calculateDefaultSowingDate(),
          },
          lastUpdated: Date.now(),
        }),

      getDaysSinceSowing: () => {
        const sowing = new Date(get().profile.sowingDate);
        if (isNaN(sowing.getTime())) return 28;
        const diffMs = Date.now() - sowing.getTime();
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        return Math.max(1, Math.min(180, days));
      },
    }),
    {
      name: "kisaan_farmer_profile",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        profile: state.profile,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);
