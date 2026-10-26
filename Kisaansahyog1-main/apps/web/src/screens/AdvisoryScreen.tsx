import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CloudDrizzle,
  CloudRain,
  Droplets,
  Flower2,
  Leaf,
  Mic,
  Sprout,
  ThermometerSun,
  Volume2,
  Wind,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Coins,
  ShieldCheck,
  Bug,
  ShieldAlert,
} from "lucide-react";
import {
  getDictionary,
  calculateCropStageInfo,
  calculateCropEconomics,
} from "@kisaansahyog/shared";
import { useAppStore } from "../store/useAppStore";
import { useSimulationStore } from "../store/useSimulationStore";
import { useVoiceStore } from "../store/useVoiceStore";
import { useFarmerProfileStore } from "../store/useFarmerProfileStore";
import { SurfaceCard } from "../components/stitch/SurfaceCard";
import { StatusBadge } from "../components/stitch/StatusBadge";
import {
  fetchTelemetryWeather,
  fetchTelemetryAdvisory,
  FALLBACK_WEATHER,
  FALLBACK_ADVISORY,
  type TelemetryWeatherData,
  type TelemetryAdvisoryData,
} from "../api/apiClient";

const tasks = [
  {
    id: "irrigation",
    title: "CRI Irrigation assessment",
    subtitle: "Check soil moisture & rain probability",
    time: "06:30 AM",
    priority: "high",
  },
  {
    id: "fertilizer",
    title: "Urea split top-dress",
    subtitle: "1st dose (45 kg/acre) after CRI moisture",
    time: "10:00 AM",
    priority: "high",
  },
  {
    id: "scout",
    title: "Weed & Termite scouting",
    subtitle: "Inspect crown root rootzone (Block A)",
    time: "03:30 PM",
    priority: "medium",
  },
];

const alternatives = [
  { crop: "Mustard (Pusa Bold)", reason: "Lower water need, higher mandi modal rate", roi: "+18%" },
  { crop: "Chana (Desi)", reason: "Nitrogen-fixing, resilient to winter drought", roi: "+14%" },
];

export default function AdvisoryScreen() {
  const language = useAppStore((state) => state.language);
  const is2GMode = useAppStore((state) => state.is2GMode);
  const openVoiceModal = useVoiceStore((state) => state.openVoiceModal);
  const dictionary = getDictionary(language);

  // Simulation Sandbox State
  const isIrrigationPostponed = useSimulationStore((state) => state.isIrrigationPostponed);
  const pestAlertActive = useSimulationStore((state) => state.pestAlertActive);
  const simulatedRainProb = useSimulationStore((state) => state.simulatedRainProb);
  const simulatedSavings = useSimulationStore((state) => state.simulatedSavings);

  const [weather, setWeather] = useState<TelemetryWeatherData>(FALLBACK_WEATHER);
  const [advisory, setAdvisory] = useState<TelemetryAdvisoryData>(FALLBACK_ADVISORY);
  const [loading, setLoading] = useState<boolean>(true);

  // Farmer Profile & Live GPS Telemetry
  const farmerProfile = useFarmerProfileStore((state) => state.profile);
  const getDaysSinceSowing = useFarmerProfileStore((state) => state.getDaysSinceSowing);
  const toggleProfileDrawer = useFarmerProfileStore((state) => state.toggleProfileDrawer);

  const daysSinceSowing = getDaysSinceSowing();
  const cropBase = useMemo(() => {
    const cropStr = (farmerProfile.activeCrop || "").toLowerCase();
    if (cropStr.includes("mustard") || cropStr.includes("सरसों")) return "Mustard";
    if (cropStr.includes("chana") || cropStr.includes("चना")) return "Chana";
    if (cropStr.includes("basmati") || cropStr.includes("बासमती")) return "Basmati";
    if (cropStr.includes("maize") || cropStr.includes("मक्का")) return "Maize";
    return "Wheat";
  }, [farmerProfile.activeCrop]);

  // Pure Agronomic Engine Calculations
  const stageInfo = useMemo(() => {
    return calculateCropStageInfo(cropBase, daysSinceSowing);
  }, [cropBase, daysSinceSowing]);

  const economics = useMemo(() => {
    const yieldPerAcre =
      cropBase === "Mustard"
        ? 9.0
        : cropBase === "Chana"
        ? 8.5
        : cropBase === "Basmati"
        ? 16.0
        : cropBase === "Maize"
        ? 22.0
        : 19.5;
    const rate =
      cropBase === "Mustard"
        ? 5400
        : cropBase === "Chana"
        ? 5350
        : cropBase === "Basmati"
        ? 3600
        : cropBase === "Maize"
        ? 2100
        : 2450;
    return calculateCropEconomics(cropBase, farmerProfile.landAcres, yieldPerAcre, rate);
  }, [cropBase, farmerProfile.landAcres]);

  useEffect(() => {
    let isMounted = true;
    async function loadTelemetry() {
      try {
        setLoading(true);
        const [weatherRes, advisoryRes] = await Promise.all([
          fetchTelemetryWeather(
            farmerProfile.lat,
            farmerProfile.lon,
            `${farmerProfile.district}, ${farmerProfile.state}`
          ),
          fetchTelemetryAdvisory(daysSinceSowing),
        ]);
        if (isMounted) {
          if (weatherRes.data) setWeather(weatherRes.data);
          if (advisoryRes.data) setAdvisory(advisoryRes.data);
          setLoading(false);
        }
      } catch (err) {
        console.warn("[AdvisoryScreen] Error fetching telemetry:", err);
        if (isMounted) setLoading(false);
      }
    }

    loadTelemetry();
    return () => {
      isMounted = false;
    };
  }, [
    farmerProfile.lat,
    farmerProfile.lon,
    farmerProfile.district,
    farmerProfile.state,
    daysSinceSowing,
  ]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return dictionary.greetings.morning;
    if (hour < 17) return dictionary.greetings.afternoon;
    return dictionary.greetings.evening;
  }, [dictionary]);

  // Use simulation rain probability if postponed scenario is active
  const effectiveRainProb = isIrrigationPostponed
    ? simulatedRainProb
    : weather.rainProbability;

  const weatherLabel = isIrrigationPostponed
    ? language === "hi"
      ? "भारी बारिश का पूर्वानुमान (85%)"
      : "Heavy Rain Forecast (85%)"
    : language === "hi"
      ? weather.conditionHi || weather.condition
      : weather.condition;

  return (
    <div className="space-y-4">
      {/* Top Greeting & Voice Assistant Button */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-soil-brown">{greeting}</p>
          <h1 className="text-xl font-extrabold text-soil-text">
            {dictionary.screens.advisory}
          </h1>
        </div>
        <button
          onClick={openVoiceModal}
          className="flex min-h-[48px] items-center gap-1.5 rounded-full bg-leaf-green px-4 text-sm font-semibold text-cream-card shadow-sm active:scale-95 transition-transform"
        >
          <Mic size={18} /> {dictionary.common.voiceAssistant}
        </button>
      </div>

      {/* SIMULATION TRIGGER ALERT 1: Heavy Rain & Irrigation Postponed */}
      {isIrrigationPostponed && (
        <div className="rounded-2xl bg-amber-500/15 border-2 border-amber-500/50 p-4 text-amber-950 shadow-md animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-200 text-amber-900 shrink-0">
              <CloudRain size={24} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-amber-200 px-2.5 py-0.5 text-[10px] font-black uppercase text-amber-900">
                  {language === "hi" ? "मौसम अलर्ट (Rain Forecast)" : "Weather Alert"}
                </span>
                <span className="text-xs font-black text-amber-900">85% वर्षा संभावना</span>
              </div>
              <p className="mt-1.5 text-sm font-bold text-amber-950 leading-snug">
                {language === "hi"
                  ? "🌧️ मौसम अलर्ट: अगले 48 घंटों में भारी वर्षा का अनुमान। प्रथम CRI सिंचाई 2 दिन के लिए टालें!"
                  : "🌧️ Weather Alert: Heavy rain forecast within 48 hours. Postpone 1st CRI irrigation by 2 days!"}
              </p>
              <div className="mt-2.5 flex items-center justify-between rounded-xl bg-amber-100/80 p-2.5 text-xs text-amber-950 font-bold border border-amber-300/60">
                <span>
                  💰 {language === "hi" ? "संचित डीजल बचत:" : "Cumulative Diesel Savings:"}
                </span>
                <span className="text-sm font-black text-leaf-deep">
                  ₹{simulatedSavings || 2400} (3 एकड़ पर नलकूप खर्च बचा)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SIMULATION TRIGGER ALERT 2: Pest Outbreak Remediation Card */}
      {pestAlertActive && (
        <div className="rounded-2xl bg-red-500/15 border-2 border-red-500/50 p-4 text-red-950 shadow-md animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-200 text-red-800 shrink-0">
              <Bug size={24} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-red-200 px-2.5 py-0.5 text-[10px] font-black uppercase text-red-900">
                  {language === "hi" ? "कीट प्रकोप आपात चेतावनी" : "Critical Pest Alert"}
                </span>
                <span className="text-xs font-black text-red-700">Immediate Action</span>
              </div>
              <p className="mt-1.5 text-sm font-bold text-red-950 leading-snug">
                {language === "hi"
                  ? "⚠️ फसल सुरक्षा अलर्ट: दीमक व तना छेदक का प्रकोप देखा गया!"
                  : "⚠️ Crop Protection Alert: Termite and stem borer infestation detected!"}
              </p>
              <p className="mt-1.5 text-xs text-red-900 leading-relaxed font-medium">
                {language === "hi"
                  ? "उपचार: तत्काल क्लोरपायरीफॉस 20% EC (Chlorpyrifos 20 EC) @ 1 लीटर/एकड़ सिंचाई जल के साथ या 200 लीटर पानी में मिलाकर छिड़काव करें।"
                  : "Treatment: Immediately apply Chlorpyrifos 20% EC @ 1 L/acre with irrigation water or spray mixed in 200 L water."}
              </p>
              <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-bold text-red-900 bg-red-100 px-2.5 py-1.5 rounded-xl border border-red-200">
                <ShieldAlert size={15} />
                <span>सुरक्षा: छिड़काव के समय दस्ताने व सुरक्षात्मक मास्क अवश्य पहनें।</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Weather & Active Crop SurfaceCard */}
      <SurfaceCard className="relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <StatusBadge
                tone={
                  isIrrigationPostponed
                    ? "gold"
                    : weather.source === "live"
                      ? "leaf"
                      : "gold"
                }
              >
                {isIrrigationPostponed
                  ? "🌧️ Sim: Rain Expected"
                  : weather.source === "live"
                    ? "Live Telemetry"
                    : "Offline Data"}
              </StatusBadge>
              {loading && <span className="text-[10px] text-soil-brown animate-pulse">Syncing...</span>}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <h2 className="text-lg font-bold">{farmerProfile.activeCrop}</h2>
              <button
                type="button"
                onClick={toggleProfileDrawer}
                className="text-[10px] font-bold text-leaf-deep underline hover:text-leaf-green"
                title={language === "hi" ? "फसल व खेत सेटिंग्स बदलें" : "Edit Crop & Farm Settings"}
              >
                ({language === "hi" ? "बदलें" : "Edit"})
              </button>
            </div>
            <p className="text-xs text-soil-brown">
              📍 {farmerProfile.village ? `${farmerProfile.village}, ` : ""}{farmerProfile.district}, {farmerProfile.state} • {farmerProfile.landAcres} {language === "hi" ? "एकड़" : "Acres"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-extrabold">{weather.temp}°C</p>
            <p className="text-xs font-medium text-soil-brown">{weatherLabel}</p>
            <p className="text-[10px] text-soil-brown/80">
              Min {weather.tempMin}° / Max {weather.tempMax}°
            </p>
          </div>
        </div>

        {/* 4 Telemetry Metrics */}
        <div className="mt-4 grid grid-cols-4 gap-2">
          {[
            {
              icon: ThermometerSun,
              label: "Feels Like",
              value: `${weather.feelsLike ?? weather.temp}°C`,
            },
            {
              icon: Droplets,
              label: "Humidity",
              value: `${weather.humidity}%`,
            },
            {
              icon: Wind,
              label: "Wind Speed",
              value: `${weather.windSpeed ?? 14} km/h`,
            },
            {
              icon: CloudDrizzle,
              label: "Rain Prob.",
              value: `${effectiveRainProb}%`,
              highlight: isIrrigationPostponed,
            },
          ].map((item) => (
            <div
              key={item.label}
              className={`flex flex-col items-center rounded-2xl py-2 text-center transition-colors ${
                (item as any).highlight
                  ? "bg-amber-100 border border-amber-300"
                  : "bg-cream-bg"
              }`}
            >
              <item.icon
                size={16}
                className={(item as any).highlight ? "text-amber-800" : "text-leaf-green"}
              />
              <p className="mt-1 text-[11px] text-soil-brown">{item.label}</p>
              <p
                className={`text-sm font-bold ${
                  (item as any).highlight ? "text-amber-900" : "text-soil-text"
                }`}
              >
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Dynamic Stage-Specific CRI Irrigation Advisory Card */}
        <div
          className={`mt-4 rounded-2xl p-3.5 transition-colors border ${
            isIrrigationPostponed || advisory.action === "postpone"
              ? "bg-harvest-gold/15 border-harvest-gold/30 text-soil-deep"
              : advisory.action === "irrigate"
                ? "bg-leaf-soft border-leaf-deep/20 text-leaf-deep"
                : "bg-cream-tan/50 border-cream-border text-soil-text"
          }`}
        >
          <div className="flex items-start gap-2.5">
            {isIrrigationPostponed || advisory.action === "postpone" ? (
              <AlertCircle size={20} className="mt-0.5 text-harvest-gold shrink-0" />
            ) : (
              <Leaf size={20} className="mt-0.5 text-leaf-deep shrink-0" />
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold">
                  {isIrrigationPostponed
                    ? language === "hi"
                      ? "वर्षा की संभावना है, सिंचाई 2 दिन टालें"
                      : "Postpone irrigation by 2 days (Rain expected)"
                    : language === "hi"
                      ? advisory.headlineHi
                      : advisory.headline}
                </p>
                {(isIrrigationPostponed || advisory.dieselSavingsAmount > 0) && (
                  <StatusBadge tone="gold">
                    {language === "hi"
                      ? `डीजल बचत: ₹${isIrrigationPostponed ? simulatedSavings || 2400 : advisory.dieselSavingsAmount}`
                      : `Save ₹${isIrrigationPostponed ? simulatedSavings || 2400 : advisory.dieselSavingsAmount}`}
                  </StatusBadge>
                )}
              </div>
              <p className="mt-1 text-xs leading-relaxed text-soil-brown">
                {isIrrigationPostponed
                  ? language === "hi"
                    ? "सीतापुर में 85% वर्षा संभावना के कारण सिंचाई स्थगित की गई है। इससे 3 एकड़ पर नलकूप का ₹2,400 खर्च बचेगा और पौधों की जड़ें जलभराव से सुरक्षित रहेंगी।"
                    : "Irrigation postponed due to 85% rain forecast in Sitapur. Prevents waterlogging and preserves ₹2,400 in diesel expenditure."
                  : language === "hi"
                    ? advisory.advisoryTextHi
                    : advisory.advisoryText}
              </p>
              <div className="mt-2 flex items-center justify-between text-[11px] font-medium text-soil-brown">
                <span>अवस्था: {advisory.stageHi || advisory.stage}</span>
                <span>अनुशंसा: {isIrrigationPostponed ? "2 दिन बाद समीक्षा करें" : advisory.recommendedDate}</span>
              </div>
            </div>
          </div>
        </div>
      </SurfaceCard>

      {/* Phenology & Crop Growth Timeline Card */}
      <SurfaceCard>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <Sprout size={16} className="text-leaf-green" />
              <h2 className="text-base font-bold text-soil-text">
                Crop Growth Timeline (फसल विकास चक्र)
              </h2>
            </div>
            <p className="text-xs text-soil-brown mt-0.5">
              Day {stageInfo.daysSinceSowing} of {stageInfo.totalDurationDays} ({stageInfo.stageProgressPercent}% completed)
            </p>
          </div>
          <StatusBadge tone={stageInfo.isCriticalStage ? "gold" : "leaf"}>
            {stageInfo.waterRequirement === "high" ? "High Water Need" : "Medium Water"}
          </StatusBadge>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-cream-bg border border-cream-border">
          <div
            className="h-full rounded-full bg-leaf-green transition-all duration-700"
            style={{ width: `${stageInfo.stageProgressPercent}%` }}
          />
        </div>

        {/* Timeline Stage Indicators */}
        <div className="mt-4 flex items-center justify-between overflow-x-auto pb-1">
          {stageInfo.timeline.map((item, idx) => (
            <div key={item.stageName} className="flex flex-1 items-center min-w-[50px]">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                    item.current
                      ? "bg-leaf-green text-cream-card ring-2 ring-leaf-deep/40 scale-105 shadow-sm"
                      : item.completed
                        ? "bg-leaf-soft text-leaf-deep"
                        : "bg-cream-bg text-soil-brown/60 border border-cream-border"
                  }`}
                >
                  {item.completed ? (
                    <CheckCircle2 size={15} />
                  ) : (
                    <Flower2 size={14} />
                  )}
                </div>
                <p className="text-[9px] text-center text-soil-brown max-w-[55px] truncate font-medium">
                  {language === "hi"
                    ? item.stageNameHi.split(" ")[0]
                    : item.stageName.split(" ")[0]}
                </p>
              </div>
              {idx < stageInfo.timeline.length - 1 && (
                <div
                  className={`mx-0.5 h-0.5 flex-1 ${
                    item.completed ? "bg-leaf-green" : "bg-cream-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Critical Action Banner */}
        <div className="mt-3 rounded-xl bg-cream-bg p-2.5 border border-cream-border flex items-start gap-2">
          <ShieldCheck size={16} className="text-leaf-green shrink-0 mt-0.5" />
          <p className="text-xs text-soil-brown">
            <span className="font-bold text-soil-text">
              {language === "hi" ? "वर्तमान कार्य:" : "Current Action:"}
            </span>{" "}
            {isIrrigationPostponed
              ? language === "hi"
                ? "बारिश के कारण सिंचाई 2 दिन टाली गई है। यूरिया टॉप-ड्रेसिंग बारिश रुकने पर करें।"
                : "Irrigation postponed due to rain forecast. Top-dress Urea once soil moisture settles."
              : language === "hi"
                ? stageInfo.criticalActionHi
                : stageInfo.criticalAction}
          </p>
        </div>
      </SurfaceCard>

      {/* Farm Economics & Gross Margin Forecast Card */}
      <SurfaceCard className="border border-leaf-deep/15">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Coins size={18} className="text-harvest-gold" />
            <h2 className="text-base font-bold text-soil-text">
              Harvest Economics Forecast (आय व लागत अनुमान)
            </h2>
          </div>
          <StatusBadge tone="leaf">
            +{economics.profitMarginPercent}% Net Margin
          </StatusBadge>
        </div>
        <p className="text-xs text-soil-brown mt-0.5">
          Based on 3 Acres Wheat HD-2967 @ ₹2,450/Q benchmark mandi rate
        </p>

        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="rounded-2xl bg-cream-bg p-2.5">
            <p className="text-[10px] text-soil-brown font-medium">Est. Yield (उपज)</p>
            <p className="text-base font-black text-soil-text mt-0.5">
              {economics.totalEstimatedYieldQuintals} Q
            </p>
            <span className="text-[9px] text-leaf-deep">~19.5 Q/Acre</span>
          </div>

          <div className="rounded-2xl bg-cream-bg p-2.5">
            <p className="text-[10px] text-soil-brown font-medium">Gross Revenue (सकल आय)</p>
            <p className="text-base font-black text-leaf-deep mt-0.5">
              ₹{economics.grossRevenue.toLocaleString("en-IN")}
            </p>
            <span className="text-[9px] text-soil-brown">@ ₹2,450/Q</span>
          </div>

          <div className="rounded-2xl bg-cream-bg p-2.5">
            <p className="text-[10px] text-soil-brown font-medium">Input Cost (लागत)</p>
            <p className="text-base font-black text-clay-red mt-0.5">
              ₹{economics.totalInputCost.toLocaleString("en-IN")}
            </p>
            <span className="text-[9px] text-soil-brown">₹{economics.costPerQuintal}/Q cost</span>
          </div>

          <div className="rounded-2xl bg-leaf-soft p-2.5">
            <p className="text-[10px] text-leaf-deep font-semibold">Net Profit (शुद्ध लाभ)</p>
            <p className="text-base font-black text-leaf-deep mt-0.5">
              ₹{economics.netProfit.toLocaleString("en-IN")}
            </p>
            <div className="flex items-center gap-0.5 text-[9px] text-leaf-deep font-bold">
              <TrendingUp size={11} /> +{economics.profitMarginPercent}% ROI
            </div>
          </div>
        </div>
      </SurfaceCard>

      {/* Today's Tasks */}
      <SurfaceCard>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold">Today's tasks (CRI Stage)</h2>
          <StatusBadge tone="neutral">{tasks.length} tasks</StatusBadge>
        </div>
        <div className="mt-3 space-y-2">
          {tasks.map((task) => {
            const isPostponed = task.id === "irrigation" && isIrrigationPostponed;
            return (
              <div
                key={task.id}
                className={`flex min-h-[56px] items-center justify-between rounded-2xl border px-3 py-2 transition-colors ${
                  isPostponed
                    ? "border-amber-300 bg-amber-50/70"
                    : "border-cream-border bg-cream-bg/60"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sprout
                    size={18}
                    className={isPostponed ? "text-harvest-gold" : "text-leaf-green"}
                  />
                  <div>
                    <p className="text-sm font-semibold">{task.title}</p>
                    <p className="text-xs text-soil-brown">
                      {isPostponed
                        ? "वर्षा पूर्वानुमान के कारण 2 दिन के लिए स्थगित"
                        : task.subtitle}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {isPostponed ? (
                    <StatusBadge tone="gold">स्थगित (Postponed)</StatusBadge>
                  ) : (
                    <>
                      <p className="text-xs font-semibold">{task.time}</p>
                      <p className="text-[10px] uppercase tracking-wide text-soil-brown">
                        {task.priority}
                      </p>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </SurfaceCard>

      {/* Alternative Crops */}
      <SurfaceCard>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold">Alternative crops to consider</h2>
          <ArrowRight size={16} className="text-leaf-green" />
        </div>
        <div className="mt-2 space-y-2">
          {alternatives.map((alt) => (
            <div
              key={alt.crop}
              className="flex min-h-[56px] items-center justify-between rounded-2xl border border-cream-border px-3 py-2"
            >
              <div>
                <p className="text-sm font-semibold">{alt.crop}</p>
                <p className="text-xs text-soil-brown">{alt.reason}</p>
              </div>
              <StatusBadge tone="leaf">Est. ROI {alt.roi}</StatusBadge>
            </div>
          ))}
        </div>
      </SurfaceCard>

      {is2GMode && (
        <div className="flex items-center gap-2 rounded-2xl bg-cream-tan/60 px-3 py-2 text-xs text-soil-brown">
          <Volume2 size={14} /> 2G mode active — data-light advisory view
        </div>
      )}
    </div>
  );
}
