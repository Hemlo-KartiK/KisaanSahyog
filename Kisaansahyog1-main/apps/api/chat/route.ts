import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI, FunctionDeclaration, Tool } from '@google/generative-ai';

// ============================================================================
// 1. Singleton Knowledge Base & Default Fallbacks
// ============================================================================

interface KnowledgeBase {
  ai_usage_rules?: string[];
  conversion_rules: {
    dap: { n_pct: number; p_pct: number; bag_kg: number };
    urea: { n_pct: number; bag_kg: number };
    mop: { k_pct: number; bag_kg: number };
  };
  crops: Record<
    string,
    { n_min: number; n_max: number; p_min: number; p_max: number; k_min: number; k_max: number; unit: string }
  >;
  region_hints: Record<string, string>;
  cautions?: string[];
}

const DEFAULT_KB: KnowledgeBase = {
  ai_usage_rules: [
    'Always use server tools for calculations; never guess or compute dosages yourself.',
    'Deliver short, warm, spoken-style responses suitable for text-to-speech audio.',
    'Never use markdown, asterisks, bullet points, hashtags, or formatting symbols.',
    'Always provide cautionary advice when applying chemical fertilizers.'
  ],
  conversion_rules: {
    dap: { n_pct: 0.18, p_pct: 0.46, bag_kg: 50 },
    urea: { n_pct: 0.46, bag_kg: 45 },
    mop: { k_pct: 0.60, bag_kg: 50 }
  },
  crops: {
    wheat: { n_min: 44, n_max: 52, p_min: 22, p_max: 26, k_min: 14, k_max: 18, unit: 'kg/acre' },
    mustard: { n_min: 30, n_max: 40, p_min: 16, p_max: 20, k_min: 10, k_max: 15, unit: 'kg/acre' },
    chana: { n_min: 8, n_max: 12, p_min: 18, p_max: 24, k_min: 8, k_max: 12, unit: 'kg/acre' },
    rice: { n_min: 40, n_max: 50, p_min: 20, p_max: 25, k_min: 15, k_max: 20, unit: 'kg/acre' }
  },
  region_hints: {
    Sitapur: 'Alluvial Loam',
    'Uttar Pradesh': 'Alluvial Loam',
    Haryana: 'Sandy Loam',
    Punjab: 'Alluvial Loam',
    Rajasthan: 'Arid Sandy Loam',
    Maharashtra: 'Black Soil'
  },
  cautions: [
    'Never mix Zinc Sulphate directly with DAP in the same spray or tank.',
    'Avoid top-dressing Urea if moderate or heavy rain is forecast within 48 hours.'
  ]
};

// Cached singleton instance loaded once at module startup
let kbCache: KnowledgeBase | null = null;

function loadKnowledgeBase(): KnowledgeBase {
  if (kbCache) return kbCache;

  try {
    const filePath = path.join(process.cwd(), 'data', 'fertilizer_knowledge_base.json');
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      kbCache = JSON.parse(raw);
      return kbCache!;
    }
  } catch (error) {
    console.warn('Failed to load fertilizer_knowledge_base.json, falling back to built-in KB:', error);
  }

  kbCache = DEFAULT_KB;
  return kbCache;
}

// Ensure startup load
loadKnowledgeBase();

// ============================================================================
// 2. Server-Side Tools with Deterministic Math & Fallbacks
// ============================================================================

// Tool 1: get_farmer_profile (Supabase with fallback)
async function toolGetFarmerProfile(farmerId?: string) {
  const fallbackProfile = {
    id: farmerId || 'farmer-sitapur-01',
    name: 'रमेश कुमार (Ramesh Kumar)',
    district: 'Sitapur',
    state: 'Uttar Pradesh',
    land_acres: 3,
    active_crop: 'Wheat HD-2967',
    sowing_date_days_ago: 28,
    crop_stage: 'Tillering / CRI Stage',
    soil_type: 'Alluvial Loam',
    soil_ph: 7.2,
    soil_moisture_pct: 34
  };

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return fallbackProfile;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const query = farmerId
      ? supabase.from('farmers').select('*').eq('id', farmerId).maybeSingle()
      : supabase.from('farmers').select('*').limit(1).maybeSingle();

    const { data, error } = await query;
    if (error || !data) return fallbackProfile;
    return data;
  } catch {
    return fallbackProfile;
  }
}

// Tool 2: get_weather (Open-Meteo + short summary only with fallback)
async function toolGetWeather(district: string = 'Sitapur') {
  const fallbackWeather = {
    summary: `${district} weather is currently 24 degrees Celsius with clear skies, 10 percent rain chance, and 34 percent soil moisture. Field conditions are normal for farming operations.`
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);

    const lat = 27.56;
    const lon = 80.68;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation&daily=precipitation_probability_max&hourly=soil_moisture_0_to_1cm&timezone=Asia%2FKolkata`;

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return fallbackWeather;
    const data = await res.json();

    const temp = Math.round(data.current?.temperature_2m ?? 24);
    const rainProb = data.daily?.precipitation_probability_max?.[0] ?? 10;
    const moisture = Math.round((data.hourly?.soil_moisture_0_to_1cm?.[0] ?? 0.34) * 100);

    let skyCondition = 'clear skies';
    if (rainProb > 60) skyCondition = 'heavy rain expected';
    else if (rainProb > 30) skyCondition = 'partly cloudy with rain possibility';

    return {
      summary: `${district} weather is ${temp} degrees Celsius with ${skyCondition}, rain probability is ${rainProb} percent, and soil moisture is ${moisture} percent.`
    };
  } catch {
    return fallbackWeather;
  }
}

// Tool 3: get_fertilizer_plan (Strict deterministic math according to conversion_rules)
function toolGetFertilizerPlan(cropName: string, acres: number = 1, zone: string = 'Sitapur') {
  const kb = loadKnowledgeBase();

  const normalizedCrop =
    cropName.toLowerCase().includes('mustard') || cropName.includes('सरसों')
      ? 'mustard'
      : cropName.toLowerCase().includes('chana') || cropName.includes('चना')
      ? 'chana'
      : cropName.toLowerCase().includes('rice') || cropName.includes('धान')
      ? 'rice'
      : 'wheat';

  const soilType = kb.region_hints[zone] || 'Alluvial Loam';
  const cropReq = kb.crops[normalizedCrop] || kb.crops.wheat;

  // Pick mid-range NPK dose in kg/acre
  const targetNPerAcre = (cropReq.n_min + cropReq.n_max) / 2;
  const targetPPerAcre = (cropReq.p_min + cropReq.p_max) / 2;
  const targetKPerAcre = (cropReq.k_min + cropReq.k_max) / 2;

  const totalN = targetNPerAcre * acres;
  const totalP = targetPPerAcre * acres;
  const totalK = targetKPerAcre * acres;

  // Conversion Rule 1: DAP satisfies Phosphorus first (46% P, 18% N, 50kg bag)
  const dapKg = Math.round(totalP / kb.conversion_rules.dap.p_pct);
  const dapBags = +(dapKg / kb.conversion_rules.dap.bag_kg).toFixed(1);
  const nFromDap = dapKg * kb.conversion_rules.dap.n_pct;

  // Conversion Rule 2: Subtract DAP's N; remaining N provided by Urea (46% N, 45kg bag)
  const remainingN = Math.max(0, totalN - nFromDap);
  const ureaKg = Math.round(remainingN / kb.conversion_rules.urea.n_pct);
  const ureaBags = +(ureaKg / kb.conversion_rules.urea.bag_kg).toFixed(1);

  // Conversion Rule 3: Potassium (K) supplied by MOP (60% K, 50kg bag)
  const mopKg = Math.round(totalK / kb.conversion_rules.mop.k_pct);
  const mopBags = +(mopKg / kb.conversion_rules.mop.bag_kg).toFixed(1);

  // Micronutrient extras
  const zincSulphateKg = Math.round(acres * 10);

  return {
    crop: normalizedCrop,
    acres,
    zone,
    soil_type: soilType,
    per_acre: {
      dap_kg: +(dapKg / acres).toFixed(1),
      dap_bags: +(dapBags / acres).toFixed(1),
      urea_kg: +(ureaKg / acres).toFixed(1),
      urea_bags: +(ureaBags / acres).toFixed(1),
      mop_kg: +(mopKg / acres).toFixed(1),
      mop_bags: +(mopBags / acres).toFixed(1)
    },
    total: {
      dap_kg: dapKg,
      dap_bags: dapBags,
      urea_kg: ureaKg,
      urea_bags: ureaBags,
      mop_kg: mopKg,
      mop_bags: mopBags,
      zinc_sulphate_kg: zincSulphateKg
    },
    timing: {
      basal: `Apply full DAP (${dapBags} bags of 50kg), full MOP (${mopBags} bags of 50kg), one third Urea (${+(ureaBags / 3).toFixed(1)} bags of 45kg), and ${zincSulphateKg} kg Zinc Sulphate at sowing.`,
      first_top_dressing: `Apply one third Urea (${+(ureaBags / 3).toFixed(1)} bags) at 21 to 25 days during first irrigation.`,
      second_top_dressing: `Apply the remaining one third Urea (${+(ureaBags / 3).toFixed(1)} bags) at 40 to 45 days during tillering.`
    },
    cautions: kb.cautions || [
      'Never mix Zinc Sulphate directly with DAP in the same tank.',
      'Do not apply Urea if rain is forecast within 48 hours.'
    ]
  };
}

// Tool 4: get_mandi_price (Cached prices.json with fallback)
function toolGetMandiPrice(cropName: string = 'wheat') {
  const fallbackPrices: Record<string, { modal: number; min: number; max: number; mandi: string }> = {
    wheat: { modal: 2400, min: 2350, max: 2480, mandi: 'Sitapur' },
    mustard: { modal: 5350, min: 5200, max: 5450, mandi: 'Sitapur' },
    chana: { modal: 5900, min: 5750, max: 6050, mandi: 'Sitapur' },
    rice: { modal: 3750, min: 3600, max: 3900, mandi: 'Sitapur' }
  };

  try {
    const pricesPath = path.join(process.cwd(), 'data', 'prices.json');
    if (fs.existsSync(pricesPath)) {
      const fileData = JSON.parse(fs.readFileSync(pricesPath, 'utf-8'));
      const cropKey = Object.keys(fileData).find((k) => k.toLowerCase().includes(cropName.toLowerCase()));
      if (cropKey && fileData[cropKey]) {
        return fileData[cropKey];
      }
    }
  } catch {
    // Proceed to fallback map
  }

  const normalized =
    cropName.toLowerCase().includes('mustard') || cropName.includes('सरसों')
      ? 'mustard'
      : cropName.toLowerCase().includes('chana') || cropName.includes('चना')
      ? 'chana'
      : cropName.toLowerCase().includes('rice') || cropName.includes('धान')
      ? 'rice'
      : 'wheat';

  return fallbackPrices[normalized];
}

// ============================================================================
// 3. Spoken Text Sanitizer (Strip all Markdown and Symbols)
// ============================================================================
function cleanSpokenText(text: string): string {
  return text
    .replace(/[*#_`~\[\]]/g, '')
    .replace(/[-•]\s+/g, '')
    .replace(/\n+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// ============================================================================
// 4. Gemini Function Tool Declarations
// ============================================================================
const toolsDeclarations: FunctionDeclaration[] = [
  {
    name: 'get_farmer_profile',
    description: 'Retrieves the authenticated farmer land size, location, active crop, and soil profile.',
    parameters: {
      type: 'OBJECT' as any,
      properties: {
        farmerId: { type: 'STRING' as any, description: 'Optional unique farmer ID' }
      }
    }
  },
  {
    name: 'get_weather',
    description: 'Fetches local weather, rain probability, and soil moisture summary for a district.',
    parameters: {
      type: 'OBJECT' as any,
      properties: {
        district: { type: 'STRING' as any, description: 'District name, e.g. Sitapur' }
      }
    }
  },
  {
    name: 'get_fertilizer_plan',
    description: 'Calculates exact ICAR-aligned fertilizer dose in kilograms and bags for a given crop, land acres, and zone.',
    parameters: {
      type: 'OBJECT' as any,
      properties: {
        cropName: { type: 'STRING' as any, description: 'Crop name, e.g., wheat, mustard, chana' },
        acres: { type: 'NUMBER' as any, description: 'Land area in acres' },
        zone: { type: 'STRING' as any, description: 'District or zone name, e.g., Sitapur' }
      },
      required: ['cropName', 'acres']
    }
  },
  {
    name: 'get_mandi_price',
    description: 'Fetches daily Mandi modal rates and price ranges for agricultural crops.',
    parameters: {
      type: 'OBJECT' as any,
      properties: {
        cropName: { type: 'STRING' as any, description: 'Crop name, e.g. wheat, mustard' }
      },
      required: ['cropName']
    }
  }
];

// ============================================================================
// 5. POST /api/chat Handler
// ============================================================================
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, language = 'hi', farmerId } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'message is required and must be a string' }, { status: 400 });
    }

    const kb = loadKnowledgeBase();
    const rules = kb.ai_usage_rules?.join(' ') ?? '';

    const systemInstruction = `
${rules}
You are the voice assistant for KisaanSahyog speaking directly to an Indian smallholder farmer.
Target spoken language: ${language === 'hi' ? 'Hindi (written in clean Devanagari script)' : 'English'}.
CRITICAL INSTRUCTIONS:
1. Always call the appropriate tools to look up profiles, weather summaries, fertilizer dosages, and mandi rates. NEVER compute chemical or fertilizer dosages using your own math.
2. Deliver short, warm, spoken answers that sound natural when read aloud through text-to-speech.
3. Keep answers concise, strictly 2 to 4 spoken sentences.
4. ABSOLUTELY DO NOT use any markdown formatting, asterisks, bold characters, bullet points, numbered lists, or hashtags.
`.trim();

    const apiKey = process.env.GEMINI_API_KEY;

    // Resilient fallback if GEMINI_API_KEY is not configured
    if (!apiKey) {
      const lower = message.toLowerCase();
      let fallbackText = '';

      if (lower.includes('खाद') || lower.includes('यूरिया') || lower.includes('dap') || lower.includes('fertilizer')) {
        const plan = toolGetFertilizerPlan('wheat', 3, 'Sitapur');
        fallbackText =
          language === 'hi'
            ? `आपके 3 एकड़ खेत के लिए कुल ${plan.total.dap_bags} बोरी डीएपी और ${plan.total.urea_bags} बोरी यूरिया की आवश्यकता होगी। बुवाई के समय पूरी डीएपी और एक तिहाई यूरिया डालें, बाकी यूरिया पहली और दूसरी सिंचाई पर छिड़कें। डीएपी के साथ कभी भी सीधे जिंक सल्फेट न मिलाएं।`
            : `For your 3 acres, you need ${plan.total.dap_bags} bags of DAP and ${plan.total.urea_bags} bags of Urea. Apply all DAP at sowing and split Urea across irrigations. Never mix Zinc Sulphate directly with DAP.`;
      } else if (lower.includes('मौसम') || lower.includes('पानी') || lower.includes('rain') || lower.includes('weather')) {
        const weather = await toolGetWeather('Sitapur');
        fallbackText = weather.summary;
      } else if (lower.includes('भाव') || lower.includes('मंडी') || lower.includes('rate') || lower.includes('price')) {
        const price = toolGetMandiPrice('wheat');
        fallbackText =
          language === 'hi'
            ? `सीतापुर मंडी में आज गेहूं का औसत भाव ${price.modal} रुपये प्रति क्विंटल है।`
            : `In Sitapur Mandi, the average wheat rate is ${price.modal} rupees per quintal today.`;
      } else {
        fallbackText =
          language === 'hi'
            ? `नमस्ते रमेश जी, मैं आपका किसान सहायक हूँ। आप मुझसे अपनी फसल की खाद, आज के मौसम या मंडी भाव के बारे में पूछ सकते हैं।`
            : `Hello, I am your farming assistant. You can ask me about fertilizer dosages, today's weather, or local market prices.`;
      }

      return NextResponse.json({
        reply: cleanSpokenText(fallbackText),
        language
      });
    }

    // Initialize Gemini with server-side tools
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction,
      tools: [{ functionDeclarations: toolsDeclarations }] as Tool[]
    });

    const chat = model.startChat();
    let response = await chat.sendMessage(message);

    // Tool calling resolution loop (up to 4 steps)
    let call = response.response.functionCalls()?.[0];
    let stepCount = 0;

    while (call && stepCount < 4) {
      stepCount++;
      const toolName = call.name;
      const args = (call.args as any) || {};

      let result: any = null;
      if (toolName === 'get_farmer_profile') {
        result = await toolGetFarmerProfile(args.farmerId || farmerId);
      } else if (toolName === 'get_weather') {
        result = await toolGetWeather(args.district || 'Sitapur');
      } else if (toolName === 'get_fertilizer_plan') {
        result = toolGetFertilizerPlan(args.cropName || 'wheat', Number(args.acres) || 1, args.zone || 'Sitapur');
      } else if (toolName === 'get_mandi_price') {
        result = toolGetMandiPrice(args.cropName || 'wheat');
      }

      response = await chat.sendMessage([
        {
          functionResponse: {
            name: toolName,
            response: result ?? { status: 'completed' }
          }
        }
      ]);

      call = response.response.functionCalls()?.[0];
    }

    const rawReply = response.response.text();
    const spokenReply = cleanSpokenText(rawReply);

    return NextResponse.json({
      reply: spokenReply,
      language
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        reply: 'नमस्ते, सिस्टम में अस्थायी समस्या है लेकिन आप खाद और मौसम की जानकारी कुछ ही देर में ले सकेंगे।',
        error: err?.message || 'Internal server error'
      },
      { status: 200 }
    );
  }
}