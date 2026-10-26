import {
  INITIAL_MOCK_LISTINGS,
  type CropListing,
  type BargainOffer,
} from '@kisaansahyog/shared';
import { enqueueMutation } from '../utils/offlineQueue';

export const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';

export interface ApiListing extends CropListing {}
export interface ApiOffer extends BargainOffer {}

export interface SafeFetchResult<T> {
  ok: boolean;
  data: T;
  source: 'live' | 'fallback';
  fetchedAt: number;
  error?: string;
}

export interface TelemetryWeatherData {
  temp: number;
  tempMax: number;
  tempMin: number;
  humidity: number;
  rainProbability: number;
  condition: string;
  conditionHi: string;
  source: 'live' | 'fallback';
  windSpeed?: number;
  feelsLike?: number;
  location?: string;
  timestamp?: string;
}

export interface MandiRateItem {
  crop: string;
  cropHi: string;
  modalPrice: number;
  unit: string;
  trend: string;
  trendPercent: number;
  arrivalsQuintals: number;
  mandi: string;
  state: string;
  date: string;
}

export interface TelemetrySoilData {
  location: string;
  soilType: string;
  moisturePercent: number;
  moistureStatus: string;
  pH: number;
  pHStatus: string;
  organicCarbonPercent: number;
  organicCarbonStatus: string;
  nitrogenKgHa: number;
  nitrogenStatus: string;
  phosphorusKgHa: number;
  phosphorusStatus: string;
  potassiumKgHa: number;
  potassiumStatus: string;
  electricalConductivity: number;
  zincPpm: number;
  temperatureC: number;
  recommendations: string[];
  recommendationsHi: string[];
  source: string;
}

export interface TelemetryAdvisoryData {
  crop: string;
  variety: string;
  farmerName: string;
  daysSinceSowing: number;
  stage: string;
  stageHi: string;
  rainProbability: number;
  action: 'postpone' | 'irrigate' | 'monitor';
  headline: string;
  headlineHi: string;
  advisoryText: string;
  advisoryTextHi: string;
  dieselSavingsAmount: number;
  savingsNote: string;
  savingsNoteHi: string;
  source: 'live' | 'fallback';
  recommendedDate: string;
}

export const FALLBACK_WEATHER: TelemetryWeatherData = {
  temp: 24,
  tempMax: 28,
  tempMin: 16,
  humidity: 58,
  rainProbability: 10,
  condition: 'Clear Sky',
  conditionHi: 'साफ आसमान',
  windSpeed: 14,
  feelsLike: 25,
  location: 'Sitapur, Uttar Pradesh',
  source: 'fallback',
};

export const FALLBACK_SOIL: TelemetrySoilData = {
  location: 'Sitapur District Benchmark (Sitapur, UP)',
  soilType: 'Alluvial Loam',
  moisturePercent: 34,
  moistureStatus: 'Optimal (30-40% range)',
  pH: 7.2,
  pHStatus: 'Neutral / Ideal (6.5-7.5 range)',
  organicCarbonPercent: 0.48,
  organicCarbonStatus: 'Deficit / Low (< 0.50%)',
  nitrogenKgHa: 210,
  nitrogenStatus: 'Low (< 280 kg/ha)',
  phosphorusKgHa: 14,
  phosphorusStatus: 'Low (< 23 kg/ha)',
  potassiumKgHa: 280,
  potassiumStatus: 'Adequate / Medium (140-280 kg/ha)',
  electricalConductivity: 0.32,
  zincPpm: 0.54,
  temperatureC: 25,
  recommendations: [
    '1 bag DAP (50kg) + 25kg Zinc Sulphate per acre at basal dressing',
    'Apply 10 tonnes Farmyard Manure (FYM) per hectare to rebuild organic carbon',
    'Top-dress Nitrogen in two split doses (at CRI stage and first tillering)',
  ],
  recommendationsHi: [
    'प्रति एकड़ 1 बोरी डीएपी (50 किग्रा) + 25 किग्रा जिंक सल्फेट बुवाई/शुरुआती अवस्था में दें',
    'जैविक कार्बन बढ़ाने हेतु 10 टन प्रति हेक्टेयर गोबर की खाद (FYM) डालें',
    'यूरिया को दो भागों में बांटकर दें (CRI अवस्था और कल्ले फूटने पर)',
  ],
  source: 'district_benchmark',
};

export const FALLBACK_ADVISORY: TelemetryAdvisoryData = {
  crop: 'Wheat HD-2967',
  variety: 'HD-2967 (Sharbati)',
  farmerName: 'रमेश कुमार (Ramesh Kumar)',
  daysSinceSowing: 28,
  stage: 'CRI (Crown Root Initiation) / Tillering',
  stageHi: 'प्रथम जड़ फुटाव (CRI) / कल्ले निकलने की अवस्था',
  rainProbability: 10,
  action: 'irrigate',
  headline: 'Perform 1st CRI irrigation immediately',
  headlineHi: 'प्रथम CRI सिंचाई तत्काल करें',
  advisoryText:
    'Wheat is in the critical Crown Root Initiation (CRI) window (21-35 days). Rain probability is very low (<20%). Complete the first irrigation immediately to foster deep root crown development.',
  advisoryTextHi:
    'गेहूं प्रथम जड़ फुटाव (CRI) की अत्यंत संवेदनशील अवस्था में है। बारिश की संभावना नगण्य है। मजबूत जड़ों के लिए प्रथम सिंचाई तत्काल पूरी करें।',
  dieselSavingsAmount: 0,
  savingsNote: 'Crucial for yield protection (+15% harvest yield)',
  savingsNoteHi: 'उपज सुरक्षा के लिए आवश्यक (+15% अधिक पैदावार)',
  source: 'fallback',
  recommendedDate: 'Immediate (Next 24-48 hours)',
};

export async function safeFetch<T>(
  url: string,
  options: RequestInit = {},
  fallbackData: T,
  timeoutMs: number = 1500,
): Promise<SafeFetchResult<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        ok: false,
        data: fallbackData,
        source: 'fallback',
        fetchedAt: Date.now(),
        error: `HTTP ${response.status}`,
      };
    }

    const result = (await response.json()) as any;
    // Unwrap if endpoint wraps in { data: ... }
    const unwrapped =
      result && typeof result === 'object' && 'data' in result
        ? (result.data as T)
        : (result as T);

    const source: 'live' | 'fallback' =
      result?.data?.source === 'fallback' || result?.source === 'fallback'
        ? 'fallback'
        : 'live';

    return {
      ok: true,
      data: unwrapped,
      source,
      fetchedAt: Date.now(),
    };
  } catch (err) {
    clearTimeout(timeoutId);
    const errorMessage =
      err instanceof Error ? err.message : 'Unknown network error';
    return {
      ok: false,
      data: fallbackData,
      source: 'fallback',
      fetchedAt: Date.now(),
      error: errorMessage,
    };
  }
}

const getFallbackListings = (): ApiListing[] => {
  return (INITIAL_MOCK_LISTINGS as unknown as CropListing[]).map((item) => ({
    ...item,
    quantityQuintals:
      item.quantityQuintals ?? (item as any).quantity ?? 0,
    ratePerQuintal:
      item.ratePerQuintal ?? (item as any).rate ?? 0,
    district:
      item.district ??
      (item as any).location?.split(',')[0]?.trim() ??
      '',
    state: item.state ?? '',
    harvestDate: item.harvestDate ?? 'Ready Now (तैयार स्टॉक)',
    verified: item.verified ?? true,
    organic: item.organic ?? false,
    createdAt: item.createdAt ?? new Date().toISOString(),
    quantity:
      item.quantityQuintals ?? (item as any).quantity ?? 0,
    rate: item.ratePerQuintal ?? (item as any).rate ?? 0,
    location:
      item.location ??
      [item.district, item.state].filter(Boolean).join(', '),
  }));
};

export interface HealthResponse {
  status: string;
  service?: string;
  app?: string;
  version?: string;
  port?: number;
  uptimeSeconds?: number;
  timestamp?: string;
  database?: string;
  supabaseConfigured?: boolean;
}

export const checkHealth = async (): Promise<
  SafeFetchResult<HealthResponse>
> => {
  return safeFetch<HealthResponse>(
    `${API_BASE_URL}/health`,
    { method: 'GET' },
    {
      status: 'offline',
      service: '@kisaansahyog/api',
      database: 'in-memory-fallback',
      supabaseConfigured: false,
    },
    1500,
  );
};

export const fetchHealth = checkHealth;

export const fetchListings = async (): Promise<
  SafeFetchResult<{ listings: ApiListing[]; source?: string }>
> => {
  const fallback = {
    listings: getFallbackListings(),
    source: 'fallback',
  };

  const res = await safeFetch<{
    listings: ApiListing[];
    source?: string;
  }>(
    `${API_BASE_URL}/api/listings`,
    { method: 'GET' },
    fallback,
    2000,
  );

  if (!res.ok || !res.data?.listings || res.data.listings.length === 0) {
    return {
      ok: res.ok,
      data: fallback,
      source: 'fallback',
      fetchedAt: Date.now(),
      error: res.error,
    };
  }

  return res;
};

export const createListing = async (
  payload: Partial<ApiListing>,
): Promise<SafeFetchResult<{ listing: ApiListing | null; source?: string }>> => {
  const localId = `local-lot-${Date.now()}`;
  const localListing: ApiListing = {
    id: localId,
    cropName: payload.cropName || '',
    cropNameHi: payload.cropNameHi || payload.cropName || '',
    variety: payload.variety || '',
    quantityQuintals:
      payload.quantityQuintals ?? payload.quantity ?? 0,
    ratePerQuintal: payload.ratePerQuintal ?? payload.rate ?? 0,
    farmerName: payload.farmerName || 'Farmer',
    farmerPhone: payload.farmerPhone || '',
    district: payload.district || '',
    state: payload.state || '',
    harvestDate: payload.harvestDate || 'Ready Now',
    verified: payload.verified ?? true,
    organic: payload.organic ?? false,
    createdAt: new Date().toISOString(),
    quantity: payload.quantityQuintals ?? payload.quantity ?? 0,
    rate: payload.ratePerQuintal ?? payload.rate ?? 0,
    location:
      payload.location ||
      [payload.district, payload.state].filter(Boolean).join(', '),
  };

  const result = await safeFetch<{ listing: ApiListing | null; source?: string }>(
    `${API_BASE_URL}/api/listings`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
    { listing: localListing, source: 'fallback' },
    2000,
  );

  // If live submission fails or falls back, enqueue to offline mutation queue
  if (!result.ok || result.source === 'fallback') {
    enqueueMutation('CREATE_LISTING', payload);
  }

  return result;
};

export const createListingApi = createListing;

export const fetchOffers = async (): Promise<
  SafeFetchResult<{ offers: ApiOffer[]; source?: string }>
> => {
  return safeFetch<{ offers: ApiOffer[]; source?: string }>(
    `${API_BASE_URL}/api/offers`,
    { method: 'GET' },
    { offers: [], source: 'fallback' },
    2000,
  );
};

export const createOffer = async (
  payload: Partial<ApiOffer>,
): Promise<SafeFetchResult<{ offer: ApiOffer | null; source?: string }>> => {
  const localOffer: ApiOffer = {
    id: `local-offer-${Date.now()}`,
    listingId: payload.listingId || '',
    cropName: payload.cropName || '',
    farmerName: payload.farmerName || '',
    farmerPhone: payload.farmerPhone || '',
    buyerName: payload.buyerName || 'Buyer',
    buyerPhone: payload.buyerPhone || '',
    originalRate: payload.originalRate || 0,
    offeredRate: payload.offeredRate || 0,
    quantityQuintals: payload.quantityQuintals || 0,
    status: (payload.status as any) || 'pending',
    createdAt: new Date().toISOString(),
  };

  const result = await safeFetch<{ offer: ApiOffer | null; source?: string }>(
    `${API_BASE_URL}/api/offers`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
    { offer: localOffer, source: 'fallback' },
    2000,
  );

  // If live submission fails or falls back, enqueue to offline mutation queue
  if (!result.ok || result.source === 'fallback') {
    enqueueMutation('SUBMIT_OFFER', payload);
  }

  return result;
};

export const createOfferApi = createOffer;

// --- Phase 5 Telemetry API Helpers ---

function mapWmoCode(code: number): { condition: string; conditionHi: string } {
  if (code === 0) return { condition: 'Clear Sky', conditionHi: 'साफ आसमान' };
  if (code === 1) return { condition: 'Mainly Clear', conditionHi: 'मुख्यतः साफ' };
  if (code === 2) return { condition: 'Partly Cloudy', conditionHi: 'आंशिक रूप से बादल' };
  if (code === 3) return { condition: 'Overcast', conditionHi: 'घने बादल' };
  if (code === 45 || code === 48) return { condition: 'Foggy', conditionHi: 'कोहरा' };
  if (code >= 51 && code <= 55) return { condition: 'Light Drizzle', conditionHi: 'हल्की बूंदाबांदी' };
  if (code >= 61 && code <= 65) return { condition: 'Rain', conditionHi: 'वर्षा' };
  if (code >= 80 && code <= 82) return { condition: 'Rain Showers', conditionHi: 'वर्षा की फुहारें' };
  if (code >= 95) return { condition: 'Thunderstorm', conditionHi: 'आंधी-तूफान' };
  return { condition: 'Cloudy', conditionHi: 'बादल छाए रहेंगे' };
}

export const fetchTelemetryWeather = async (
  lat?: number,
  lon?: number,
  locationName?: string
): Promise<SafeFetchResult<TelemetryWeatherData>> => {
  const queryParams = new URLSearchParams();
  if (lat !== undefined) queryParams.set('lat', String(lat));
  if (lon !== undefined) queryParams.set('lon', String(lon));
  if (locationName) queryParams.set('location', locationName);
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

  // 1. Try local API server first
  const result = await safeFetch<TelemetryWeatherData>(
    `${API_BASE_URL}/api/telemetry/weather${queryString}`,
    { method: 'GET' },
    {
      ...FALLBACK_WEATHER,
      location: locationName || FALLBACK_WEATHER.location,
    },
    1500,
  );

  if (result.ok && result.data && result.source === 'live') {
    return result;
  }

  // 2. Direct browser Open-Meteo fallback if custom lat/lon provided
  if (lat !== undefined && lon !== undefined) {
    try {
      const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,apparent_temperature&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FKolkata`;
      const directRes = await fetch(openMeteoUrl);
      if (directRes.ok) {
        const raw = await directRes.json();
        const current = raw?.current || {};
        const daily = raw?.daily || {};
        const temp = Math.round(Number(current.temperature_2m ?? 24));
        const wmoCode = Number(current.weather_code ?? 0);
        const { condition, conditionHi } = mapWmoCode(wmoCode);

        const liveData: TelemetryWeatherData = {
          temp,
          tempMax:
            Array.isArray(daily.temperature_2m_max) && daily.temperature_2m_max.length > 0
              ? Math.round(daily.temperature_2m_max[0])
              : temp + 4,
          tempMin:
            Array.isArray(daily.temperature_2m_min) && daily.temperature_2m_min.length > 0
              ? Math.round(daily.temperature_2m_min[0])
              : temp - 5,
          humidity: Math.round(Number(current.relative_humidity_2m ?? 55)),
          rainProbability:
            Array.isArray(daily.precipitation_probability_max) &&
            daily.precipitation_probability_max.length > 0
              ? Math.round(daily.precipitation_probability_max[0])
              : 10,
          condition,
          conditionHi,
          windSpeed: Math.round(Number(current.wind_speed_10m ?? 12)),
          feelsLike: Math.round(Number(current.apparent_temperature ?? temp)),
          location: locationName || `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
          source: 'live',
          timestamp: new Date().toISOString(),
        };

        return {
          ok: true,
          data: liveData,
          source: 'live',
          fetchedAt: Date.now(),
        };
      }
    } catch {
      // Fall through to fallback
    }
  }

  return {
    ...result,
    data: {
      ...result.data,
      location: locationName || result.data.location,
    },
  };
};

export const fetchTelemetryMandi = async (): Promise<
  SafeFetchResult<{
    mandi: string;
    state: string;
    updatedAt: string;
    rates: MandiRateItem[];
  }>
> => {
  return safeFetch(
    `${API_BASE_URL}/api/telemetry/mandi`,
    { method: 'GET' },
    {
      mandi: 'Sitapur Mandi',
      state: 'Uttar Pradesh',
      updatedAt: new Date().toISOString(),
      rates: [],
    },
    1500,
  );
};

export const fetchTelemetrySoil = async (): Promise<
  SafeFetchResult<TelemetrySoilData>
> => {
  return safeFetch<TelemetrySoilData>(
    `${API_BASE_URL}/api/telemetry/soil`,
    { method: 'GET' },
    FALLBACK_SOIL,
    1500,
  );
};

export const fetchTelemetryAdvisory = async (
  days: number = 28,
): Promise<SafeFetchResult<TelemetryAdvisoryData>> => {
  return safeFetch<TelemetryAdvisoryData>(
    `${API_BASE_URL}/api/telemetry/advisory?days=${days}`,
    { method: 'GET' },
    FALLBACK_ADVISORY,
    1500,
  );
};

export const apiClient = {
  baseUrl: API_BASE_URL,
  checkHealth,
  fetchHealth,
  fetchListings,
  createListing,
  createListingApi,
  fetchOffers,
  createOffer,
  createOfferApi,
  fetchTelemetryWeather,
  fetchTelemetryMandi,
  fetchTelemetrySoil,
  fetchTelemetryAdvisory,
};

export default apiClient;
