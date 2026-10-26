import { create } from "zustand";
import { useAppStore } from "./useAppStore";

export type SimulationScenario =
  | "normal"
  | "heavy_rain"
  | "pest_alert"
  | "mandi_crash"
  | "offline_2g";

export interface SimulationState {
  activeScenario: SimulationScenario;
  simulatedRainProb: number;
  simulatedTemp: number;
  simulatedSavings: number;
  isIrrigationPostponed: boolean;
  pestAlertActive: boolean;
  isMandiCrashed: boolean;
  isSimDrawerOpen: boolean;

  // Actions
  triggerHeavyRain: () => void;
  triggerPestAlert: () => void;
  triggerMandiCrash: () => void;
  trigger2GMode: () => void;
  resetSimulation: () => void;
  toggleDrawer: () => void;
  setSimDrawerOpen: (open: boolean) => void;
}

const INITIAL_STATE = {
  activeScenario: "normal" as SimulationScenario,
  simulatedRainProb: 10,
  simulatedTemp: 24,
  simulatedSavings: 0,
  isIrrigationPostponed: false,
  pestAlertActive: false,
  isMandiCrashed: false,
  isSimDrawerOpen: false,
};

export const useSimulationStore = create<SimulationState>()((set) => ({
  ...INITIAL_STATE,

  triggerHeavyRain: () => {
    set({
      activeScenario: "heavy_rain",
      simulatedRainProb: 85,
      simulatedTemp: 22,
      isIrrigationPostponed: true,
      simulatedSavings: 2400, // ₹800/acre × 3 acres
      pestAlertActive: false,
      isMandiCrashed: false,
      isSimDrawerOpen: false,
    });
  },

  triggerPestAlert: () => {
    set({
      activeScenario: "pest_alert",
      pestAlertActive: true,
      isIrrigationPostponed: false,
      isMandiCrashed: false,
      isSimDrawerOpen: false,
    });
  },

  triggerMandiCrash: () => {
    set({
      activeScenario: "mandi_crash",
      isMandiCrashed: true,
      pestAlertActive: false,
      isIrrigationPostponed: false,
      isSimDrawerOpen: false,
    });
  },

  trigger2GMode: () => {
    useAppStore.getState().setIs2GMode(true);
    set({
      activeScenario: "offline_2g",
      isSimDrawerOpen: false,
    });
  },

  resetSimulation: () => {
    useAppStore.getState().setIs2GMode(false);
    set({
      ...INITIAL_STATE,
      isSimDrawerOpen: false,
    });
  },

  toggleDrawer: () => {
    set((state) => ({ isSimDrawerOpen: !state.isSimDrawerOpen }));
  },

  setSimDrawerOpen: (open: boolean) => {
    set({ isSimDrawerOpen: open });
  },
}));
