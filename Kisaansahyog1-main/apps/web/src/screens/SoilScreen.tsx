import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Droplet,
  FlaskConical,
  Gauge,
  Leaf,
  Sparkles,
  Calendar,
  Layers,
} from "lucide-react";
import {
  getDictionary,
  calculateFertilizerPrescription,
  type SoilTestInput,
} from "@kisaansahyog/shared";
import { useAppStore } from "../store/useAppStore";
import { useFarmerProfileStore } from "../store/useFarmerProfileStore";
import { SurfaceCard } from "../components/stitch/SurfaceCard";
import { StatusBadge } from "../components/stitch/StatusBadge";
import {
  fetchTelemetrySoil,
  FALLBACK_SOIL,
  type TelemetrySoilData,
} from "../api/apiClient";

export default function SoilScreen() {
  const language = useAppStore((state) => state.language);
  const dictionary = getDictionary(language);

  const farmerProfile = useFarmerProfileStore((state) => state.profile);
  const toggleProfileDrawer = useFarmerProfileStore((state) => state.toggleProfileDrawer);

  const [soil, setSoil] = useState<TelemetrySoilData>(FALLBACK_SOIL);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedAcres, setSelectedAcres] = useState<number>(farmerProfile.landAcres || 3.0);
  const [activeScheduleStage, setActiveScheduleStage] = useState<number>(1); // Default to CRI stage

  // Synchronize when farmerProfile changes
  useEffect(() => {
    if (farmerProfile.landAcres) {
      setSelectedAcres(farmerProfile.landAcres);
    }
  }, [farmerProfile.landAcres]);

  useEffect(() => {
    let isMounted = true;
    async function loadSoilTelemetry() {
      try {
        const res = await fetchTelemetrySoil();
        if (isMounted) {
          if (res.data) setSoil(res.data);
          setLoading(false);
        }
      } catch (err) {
        console.warn("[SoilScreen] Telemetry fetch error:", err);
        if (isMounted) setLoading(false);
      }
    }

    loadSoilTelemetry();
    return () => {
      isMounted = false;
    };
  }, []);

  // Scientific calculation from agronomy engine
  const prescription = useMemo(() => {
    const input: SoilTestInput = {
      nitrogenStatus: "low",
      phosphorusStatus: "low",
      potassiumStatus: "medium",
      ph: farmerProfile.soilPh || soil.pH || 7.2,
      organicCarbonPercent: soil.organicCarbonPercent || 0.48,
    };
    return calculateFertilizerPrescription(
      input,
      farmerProfile.activeCrop || "Wheat HD-2967",
      selectedAcres
    );
  }, [soil, selectedAcres, farmerProfile.soilPh, farmerProfile.activeCrop]);

  const currentMoisture = farmerProfile.soilMoisturePct || soil.moisturePercent;
  const currentPh = farmerProfile.soilPh || soil.pH;

  const dials = [
    {
      label: "Soil Moisture",
      labelHi: "मिट्टी की नमी",
      value: currentMoisture,
      unit: "%",
      icon: Droplet,
      tone: "leaf" as const,
      status: `${currentMoisture}% (${currentMoisture < 25 ? "Low/Dry" : currentMoisture > 45 ? "Wet" : "Optimal"})`,
      statusHi: `${currentMoisture}% (${currentMoisture < 25 ? "कम/सूखी" : currentMoisture > 45 ? "अधिक नमी" : "अनुकूल"})`,
      maxScale: 60,
    },
    {
      label: "Soil pH",
      labelHi: "पीएच मान",
      value: currentPh,
      unit: "",
      icon: FlaskConical,
      tone: "leaf" as const,
      status: `${currentPh.toFixed(1)} (${currentPh < 6.5 ? "Acidic" : currentPh > 7.5 ? "Alkaline" : "Neutral / Ideal"})`,
      statusHi: `${currentPh.toFixed(1)} (${currentPh < 6.5 ? "अम्लीय" : currentPh > 7.5 ? "क्षारीय" : "उदासीन / आदर्श"})`,
      maxScale: 14,
    },
    {
      label: "Available Nitrogen (N)",
      labelHi: "नाइट्रोजन (N)",
      value: soil.nitrogenKgHa,
      unit: "kg/ha",
      icon: Activity,
      tone: "gold" as const,
      status: "210 kg/ha (Low)",
      statusHi: "210 किग्रा/हे (कम)",
      maxScale: 400,
    },
    {
      label: "Available Phosphorus (P)",
      labelHi: "फास्फोरस (P)",
      value: soil.phosphorusKgHa,
      unit: "kg/ha",
      icon: Activity,
      tone: "gold" as const,
      status: "14 kg/ha (Low)",
      statusHi: "14 किग्रा/हे (कम)",
      maxScale: 50,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-soil-text">
              {dictionary.screens.soil}
            </h1>
            <button
              type="button"
              onClick={toggleProfileDrawer}
              className="text-[10px] font-bold text-leaf-deep underline hover:text-leaf-green"
              title={language === "hi" ? "मृदा व खेत सेटिंग्स संपादित करें" : "Edit Soil & Farm Settings"}
            >
              ({language === "hi" ? "संपादित करें" : "Edit"})
            </button>
          </div>
          <p className="text-xs text-soil-brown">
            📍 {farmerProfile.district}, {farmerProfile.state} • {farmerProfile.soilType}
          </p>
        </div>
        <StatusBadge tone="leaf">
          {`${farmerProfile.district} Benchmark`}
        </StatusBadge>
      </div>

      {/* 4 Gauge Dials */}
      <div className="grid grid-cols-2 gap-3">
        {dials.map((gauge) => {
          const percent = Math.min(
            100,
            Math.round((Number(gauge.value) / gauge.maxScale) * 100),
          );
          return (
            <SurfaceCard key={gauge.label} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <gauge.icon size={16} className="text-leaf-green" />
                  <p className="text-xs font-semibold truncate max-w-[100px]">
                    {language === "hi" ? gauge.labelHi : gauge.label}
                  </p>
                </div>
                <StatusBadge tone={gauge.tone}>
                  {language === "hi" ? gauge.statusHi : gauge.status}
                </StatusBadge>
              </div>
              <div className="mt-3 flex items-end justify-between">
                <p className="text-2xl font-extrabold text-soil-text">
                  {gauge.value}
                  {gauge.unit && (
                    <span className="ml-1 text-xs font-normal text-soil-brown">
                      {gauge.unit}
                    </span>
                  )}
                </p>
                <Gauge size={22} className="text-cream-border" />
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-cream-bg">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    gauge.tone === "leaf" ? "bg-leaf-green" : "bg-harvest-gold"
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </SurfaceCard>
          );
        })}
      </div>

      {/* Interactive Agronomic Fertilizer Prescription Engine */}
      <SurfaceCard className="border border-leaf-green/20">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-leaf-green" />
              <h2 className="text-base font-bold text-soil-text">
                Scientific Fertilizer Prescription (उर्वरक नुस्खा)
              </h2>
            </div>
            <p className="text-xs text-soil-brown mt-0.5">
              Balanced ICAR/KVK dose for Wheat HD-2967
            </p>
          </div>
          {/* Acreage Selector */}
          <div className="flex items-center gap-1 bg-cream-bg rounded-xl p-1 border border-cream-border">
            {[1.0, 3.0, 5.0].map((acres) => (
              <button
                key={acres}
                onClick={() => setSelectedAcres(acres)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  selectedAcres === acres
                    ? "bg-leaf-green text-cream-card shadow-sm"
                    : "text-soil-brown hover:text-soil-text"
                }`}
              >
                {acres} {language === "hi" ? "एकड़" : "Acres"}
              </button>
            ))}
          </div>
        </div>

        {/* 5 Total Calculated Nutrients */}
        <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 gap-2">
          <div className="rounded-2xl bg-cream-bg p-2.5 text-center border border-cream-border/60">
            <p className="text-[10px] font-semibold text-soil-brown">DAP (50kg)</p>
            <p className="text-lg font-black text-leaf-deep mt-0.5">
              {prescription.totalDapBags}
            </p>
            <span className="text-[9px] text-soil-brown">
              {language === "hi" ? "बोरी" : "Bags"}
            </span>
          </div>
          <div className="rounded-2xl bg-cream-bg p-2.5 text-center border border-cream-border/60">
            <p className="text-[10px] font-semibold text-soil-brown">Urea (45kg)</p>
            <p className="text-lg font-black text-leaf-deep mt-0.5">
              {prescription.totalUreaBags}
            </p>
            <span className="text-[9px] text-soil-brown">
              {language === "hi" ? "बोरी" : "Bags"}
            </span>
          </div>
          <div className="rounded-2xl bg-cream-bg p-2.5 text-center border border-cream-border/60">
            <p className="text-[10px] font-semibold text-soil-brown">MOP Potash</p>
            <p className="text-lg font-black text-leaf-deep mt-0.5">
              {prescription.totalMopBags}
            </p>
            <span className="text-[9px] text-soil-brown">
              {language === "hi" ? "बोरी" : "Bags"}
            </span>
          </div>
          <div className="rounded-2xl bg-cream-bg p-2.5 text-center border border-cream-border/60">
            <p className="text-[10px] font-semibold text-soil-brown">Zinc 21%</p>
            <p className="text-lg font-black text-harvest-gold mt-0.5">
              {prescription.zincSulphateKg}
            </p>
            <span className="text-[9px] text-soil-brown">kg</span>
          </div>
          <div className="rounded-2xl bg-cream-bg p-2.5 text-center border border-cream-border/60 col-span-2 sm:col-span-1">
            <p className="text-[10px] font-semibold text-soil-brown">FYM Compost</p>
            <p className="text-lg font-black text-soil-brown mt-0.5">
              {prescription.organicCompostQuintals}
            </p>
            <span className="text-[9px] text-soil-brown">
              {language === "hi" ? "क्विंटल" : "Quintals"}
            </span>
          </div>
        </div>

        {/* Application Stage Tabs */}
        <div className="mt-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Calendar size={15} className="text-leaf-green" />
            <h3 className="text-xs font-bold text-soil-text">
              Application Schedule (खाद डालने का सही समय)
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-1 bg-cream-bg p-1 rounded-xl">
            {prescription.applicationSchedule.map((item, idx) => (
              <button
                key={item.stage}
                onClick={() => setActiveScheduleStage(idx)}
                className={`py-1.5 px-2 text-[11px] font-semibold rounded-lg transition-all text-center truncate ${
                  activeScheduleStage === idx
                    ? "bg-leaf-soft text-leaf-deep border border-leaf-deep/20 font-bold"
                    : "text-soil-brown hover:text-soil-text"
                }`}
              >
                {language === "hi" ? item.stageHi.split(" ")[0] : item.stage.split(" ")[0]}
              </button>
            ))}
          </div>

          {/* Active Schedule Details */}
          {prescription.applicationSchedule[activeScheduleStage] && (
            <div className="mt-3 rounded-2xl bg-cream-bg/80 border border-cream-border p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-leaf-deep">
                  {language === "hi"
                    ? prescription.applicationSchedule[activeScheduleStage]?.stageHi
                    : prescription.applicationSchedule[activeScheduleStage]?.stage}
                </span>
                <span className="text-[10px] bg-cream-tan/60 px-2 py-0.5 rounded-full text-soil-brown">
                  {prescription.applicationSchedule[activeScheduleStage]?.timing}
                </span>
              </div>

              {/* Quantities for this stage */}
              <div className="flex flex-wrap gap-2 text-xs font-semibold text-soil-text py-1">
                {prescription.applicationSchedule[activeScheduleStage]?.dapBags ? (
                  <span className="bg-leaf-soft px-2.5 py-1 rounded-xl text-leaf-deep">
                    DAP: {prescription.applicationSchedule[activeScheduleStage]?.dapBags} {language === "hi" ? "बोरी" : "Bags"}
                  </span>
                ) : null}
                {prescription.applicationSchedule[activeScheduleStage]?.ureaBags ? (
                  <span className="bg-leaf-soft px-2.5 py-1 rounded-xl text-leaf-deep">
                    Urea: {prescription.applicationSchedule[activeScheduleStage]?.ureaBags} {language === "hi" ? "बोरी" : "Bags"}
                  </span>
                ) : null}
                {prescription.applicationSchedule[activeScheduleStage]?.mopBags ? (
                  <span className="bg-leaf-soft px-2.5 py-1 rounded-xl text-leaf-deep">
                    MOP: {prescription.applicationSchedule[activeScheduleStage]?.mopBags} {language === "hi" ? "बोरी" : "Bags"}
                  </span>
                ) : null}
                {prescription.applicationSchedule[activeScheduleStage]?.zincKg ? (
                  <span className="bg-harvest-gold/15 px-2.5 py-1 rounded-xl text-soil-deep">
                    Zinc: {prescription.applicationSchedule[activeScheduleStage]?.zincKg} kg
                  </span>
                ) : null}
              </div>

              <p className="text-xs text-soil-brown leading-relaxed">
                {language === "hi"
                  ? prescription.applicationSchedule[activeScheduleStage]?.instructionsHi
                  : prescription.applicationSchedule[activeScheduleStage]?.instructions}
              </p>
            </div>
          )}
        </div>
      </SurfaceCard>

      {/* Soil Health Card Detailed Parameters */}
      <SurfaceCard>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold">Soil Health Card (मृदा स्वास्थ्य कार्ड)</h2>
            <p className="text-xs text-soil-brown">
              Soil Type: {soil.soilType} • {loading ? "Updating..." : "Alluvial Loam Basin"}
            </p>
          </div>
          <Leaf size={18} className="text-leaf-green" />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          {[
            {
              key: "Organic Carbon (जैविक कार्बन)",
              value: `${soil.organicCarbonPercent}%`,
              status: soil.organicCarbonStatus,
            },
            {
              key: "Available N (उपलब्ध नाइट्रोजन)",
              value: `${soil.nitrogenKgHa} kg/ha`,
              status: soil.nitrogenStatus,
            },
            {
              key: "Available P (उपलब्ध फास्फोरस)",
              value: `${soil.phosphorusKgHa} kg/ha`,
              status: soil.phosphorusStatus,
            },
            {
              key: "Available K (उपलब्ध पोटाश)",
              value: `${soil.potassiumKgHa} kg/ha`,
              status: soil.potassiumStatus,
            },
            {
              key: "EC (विद्युत चालकता)",
              value: `${soil.electricalConductivity} dS/m`,
              status: "Normal",
            },
            {
              key: "Zinc / Zn (जिंक स्तर)",
              value: `${soil.zincPpm} ppm`,
              status: "Marginal Deficit",
            },
          ].map((item) => (
            <div
              key={item.key}
              className="flex min-h-[50px] flex-col justify-center rounded-2xl bg-cream-bg px-3 py-1.5"
            >
              <p className="text-[11px] text-soil-brown truncate">{item.key}</p>
              <div className="flex items-baseline justify-between">
                <p className="text-sm font-bold text-soil-text">{item.value}</p>
                <span className="text-[9px] text-leaf-deep font-medium">
                  {item.status.split(" ")[0]}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Soil Health Card Recommendations */}
        <div className="mt-4 rounded-2xl bg-leaf-soft/60 border border-leaf-deep/15 p-3.5">
          <div className="flex items-center gap-1.5 text-leaf-deep mb-2">
            <Layers size={16} />
            <h3 className="text-xs font-bold uppercase tracking-wider">
              Agronomic Soil Recommendations (कृषि वैज्ञानिक अनुशंसाएं)
            </h3>
          </div>
          <ul className="space-y-1.5 text-xs text-soil-brown leading-relaxed list-disc list-inside">
            {(language === "hi" ? prescription.notesHi : prescription.notes).map((note, i) => (
              <li key={i}>{note}</li>
            ))}
          </ul>
        </div>
      </SurfaceCard>
    </div>
  );
}
