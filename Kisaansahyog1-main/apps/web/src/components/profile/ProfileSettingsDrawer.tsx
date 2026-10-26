import React, { useState } from "react";
import {
  X,
  MapPin,
  Sprout,
  RotateCcw,
  CheckCircle2,
  Navigation,
  Compass,
  Layers,
  FlaskConical,
  Droplets,
  Calendar,
  Sparkles,
  Phone,
  User,
  Sliders,
} from "lucide-react";
import {
  useFarmerProfileStore,
  REGIONAL_PRESETS,
  type FarmerProfile,
} from "../../store/useFarmerProfileStore";
import { useAppStore } from "../../store/useAppStore";
import { calculateCropStageInfo, calculateCropEconomics } from "@kisaansahyog/shared";

const CROP_OPTIONS = [
  { label: "Wheat HD-2967 (गेहूं)", value: "Wheat HD-2967 (गेहूं)", baseCrop: "Wheat", yieldPerAcre: 19.5, rate: 2450 },
  { label: "Mustard Pusa Bold (सरसों)", value: "Mustard Pusa Bold (सरसों)", baseCrop: "Mustard", yieldPerAcre: 9.0, rate: 5400 },
  { label: "Chana Desi (चना)", value: "Chana Desi (चना)", baseCrop: "Chana", yieldPerAcre: 8.5, rate: 5350 },
  { label: "Basmati 1121 (बासमती)", value: "Basmati 1121 (बासमती)", baseCrop: "Basmati", yieldPerAcre: 16.0, rate: 3600 },
  { label: "Maize Ganga-5 (मक्का)", value: "Maize Ganga-5 (मक्का)", baseCrop: "Maize", yieldPerAcre: 22.0, rate: 2100 },
];

const SOIL_TYPE_OPTIONS = [
  "Alluvial Loam (जलोढ़ दोमट)",
  "Sandy Loam (बलुई दोमट)",
  "Clay Loam (मटियार दोमट)",
  "Black Soil (काली मिट्टी / Regur)",
  "Loamy Sand (हल्की दोमट)",
  "Arid Sand Loam (रेतीली दोमट)",
];

export const ProfileSettingsDrawer: React.FC = () => {
  const profile = useFarmerProfileStore((state) => state.profile);
  const isProfileDrawerOpen = useFarmerProfileStore((state) => state.isProfileDrawerOpen);
  const setProfileDrawerOpen = useFarmerProfileStore((state) => state.setProfileDrawerOpen);
  const updateProfile = useFarmerProfileStore((state) => state.updateProfile);
  const applyRegionalPreset = useFarmerProfileStore((state) => state.applyRegionalPreset);
  const resetToDefaults = useFarmerProfileStore((state) => state.resetToDefaults);
  const getDaysSinceSowing = useFarmerProfileStore((state) => state.getDaysSinceSowing);

  const language = useAppStore((state) => state.language);
  const isHi = language === "hi";

  // Local draft state for smooth editing
  const [formData, setFormData] = useState<FarmerProfile>(profile);
  const [savedBanner, setSavedBanner] = useState<string | null>(null);
  const [locating, setLocating] = useState<boolean>(false);

  // Sync draft whenever drawer opens
  React.useEffect(() => {
    if (isProfileDrawerOpen) {
      setFormData(profile);
      setSavedBanner(null);
    }
  }, [isProfileDrawerOpen, profile]);

  if (!isProfileDrawerOpen) {
    return null;
  }

  // Calculate dynamic agronomic insights based on form state
  const sowingDateObj = new Date(formData.sowingDate);
  const daysSinceSowing = !isNaN(sowingDateObj.getTime())
    ? Math.max(1, Math.min(180, Math.floor((Date.now() - sowingDateObj.getTime()) / (1000 * 60 * 60 * 24))))
    : getDaysSinceSowing();

  const selectedCropOption = CROP_OPTIONS.find((c) => c.value === formData.activeCrop) || CROP_OPTIONS[0];
  const stageInfo = calculateCropStageInfo(selectedCropOption.baseCrop, daysSinceSowing);
  const economics = calculateCropEconomics(
    selectedCropOption.baseCrop,
    formData.landAcres,
    selectedCropOption.yieldPerAcre,
    selectedCropOption.rate
  );

  const handlePresetSelect = (presetKey: string) => {
    applyRegionalPreset(presetKey);
    const preset = REGIONAL_PRESETS[presetKey];
    if (preset) {
      setFormData((prev) => ({
        ...prev,
        district: preset.district,
        state: preset.state,
        lat: preset.lat,
        lon: preset.lon,
        soilType: preset.defaultSoil,
        soilPh: preset.soilPh,
      }));
      setSavedBanner(
        isHi
          ? `📍 ${preset.district} क्षेत्र चुना गया (मौसम निर्देशांक सिंक किए गए)`
          : `📍 ${preset.district} regional preset applied & weather synced!`
      );
      setTimeout(() => setSavedBanner(null), 3500);
    }
  };

  const handleUseDeviceLocation = () => {
    if (!navigator.geolocation) {
      alert(isHi ? "ब्राउज़र में GPS उपलब्ध नहीं है" : "Geolocation not supported in browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(2));
        const lon = Number(pos.coords.longitude.toFixed(2));
        setFormData((prev) => ({ ...prev, lat, lon }));
        setLocating(false);
        setSavedBanner(
          isHi
            ? `✓ डिवाइस GPS मिला: ${lat}, ${lon}`
            : `✓ Device GPS acquired: ${lat}, ${lon}`
        );
        setTimeout(() => setSavedBanner(null), 3000);
      },
      (err) => {
        setLocating(false);
        console.warn("[Geolocation] Could not retrieve GPS coordinates:", err);
        setSavedBanner(
          isHi
            ? "GPS अनुमति नहीं मिली, क्षेत्रीय प्रीसेट का उपयोग करें"
            : "GPS permission denied, use regional presets"
        );
        setTimeout(() => setSavedBanner(null), 3000);
      },
      { timeout: 8000 }
    );
  };

  const handleSave = () => {
    updateProfile(formData);
    setSavedBanner(
      isHi
        ? "✓ सभी प्रोफ़ाइल व खेत सेटिंग्स सफलतापूर्वक सहेजी गईं!"
        : "✓ All profile & farm settings saved and telemetry refreshed!"
    );
    setTimeout(() => {
      setSavedBanner(null);
      setProfileDrawerOpen(false);
    }, 900);
  };

  const handleReset = () => {
    resetToDefaults();
    setSavedBanner(isHi ? "डिफ़ॉल्ट सेटिंग्स रीसेट की गईं" : "Reset to defaults");
    setTimeout(() => setSavedBanner(null), 2500);
  };

  const isCurrentPreset = (districtName: string) => {
    return formData.district.toLowerCase() === districtName.toLowerCase();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      {/* Dismiss backdrop */}
      <div
        className="absolute inset-0"
        onClick={() => setProfileDrawerOpen(false)}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-3xl border-t border-cream-border bg-cream-bg p-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cream-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-leaf-soft text-leaf-deep shadow-sm">
              <Sliders size={18} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-soil-text">
                {isHi ? "किसान प्रोफ़ाइल व खेत सेटिंग्स" : "Farmer Profile & Farm Settings"}
              </h2>
              <p className="text-[11px] text-soil-brown">
                {isHi
                  ? "स्थान, रकबा व मृदा मेट्रिक्स से लाइव मौसम व सलाह सिंक करें"
                  : "Sync live weather, crop stage & agronomic telemetry"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleReset}
              title={isHi ? "डिफ़ॉल्ट रीसेट करें" : "Reset to defaults"}
              className="flex h-8 w-8 items-center justify-center rounded-full text-soil-brown transition hover:bg-cream-tan/60 active:scale-95"
            >
              <RotateCcw size={15} />
            </button>
            <button
              type="button"
              onClick={() => setProfileDrawerOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-soil-brown transition hover:bg-cream-tan/60 active:scale-95"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Dynamic Toast / Status Banner */}
        {savedBanner && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-leaf-soft px-3 py-2 text-xs font-semibold text-leaf-deep animate-fade-in">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{savedBanner}</span>
          </div>
        )}

        <div className="mt-4 space-y-5">
          {/* 1. Quick Regional Presets */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-soil-brown flex items-center gap-1.5">
                <Compass size={13} className="text-harvest-gold" />
                {isHi ? "त्वरित क्षेत्रीय प्रीसेट (1-क्लिक स्थान)" : "Quick Regional Presets"}
              </label>
              <span className="text-[10px] text-soil-brown/80">
                {isHi ? "मौसम व मृदा स्वतः बदलेगी" : "Auto-updates GPS & Soil"}
              </span>
            </div>

            <div className="mt-2 grid grid-cols-3 gap-2">
              {Object.keys(REGIONAL_PRESETS).map((key) => {
                const active = isCurrentPreset(key);
                const item = REGIONAL_PRESETS[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handlePresetSelect(key)}
                    className={`flex flex-col items-center justify-center rounded-2xl border p-2 text-center transition active:scale-95 ${
                      active
                        ? "border-leaf-green bg-leaf-green text-cream-card shadow-sm"
                        : "border-cream-border bg-cream-card text-soil-text hover:bg-cream-tan/50"
                    }`}
                  >
                    <span className="text-xs font-bold">{key}</span>
                    <span
                      className={`text-[9px] ${
                        active ? "text-cream-card/80" : "text-soil-brown"
                      }`}
                    >
                      {item.state.split(" ")[0]} (₹{item.mandiBenchmark})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Personal & Contact Info */}
          <div className="rounded-2xl border border-cream-border bg-cream-card p-3.5 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-soil-text">
              <User size={14} className="text-leaf-deep" />
              <span>{isHi ? "व्यक्तिगत जानकारी (Farmer Info)" : "Personal & Contact Info"}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-soil-brown">
                  {isHi ? "किसान का नाम (Name)" : "Farmer Name"}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-cream-border bg-cream-bg px-3 py-2 text-xs font-bold text-soil-text focus:border-leaf-green focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-soil-brown flex items-center gap-1">
                  <Phone size={11} />
                  {isHi ? "मोबाइल नंबर (Phone)" : "Mobile Phone"}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-cream-border bg-cream-bg px-3 py-2 text-xs font-bold text-soil-text focus:border-leaf-green focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-soil-brown">
                {isHi ? "गाँव / ग्राम पंचायत (Village / Area)" : "Village / Gram Panchayat"}
              </label>
              <input
                type="text"
                value={formData.village}
                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                className="mt-1 w-full rounded-xl border border-cream-border bg-cream-bg px-3 py-2 text-xs font-medium text-soil-text focus:border-leaf-green focus:outline-none"
              />
            </div>
          </div>

          {/* 3. Farm Location & GPS Weather Telemetry */}
          <div className="rounded-2xl border border-cream-border bg-cream-card p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-soil-text">
                <MapPin size={14} className="text-harvest-gold" />
                <span>{isHi ? "खेत का स्थान व GPS निर्देशांक" : "Location & GPS Coordinates"}</span>
              </div>

              <button
                type="button"
                onClick={handleUseDeviceLocation}
                disabled={locating}
                className="inline-flex items-center gap-1 rounded-full border border-leaf-green/40 bg-leaf-soft px-2.5 py-1 text-[10px] font-bold text-leaf-deep hover:bg-leaf-green hover:text-cream-card transition"
              >
                <Navigation size={11} className={locating ? "animate-spin" : ""} />
                {locating
                  ? isHi
                    ? "खोज रहे हैं..."
                    : "Locating..."
                  : isHi
                  ? "डिवाइस GPS लें"
                  : "Use Device GPS"}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-soil-brown">
                  {isHi ? "जिला (District)" : "District"}
                </label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-cream-border bg-cream-bg px-3 py-2 text-xs font-bold text-soil-text focus:border-leaf-green focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-soil-brown">
                  {isHi ? "राज्य (State)" : "State"}
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-cream-border bg-cream-bg px-3 py-2 text-xs font-bold text-soil-text focus:border-leaf-green focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-soil-brown">
                  Latitude (°N)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.lat}
                  onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) || 0 })}
                  className="mt-1 w-full rounded-xl border border-cream-border bg-cream-bg px-3 py-2 text-xs font-mono font-bold text-soil-text focus:border-leaf-green focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-soil-brown">
                  Longitude (°E)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.lon}
                  onChange={(e) => setFormData({ ...formData, lon: parseFloat(e.target.value) || 0 })}
                  className="mt-1 w-full rounded-xl border border-cream-border bg-cream-bg px-3 py-2 text-xs font-mono font-bold text-soil-text focus:border-leaf-green focus:outline-none"
                />
              </div>
            </div>

            {/* Farm Land Size in Acres */}
            <div className="border-t border-cream-border/60 pt-2.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-soil-brown">
                  {isHi ? "खेत का कुल रकबा (Land Size)" : "Total Farm Land"}
                </label>
                <span className="text-xs font-extrabold text-leaf-deep">
                  {formData.landAcres} {isHi ? "एकड़ (Acres)" : "Acres"}
                </span>
              </div>

              <div className="mt-2 flex items-center gap-1.5">
                {[1.0, 2.0, 2.5, 3.0, 5.0, 10.0].map((acre) => (
                  <button
                    key={acre}
                    type="button"
                    onClick={() => setFormData({ ...formData, landAcres: acre })}
                    className={`flex-1 rounded-xl border py-1.5 text-[11px] font-bold transition ${
                      formData.landAcres === acre
                        ? "border-leaf-green bg-leaf-green text-cream-card"
                        : "border-cream-border bg-cream-bg text-soil-text hover:bg-cream-tan/50"
                    }`}
                  >
                    {acre}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Active Crop & Sowing Timeline */}
          <div className="rounded-2xl border border-cream-border bg-cream-card p-3.5 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-soil-text">
              <Sprout size={14} className="text-leaf-deep" />
              <span>{isHi ? "सक्रिय फसल व बुवाई चक्र" : "Active Crop & Sowing Calendar"}</span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-soil-brown">
                {isHi ? "फसल चुनें (Active Crop)" : "Selected Crop"}
              </label>
              <select
                value={formData.activeCrop}
                onChange={(e) => setFormData({ ...formData, activeCrop: e.target.value })}
                className="mt-1 w-full rounded-xl border border-cream-border bg-cream-bg px-3 py-2 text-xs font-bold text-soil-text focus:border-leaf-green focus:outline-none"
              >
                {CROP_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-soil-brown flex items-center gap-1">
                  <Calendar size={11} />
                  {isHi ? "बुवाई की तारीख (Sowing Date)" : "Sowing Date (YYYY-MM-DD)"}
                </label>
                <span className="text-[10px] font-bold text-leaf-deep">
                  {daysSinceSowing} {isHi ? "दिन बीत चुके (DAS)" : "Days After Sowing"}
                </span>
              </div>
              <input
                type="date"
                value={formData.sowingDate}
                onChange={(e) => setFormData({ ...formData, sowingDate: e.target.value })}
                className="mt-1 w-full rounded-xl border border-cream-border bg-cream-bg px-3 py-2 text-xs font-bold text-soil-text focus:border-leaf-green focus:outline-none"
              />
            </div>

            {/* Stage & Economic Forecast Preview */}
            <div className="rounded-xl bg-cream-tan/50 p-2.5 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-soil-brown">
                  {isHi ? "वर्तमान चरण (Stage):" : "Current Growth Stage:"}
                </span>
                <span className="font-extrabold text-soil-text">
                  {isHi ? stageInfo.currentStageHi : stageInfo.currentStage}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-soil-brown">
                  {isHi ? "अनुमानित कुल उपज:" : "Estimated Harvest:"}
                </span>
                <span className="font-bold text-leaf-deep">
                  {economics.totalEstimatedYieldQuintals} {isHi ? "क्विंटल" : "Quintals"}
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-cream-border/60 pt-1">
                <span className="text-[11px] text-soil-brown">
                  {isHi ? "अनुमानित सकल आय:" : "Projected Gross Value:"}
                </span>
                <span className="font-extrabold text-soil-text">
                  ₹{economics.grossRevenue.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* 5. Soil Test Metrics */}
          <div className="rounded-2xl border border-cream-border bg-cream-card p-3.5 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-soil-text">
              <Layers size={14} className="text-soil-brown" />
              <span>{isHi ? "मृदा स्वास्थ्य व परीक्षण मेट्रिक्स" : "Soil Health & Test Metrics"}</span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-soil-brown">
                {isHi ? "मिट्टी का प्रकार (Soil Type)" : "Soil Type"}
              </label>
              <select
                value={formData.soilType}
                onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                className="mt-1 w-full rounded-xl border border-cream-border bg-cream-bg px-3 py-2 text-xs font-bold text-soil-text focus:border-leaf-green focus:outline-none"
              >
                {SOIL_TYPE_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Soil pH Slider */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-soil-brown flex items-center gap-1">
                  <FlaskConical size={11} />
                  {isHi ? "मृदा पीएच (Soil pH)" : "Soil pH Level"}
                </label>
                <span className="text-xs font-mono font-extrabold text-soil-text">
                  pH {formData.soilPh.toFixed(1)}{" "}
                  <span className="text-[10px] font-normal text-soil-brown">
                    ({formData.soilPh < 6.5 ? (isHi ? "अम्लीय / Acidic" : "Acidic") : formData.soilPh > 7.5 ? (isHi ? "क्षारीय / Alkaline" : "Alkaline") : (isHi ? "आदर्श / Optimal" : "Optimal")})
                  </span>
                </span>
              </div>
              <input
                type="range"
                min="5.5"
                max="8.5"
                step="0.1"
                value={formData.soilPh}
                onChange={(e) => setFormData({ ...formData, soilPh: parseFloat(e.target.value) })}
                className="mt-1.5 w-full accent-leaf-green cursor-pointer"
              />
            </div>

            {/* Soil Moisture % Slider */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-soil-brown flex items-center gap-1">
                  <Droplets size={11} />
                  {isHi ? "मृदा नमी प्रतिशत (Soil Moisture %)" : "Soil Moisture %"}
                </label>
                <span className="text-xs font-mono font-extrabold text-soil-text">
                  {formData.soilMoisturePct}%{" "}
                  <span className="text-[10px] font-normal text-soil-brown">
                    ({formData.soilMoisturePct < 25 ? (isHi ? "सूखी / Dry" : "Dry") : formData.soilMoisturePct > 45 ? (isHi ? "अत्यधिक नमी / Wet" : "Wet") : (isHi ? "उपयुक्त / Optimal" : "Optimal")})
                  </span>
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="80"
                step="1"
                value={formData.soilMoisturePct}
                onChange={(e) => setFormData({ ...formData, soilMoisturePct: parseInt(e.target.value, 10) })}
                className="mt-1.5 w-full accent-leaf-green cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-5 pt-3 border-t border-cream-border flex items-center gap-3">
          <button
            type="button"
            onClick={() => setProfileDrawerOpen(false)}
            className="flex-1 rounded-2xl border border-cream-border bg-cream-card py-3 text-xs font-bold text-soil-brown transition hover:bg-cream-tan/60 active:scale-95"
          >
            {isHi ? "रद्द करें (Cancel)" : "Cancel"}
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex-[2] flex items-center justify-center gap-2 rounded-2xl bg-leaf-green py-3 text-xs font-bold text-cream-card shadow-md transition hover:bg-leaf-deep active:scale-95"
          >
            <Sparkles size={15} />
            <span>{isHi ? "सहेजें व मौसम सिंक करें" : "Save & Sync Settings"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
