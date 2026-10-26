export const APP_NAME = "KisaanSahyog";
export const APP_NAME_HI = "किसान सहयोग";
export const APP_TAGLINE = "Smarter farming, stronger harvests.";
export const APP_TAGLINE_HI = "बेहतर खेती, मजबूत फसल।";

/** Languages supported by the app. Hindi is the default for the pilot. */
export const LANGUAGES = ["hi", "en", "pa", "mr"] as const;
export type Language = (typeof LANGUAGES)[number];

export const ROLES = ["farmer", "buyer"] as const;
export type Role = (typeof ROLES)[number];

export const FARMER_TABS = ["advisory", "soil", "sell", "market"] as const;
export type FarmerTab = (typeof FARMER_TABS)[number];

export const BUYER_TABS = ["market", "requirements", "saved", "account"] as const;
export type BuyerTab = (typeof BUYER_TABS)[number];

export type NavKey = FarmerTab | BuyerTab;

export const WEATHER_STATUSES = [
  "clear",
  "partlyCloudy",
  "cloudy",
  "lightRain",
  "heavyRain",
  "thunderstorm",
  "fog",
  "hot",
  "cold",
  "humid",
  "windy",
] as const;
export type WeatherStatus = (typeof WEATHER_STATUSES)[number];

export const DEFAULT_LANGUAGE: Language = "hi";
export const DEFAULT_ROLE: Role = "farmer";
export const DEFAULT_FARMER_TAB: FarmerTab = "advisory";
export const DEFAULT_BUYER_TAB: BuyerTab = "market";

/** Canonical Stitch palette. Mirrors apps/web/tailwind.config.js. */
export const BRAND_COLORS = {
  creamBg: "#FAF6EE",
  creamCard: "#FFFFFF",
  creamBorder: "#E8DCC8",
  creamTan: "#EADFCB",
  soilBrown: "#6B4226",
  soilDeep: "#4A2C17",
  soilText: "#2B1D12",
  leafGreen: "#3F8F3F",
  leafDeep: "#2E6B34",
  leafSoft: "#E6F2DF",
  harvestGold: "#E0A526",
  clayRed: "#B3412E",
} as const;

export const API_HEALTH_PATH = "/health";
export const KVK_SOURCE = "Krishi Vigyan Kendra (KVK)";
export const VOICE_ENTRY_PHASE = 4;
export const SKILLS_ENGINE_PHASE = 6;
