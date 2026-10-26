// ============================================================================
// Phase 6: Pure Agronomic Engine & Interactive Prescriptions
// Scientific calculations for fertilizer recommendations, crop phenology,
// critical stages, and farm economics based on ICAR / KVK guidelines.
// ============================================================================

export interface SoilTestInput {
  nitrogenStatus: 'low' | 'medium' | 'high';
  phosphorusStatus: 'low' | 'medium' | 'high';
  potassiumStatus: 'low' | 'medium' | 'high';
  ph: number;
  organicCarbonPercent: number;
}

export interface ApplicationScheduleItem {
  stage: string;
  stageHi: string;
  timing: string;
  dapBags: number;
  ureaBags: number;
  mopBags: number;
  zincKg: number;
  instructions: string;
  instructionsHi: string;
}

export interface FertilizerPrescription {
  totalDapBags: number;       // 50kg bags
  totalUreaBags: number;      // 45kg bags
  totalMopBags: number;       // 50kg bags
  zincSulphateKg: number;     // kg
  organicCompostQuintals: number;
  applicationSchedule: ApplicationScheduleItem[];
  notes: string[];
  notesHi: string[];
}

export interface CropTimelineStage {
  stageName: string;
  stageNameHi: string;
  dayRange: [number, number];
  completed: boolean;
  current: boolean;
}

export interface CropStageInfo {
  currentStage: string;
  currentStageHi: string;
  daysSinceSowing: number;
  totalDurationDays: number;
  stageProgressPercent: number;
  isCriticalStage: boolean;
  waterRequirement: 'high' | 'medium' | 'low';
  criticalAction: string;
  criticalActionHi: string;
  timeline: CropTimelineStage[];
}

export interface CropEconomics {
  totalEstimatedYieldQuintals: number;
  grossRevenue: number;
  totalInputCost: number;
  netProfit: number;
  costPerQuintal: number;
  mspBenchmark: number;
  profitMarginPercent: number;
}

// ----------------------------------------------------------------------------
// 1. Fertilizer Prescription Calculator (calculateFertilizerPrescription)
// ----------------------------------------------------------------------------
/**
 * Calculates scientifically balanced fertilizer requirements based on soil test
 * inputs, target crop, and land acreage according to ICAR package of practices.
 */
export function calculateFertilizerPrescription(
  soil: SoilTestInput,
  cropName: string = 'Wheat',
  landAcres: number = 3.0,
): FertilizerPrescription {
  const acres = Math.max(0.1, Number(landAcres) || 1.0);

  // Base recommendation for irrigated Wheat (HD-2967) per acre:
  // Recommended NPK: ~50 kg N, 25 kg P2O5, 17 kg K2O per acre.
  // DAP (18% N, 46% P2O5): 1 bag (50kg) gives 9kg N and 23kg P2O5.
  // Urea (46% N): 1 bag (45kg) gives 20.7kg N.
  // MOP (60% K2O): 1 bag (50kg) gives 30kg K2O.

  // 1. Phosphorus / DAP adjustment
  let dapBagsPerAcre = 1.0;
  if (soil.phosphorusStatus === 'low') {
    dapBagsPerAcre = 1.25; // 25% increase for low phosphorus soils
  } else if (soil.phosphorusStatus === 'high') {
    dapBagsPerAcre = 0.75;
  }

  // 2. Potassium / MOP adjustment
  let mopBagsPerAcre = 0.4; // ~20kg MOP per acre
  if (soil.potassiumStatus === 'low') {
    mopBagsPerAcre = 0.6;
  } else if (soil.potassiumStatus === 'high') {
    mopBagsPerAcre = 0.2;
  }

  // 3. Nitrogen / Urea adjustment
  // Nitrogen supplied by DAP = dapBagsPerAcre * 50 * 0.18 = ~9-11.25 kg N
  // Remaining N needed = ~40 kg N -> ~2 bags of Urea (45kg each = ~41.4 kg N)
  let ureaBagsPerAcre = 2.2;
  if (soil.nitrogenStatus === 'low') {
    ureaBagsPerAcre = 2.6; // extra split dose for nitrogen-deficient soil
  } else if (soil.nitrogenStatus === 'high') {
    ureaBagsPerAcre = 1.8;
  }

  // 4. Zinc Sulphate (21% heptahydrate)
  // Low organic carbon or neutral/alkaline pH (>=7.2) binds zinc -> 25 kg/acre
  let zincKgPerAcre = 20;
  if (soil.ph >= 7.2 || soil.organicCarbonPercent < 0.5) {
    zincKgPerAcre = 25;
  }

  // 5. Farmyard Manure / Organic Compost
  // If organic carbon < 0.5%, deficit condition -> 15-20 quintals per acre
  let compostQuintalsPerAcre = 15;
  if (soil.organicCarbonPercent < 0.4) {
    compostQuintalsPerAcre = 25;
  } else if (soil.organicCarbonPercent >= 0.75) {
    compostQuintalsPerAcre = 8;
  }

  // Total amounts rounded to clean practical quantities
  const totalDapBags = Math.round(dapBagsPerAcre * acres * 10) / 10;
  const totalUreaBags = Math.round(ureaBagsPerAcre * acres * 10) / 10;
  const totalMopBags = Math.round(mopBagsPerAcre * acres * 10) / 10;
  const zincSulphateKg = Math.round(zincKgPerAcre * acres);
  const organicCompostQuintals = Math.round(compostQuintalsPerAcre * acres);

  // Application split:
  // Basal: 100% DAP + 100% MOP + 100% Zinc + 1/3rd Urea
  // CRI (21-25 days): 1/3rd Urea (top-dress under moist conditions)
  // Tillering (40-45 days): 1/3rd Urea (top-dress prior to 2nd irrigation)
  const basalUrea = Math.round((totalUreaBags / 3) * 10) / 10;
  const criUrea = Math.round((totalUreaBags / 3) * 10) / 10;
  const tilleringUrea = Math.round((totalUreaBags - basalUrea - criUrea) * 10) / 10;

  const applicationSchedule: ApplicationScheduleItem[] = [
    {
      stage: 'Basal Application (Sowing)',
      stageHi: 'बुवाई के समय (आधार खाद)',
      timing: 'Day 0 • At final ploughing / sowing furrow placement',
      dapBags: totalDapBags,
      ureaBags: basalUrea,
      mopBags: totalMopBags,
      zincKg: zincSulphateKg,
      instructions:
        'Drill full DAP, MOP, and Zinc 3-5 cm below the seed line. Do not mix Zinc directly with DAP in the seed drill.',
      instructionsHi:
        'डीएपी, पोटाश (MOP) और जिंक सल्फेट को बीज से 3-5 सेमी नीचे डालें। जिंक को कभी सीधे डीएपी के साथ मिलाकर न रखें।',
    },
    {
      stage: 'CRI Stage (First Irrigation)',
      stageHi: 'CRI अवस्था (प्रथम सिंचाई)',
      timing: 'Day 21 - 25 • Just before or immediate after 1st watering',
      dapBags: 0,
      ureaBags: criUrea,
      mopBags: 0,
      zincKg: 0,
      instructions:
        'Broadcast 1st split of Urea when soil is moist or immediately prior to light irrigation. Promotes crown root emergence.',
      instructionsHi:
        'खेत में ओट (हल्की नमी) आने पर यूरिया की पहली टॉप-ड्रेसिंग करें। इससे जड़ों का तेज और गहरा विकास होता है।',
    },
    {
      stage: 'Tillering Stage (Second Irrigation)',
      stageHi: 'कल्ले फूटने की अवस्था (द्वितीय सिंचाई)',
      timing: 'Day 40 - 45 • Active vegetative branching',
      dapBags: 0,
      ureaBags: tilleringUrea,
      mopBags: 0,
      zincKg: 0,
      instructions:
        'Broadcast remaining Urea balance. Maximizes productive tillers and ear-head size.',
      instructionsHi:
        'यूरिया की अंतिम किस्त का छिड़काव करें। इससे प्रति पौधा अधिक और मजबूत कल्ले बनते हैं।',
    },
  ];

  const notes = [
    `Prescription customized for ${cropName} across ${acres} acre(s) under Alluvial Loam conditions.`,
    'Never mix Zinc Sulphate directly with DAP in the hopper; phosphatic fertilizer forms insoluble Zinc Phosphate.',
    'Apply urea in split doses to avoid leaching and volatilization losses in neutral/alkaline soil (pH 7.2).',
    'Adding organic compost / FYM improves soil microbial active carbon and cation exchange capacity.',
  ];

  const notesHi = [
    `यह अनुशंसा ${acres} एकड़ ${cropName} की फसल और सीतापुर की दोमट मिट्टी के लिए वैज्ञानिक रूप से तैयार की गई है।`,
    'जिंक सल्फेट और डीएपी को कभी मिलाकर न रखें; इससे जिंक फास्फेट बन जाता है जो पौधों को नहीं मिल पाता।',
    'यूरिया को दो से तीन बार में दें ताकि लीचिंग और वाष्पीकरण से होने वाले नुकसान से बचा जा सके।',
    'गोबर की सड़ी खाद या वर्मीकम्पोस्ट डालने से मिट्टी में जैविक कार्बन और जल धारण क्षमता बढ़ती है।',
  ];

  return {
    totalDapBags,
    totalUreaBags,
    totalMopBags,
    zincSulphateKg,
    organicCompostQuintals,
    applicationSchedule,
    notes,
    notesHi,
  };
}

// ----------------------------------------------------------------------------
// 2. Crop Stage & Phenology Engine (calculateCropStageInfo)
// ----------------------------------------------------------------------------
const WHEAT_STAGES: {
  name: string;
  nameHi: string;
  dayRange: [number, number];
  isCritical: boolean;
  waterReq: 'high' | 'medium' | 'low';
  action: string;
  actionHi: string;
}[] = [
  {
    name: 'Germination & Seedling',
    nameHi: 'अंकुरण व शुरुआती पौध',
    dayRange: [0, 20],
    isCritical: false,
    waterReq: 'medium',
    action: 'Monitor seedling emergence and guard against early shoot fly or moisture stress.',
    actionHi: 'अंकुरण का निरीक्षण करें और कीटों से बचाव सुनिश्चित करें।',
  },
  {
    name: 'Crown Root Initiation (CRI)',
    nameHi: 'प्रथम जड़ फुटाव (CRI)',
    dayRange: [21, 35],
    isCritical: true,
    waterReq: 'high',
    action: 'Mandatory 1st irrigation + 1st Urea top-dressing. Missing water at CRI cuts yield by 20-30%.',
    actionHi: 'अति-महत्वपूर्ण अवस्था: प्रथम सिंचाई और यूरिया की पहली टॉप-ड्रेसिंग तत्काल पूरी करें।',
  },
  {
    name: 'Tillering Stage',
    nameHi: 'कल्ले फूटने की अवस्था',
    dayRange: [36, 60],
    isCritical: false,
    waterReq: 'medium',
    action: 'Weed control (broadleaf & grassy weeds) + 2nd Urea split dose.',
    actionHi: 'खरपतवार नियंत्रण और यूरिया की अंतिम टॉप-ड्रेसिंग करें।',
  },
  {
    name: 'Jointing & Booting',
    nameHi: 'गाभा अवस्था व बाली निर्माण',
    dayRange: [61, 85],
    isCritical: true,
    waterReq: 'high',
    action: '2nd critical irrigation. Check for yellow rust pustules on lower leaves.',
    actionHi: 'द्वितीय महत्वपूर्ण सिंचाई करें। पीला रतुआ (येलो रस्ट) के लक्षणों की जांच करें।',
  },
  {
    name: 'Flowering & Anthesis',
    nameHi: 'फूल आने की अवस्था (एंथेसिस)',
    dayRange: [86, 105],
    isCritical: true,
    waterReq: 'high',
    action: 'Maintain adequate moisture; avoid spray treatments during peak pollination hours.',
    actionHi: 'फूल खिलने के समय खेत में नमी बनाए रखें; परागण के समय कीटनाशक छिड़काव से बचें।',
  },
  {
    name: 'Milk & Dough (Grain Filling)',
    nameHi: 'दुग्धावस्था व दाना भराव',
    dayRange: [106, 125],
    isCritical: false,
    waterReq: 'medium',
    action: 'Light irrigation if westerly winds rise. Protect against lodging and terminal heat stress.',
    actionHi: 'पछुवा हवा चलने पर हल्की सिंचाई करें। फसल को गिरने से बचाएं।',
  },
  {
    name: 'Maturity & Harvest',
    nameHi: 'परिपक्वता व कटाई',
    dayRange: [126, 140],
    isCritical: false,
    waterReq: 'low',
    action: 'Withhold water. Harvest when grain moisture drops below 12-14%.',
    actionHi: 'सिंचाई बंद करें। दाने में नमी 12-14% रहने पर कंबाइन/रीपर से कटाई करें।',
  },
];

export function calculateCropStageInfo(
  _cropName: string = 'Wheat',
  daysSinceSowing: number = 28,
): CropStageInfo {
  const safeDays = Math.max(0, Math.min(180, daysSinceSowing));
  const totalDurationDays = 140;

  let currentStageItem = WHEAT_STAGES[1]!; // Default to CRI
  for (const stage of WHEAT_STAGES) {
    if (safeDays >= stage.dayRange[0] && safeDays <= stage.dayRange[1]) {
      currentStageItem = stage;
      break;
    }
  }

  // Build timeline
  const timeline: CropTimelineStage[] = WHEAT_STAGES.map((s) => ({
    stageName: s.name,
    stageNameHi: s.nameHi,
    dayRange: s.dayRange,
    completed: safeDays > s.dayRange[1],
    current: safeDays >= s.dayRange[0] && safeDays <= s.dayRange[1],
  }));

  const progressPercent = Math.min(
    100,
    Math.round((safeDays / totalDurationDays) * 100),
  );

  return {
    currentStage: currentStageItem.name,
    currentStageHi: currentStageItem.nameHi,
    daysSinceSowing: safeDays,
    totalDurationDays,
    stageProgressPercent: progressPercent,
    isCriticalStage: currentStageItem.isCritical,
    waterRequirement: currentStageItem.waterReq,
    criticalAction: currentStageItem.action,
    criticalActionHi: currentStageItem.actionHi,
    timeline,
  };
}

// ----------------------------------------------------------------------------
// 3. Farm Economics & Gross Margin Engine (calculateCropEconomics)
// ----------------------------------------------------------------------------
/**
 * Computes estimated crop yield, total costs (seeds, nutrients, diesel irrigation,
 * labour, mechanization), gross revenue at mandi rate, and net farm profit.
 */
export function calculateCropEconomics(
  _cropName: string = 'Wheat',
  landAcres: number = 3.0,
  expectedYieldPerAcre: number = 19.5, // quintals per acre
  sellingRatePerQuintal: number = 2450, // ₹ per quintal
): CropEconomics {
  const acres = Math.max(0.1, Number(landAcres) || 1.0);
  const totalEstimatedYieldQuintals =
    Math.round(expectedYieldPerAcre * acres * 10) / 10;
  const grossRevenue = Math.round(totalEstimatedYieldQuintals * sellingRatePerQuintal);

  // Input costs breakdown per acre for Wheat in Uttar Pradesh:
  // - Certified seed (HD-2967, 40kg @ ₹42/kg) = ₹1,680
  // - Land preparation (2 disc ploughing + rotavator) = ₹2,400
  // - Fertilizers (1.25 bags DAP @ ₹1,350 + 2.5 bags Urea @ ₹270 + Zinc ₹1,100) = ₹3,462
  // - Irrigations (4 diesel irrigations @ ₹1,100 each) = ₹4,400
  // - Weedicide + Micronutrient spray = ₹1,200
  // - Combine harvesting & bagging = ₹2,200
  // Average total input cost per acre = ~₹15,342
  const costPerAcre = 15340;
  const totalInputCost = Math.round(costPerAcre * acres);

  const netProfit = grossRevenue - totalInputCost;
  const costPerQuintal =
    totalEstimatedYieldQuintals > 0
      ? Math.round(totalInputCost / totalEstimatedYieldQuintals)
      : 0;

  const mspBenchmark = 2275; // Official Rabi MSP for Wheat 2024-25 / 2025-26
  const profitMarginPercent =
    totalInputCost > 0 ? Math.round((netProfit / totalInputCost) * 100) : 0;

  return {
    totalEstimatedYieldQuintals,
    grossRevenue,
    totalInputCost,
    netProfit,
    costPerQuintal,
    mspBenchmark,
    profitMarginPercent,
  };
}
