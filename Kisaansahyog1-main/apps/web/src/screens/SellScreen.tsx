import { useMemo, useState } from 'react';
import { CheckCircle2, AlertTriangle, Send } from 'lucide-react';
import {
  getDictionary,
  MANDI_BENCHMARK_RATES,
  MOCK_FARMER,
} from '@kisaansahyog/shared';
import { useAppStore } from '../store/useAppStore';
import { useListingStore } from '../store/useListingStore';
import { useSimulationStore } from '../store/useSimulationStore';
import { useFarmerProfileStore } from '../store/useFarmerProfileStore';
import { SurfaceCard } from '../components/stitch/SurfaceCard';
import { StatusBadge } from '../components/stitch/StatusBadge';

const cropPresets = [
  { label: 'Wheat HD-2967', cropName: 'Wheat', cropNameHi: 'गेहूं', variety: 'HD-2967' },
  { label: 'Mustard Pusa Bold', cropName: 'Mustard', cropNameHi: 'सरसों', variety: 'Pusa Bold' },
  { label: 'Chana Desi', cropName: 'Chana', cropNameHi: 'चना', variety: 'Desi' },
  { label: 'Basmati 1121', cropName: 'Basmati', cropNameHi: 'बासमती धान', variety: '1121' },
];

const availabilityPresets = [
  'Ready Now (तैयार स्टॉक)',
  'In 3 Days',
  'In 1 Week',
];

export default function SellScreen() {
  const language = useAppStore((state) => state.language);
  const setFarmerTab = useAppStore((state) => state.setFarmerTab);
  const dictionary = getDictionary(language);

  // Simulation State
  const isMandiCrashed = useSimulationStore((state) => state.isMandiCrashed);

  const addListing = useListingStore((state) => state.addListing);
  const farmerProfile = useFarmerProfileStore((state) => state.profile);

  const [selectedCrop, setSelectedCrop] = useState(cropPresets[0]);
  const [quantityQuintals, setQuantityQuintals] = useState<number>(30);
  const [ratePerQuintal, setRatePerQuintal] = useState<number>(2450);
  const [harvestDate, setHarvestDate] = useState<string>(availabilityPresets[0]);
  const [success, setSuccess] = useState<string | null>(null);

  const benchmarkRate = useMemo(() => {
    const key = selectedCrop.cropName as keyof typeof MANDI_BENCHMARK_RATES;
    const hiKey = selectedCrop.cropNameHi as keyof typeof MANDI_BENCHMARK_RATES;
    let rate = MANDI_BENCHMARK_RATES[key] ?? MANDI_BENCHMARK_RATES[hiKey] ?? 2400;

    // Simulate -20% Mandi price crash for Wheat
    if (isMandiCrashed && (selectedCrop.cropName === 'Wheat' || selectedCrop.cropNameHi === 'गेहूं')) {
      rate = Math.round(rate * 0.8); // ₹1,920/Q
    }

    return rate as number;
  }, [selectedCrop, isMandiCrashed]);

  const guardrail = useMemo(() => {
    const mandiRate = benchmarkRate;
    const askingRate = Number(ratePerQuintal) || 0;
    const diffPercent = Math.round(((askingRate - mandiRate) / mandiRate) * 100);
    const minAllowed = Math.round(mandiRate * 0.85);
    const maxAllowed = Math.round(mandiRate * 1.4);

    if (diffPercent > 40) {
      return {
        status: 'high' as const,
        diffPercent,
        mandiRate,
        minAllowed,
        maxAllowed,
      };
    }
    if (diffPercent < -15) {
      return {
        status: 'low' as const,
        diffPercent,
        mandiRate,
        minAllowed,
        maxAllowed,
      };
    }
    return {
      status: 'fair' as const,
      diffPercent,
      mandiRate,
      minAllowed,
      maxAllowed,
    };
  }, [benchmarkRate, ratePerQuintal]);

  const totalDealValue = useMemo(() => {
    const qty = Number(quantityQuintals) || 0;
    const rate = Number(ratePerQuintal) || 0;
    return qty * rate;
  }, [quantityQuintals, ratePerQuintal]);

  const handlePublish = () => {
    addListing({
      cropName: selectedCrop.cropName,
      cropNameHi: selectedCrop.cropNameHi,
      variety: selectedCrop.variety,
      quantityQuintals: Number(quantityQuintals),
      ratePerQuintal: Number(ratePerQuintal),
      farmerName: farmerProfile.name || MOCK_FARMER.name,
      farmerPhone: farmerProfile.phone || MOCK_FARMER.phone,
      district: farmerProfile.district || 'सीतापुर',
      state: farmerProfile.state || 'उत्तर प्रदेश',
      harvestDate,
      verified: true,
      organic: false,
    });

    setSuccess('आपकी फसल सफलतापूर्वक लिस्ट कर दी गई है! (Listed on Buyer Marketplace)');
    setTimeout(() => {
      setSuccess(null);
      setFarmerTab('market');
    }, 1800);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-soil-text">
            {dictionary.screens.sell}
          </h1>
          <p className="text-xs text-soil-brown">
            सीधे खरीदार तक पहुंचे • 0% कमीशन (Direct Mandi Portal)
          </p>
        </div>
        <StatusBadge tone={isMandiCrashed ? "clay" : "leaf"}>
          {isMandiCrashed ? "📉 भाव गिरावट (-20%)" : "0% बिचौलिया"}
        </StatusBadge>
      </div>

      {success && (
        <div className="flex items-center gap-2 rounded-2xl bg-leaf-soft p-4 text-xs font-bold text-leaf-deep border border-leaf-deep/20 shadow-sm animate-fade-in">
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* SIMULATION TRIGGER: Mandi Price Crash Alert */}
      {isMandiCrashed && (
        <div className="rounded-2xl border-2 border-red-400 bg-red-50 p-4 text-xs text-red-950 shadow-md animate-fade-in space-y-2">
          <div className="flex items-start gap-2.5">
            <AlertTriangle size={20} className="mt-0.5 text-red-600 shrink-0" />
            <div>
              <div className="flex items-center justify-between">
                <p className="font-black text-sm text-red-900">
                  📉 सीतापुर मंडी भाव में भारी गिरावट (-20% Mandi Price Crash)
                </p>
                <span className="rounded-full bg-red-200 px-2 py-0.5 text-[10px] font-bold text-red-900">
                  गार्डरेल सक्रिय
                </span>
              </div>
              <p className="mt-1 leading-relaxed text-red-800">
                आवक बढ़ने के कारण गेहूं का मंडी मॉडल रेट ₹2,400 से गिरकर <strong>₹{benchmarkRate.toLocaleString('en-IN')}/Q</strong> हो गया है। किसान सहयोग मार्जिन गार्डरेल आपको औने-पौने दाम पर बेचने से रोकता है।
              </p>
              <div className="mt-2.5 rounded-xl bg-red-100 p-2.5 text-red-950 font-semibold border border-red-200">
                💡 <span className="font-bold">विशेषज्ञ संस्तुति:</span> अपनी उपज को WDRA पंजीकृत गोदाम (Warehouse e-NWR) में रखें और 3% रियायती ब्याज पर ऋण लें, या सीधे संस्थागत फ्लोर मिल खरीदार से अनुबंधित मूल्य पर बेचें।
              </div>
            </div>
          </div>
        </div>
      )}

      <SurfaceCard>
        <h2 className="text-base font-bold text-soil-text">1. फसल का चयन करें (Select Crop)</h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {cropPresets.map((crop) => (
            <button
              key={crop.label}
              type="button"
              onClick={() => setSelectedCrop(crop)}
              className={`flex flex-col items-start rounded-2xl border p-3 text-left transition-all ${
                selectedCrop.label === crop.label
                  ? 'border-leaf-green bg-leaf-soft text-leaf-deep font-bold ring-2 ring-leaf-deep/20'
                  : 'border-cream-border bg-cream-bg text-soil-text hover:border-leaf-green/40'
              }`}
            >
              <span className="text-sm">{crop.label}</span>
              <span className="text-[11px] font-normal text-soil-brown">
                {crop.cropNameHi}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between rounded-2xl bg-cream-bg p-3 border border-cream-border">
          <div>
            <p className="text-xs text-soil-brown">सीतापुर मंडी बेंचमार्क भाव</p>
            <p className="text-base font-bold text-leaf-deep">
              ₹ {benchmarkRate.toLocaleString('en-IN')} / क्विंटल
            </p>
          </div>
          <StatusBadge tone={isMandiCrashed ? "clay" : "gold"}>
            {isMandiCrashed ? "Mandi Crashed" : "Live KVK Modal"}
          </StatusBadge>
        </div>
      </SurfaceCard>

      <SurfaceCard>
        <h2 className="text-base font-bold text-soil-text">
          2. मात्रा और अपेक्षित दर (Quantity & Asking Rate)
        </h2>

        <div className="mt-3 space-y-3">
          <div>
            <label className="text-xs font-semibold text-soil-brown">
              कुल मात्रा (क्विंटल में) / Quantity (Quintals)
            </label>
            <input
              type="number"
              min={1}
              value={quantityQuintals}
              onChange={(e) => setQuantityQuintals(Number(e.target.value))}
              className="mt-1 min-h-[56px] w-full rounded-2xl border border-cream-border bg-cream-bg px-3 text-sm font-semibold text-soil-deep focus:outline-none focus:ring-2 focus:ring-leaf-green"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-soil-brown">
                आपकी दर (₹ प्रति क्विंटल) / Asking Rate
              </label>
              <button
                type="button"
                onClick={() => setRatePerQuintal(benchmarkRate)}
                className="text-xs font-bold text-leaf-deep hover:underline"
              >
                बेंचमार्क दर सेट करें (Set ₹{benchmarkRate})
              </button>
            </div>
            <input
              type="number"
              min={100}
              value={ratePerQuintal}
              onChange={(e) => setRatePerQuintal(Number(e.target.value))}
              className="mt-1 min-h-[56px] w-full rounded-2xl border border-cream-border bg-cream-bg px-3 text-sm font-semibold text-soil-deep focus:outline-none focus:ring-2 focus:ring-leaf-green"
            />
          </div>
        </div>

        <div className="mt-3 rounded-2xl border border-cream-border bg-cream-bg p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-soil-brown">
              कुल संभावित भुगतान (Total Deal Value)
            </p>
            <p className="text-lg font-extrabold text-soil-deep">
              ₹ {totalDealValue.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {guardrail.status === 'high' && (
          <div className="mt-3 space-y-2 rounded-2xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            <div className="flex items-start gap-2">
              <AlertTriangle size={16} className="mt-0.5" />
              <p className="font-semibold">
                ⚠️ मंडी औसत भाव से {guardrail.diffPercent}% अधिक है!
              </p>
            </div>
            <p>
              सीतापुर मंडी का औसत भाव ₹{guardrail.mandiRate.toLocaleString('en-IN')}
              /क्विंटल है। भाव 40% से अधिक होने पर खरीदार मिलने में अधिक समय लग सकता
              है।
            </p>
            <p className="font-semibold">
              (उचित सीमा: ₹{guardrail.minAllowed.toLocaleString('en-IN')} - ₹
              {guardrail.maxAllowed.toLocaleString('en-IN')}/Q • अंतिम निर्णय आपका
              है)
            </p>
          </div>
        )}

        {guardrail.status === 'low' && (
          <div className="mt-3 space-y-2 rounded-2xl border border-orange-300 bg-orange-50 px-3 py-2 text-xs text-orange-900">
            <div className="flex items-start gap-2">
              <AlertTriangle size={16} className="mt-0.5" />
              <p className="font-semibold">
                ⚠️ मंडी औसत भाव से {Math.abs(guardrail.diffPercent)}% कम है!
              </p>
            </div>
            <p>
              सावधानी: आप अपनी फसल मंडी औसत भाव (₹
              {guardrail.mandiRate.toLocaleString('en-IN')}/Q) से काफी कम पर बेच रहे
              हैं।
            </p>
            <p className="font-semibold">
              अनुशंसा: कम से कम ₹{guardrail.minAllowed.toLocaleString('en-IN')}/Q दर
              रखें ताकि आपको उचित लाभ मिल सके।
            </p>
          </div>
        )}

        {guardrail.status === 'fair' && (
          <div className="mt-3 flex items-center gap-2 rounded-2xl bg-leaf-soft px-3 py-2 text-xs font-semibold text-leaf-deep">
            <CheckCircle2 size={16} />
            <span>
              दर संतुलित है (मंडी औसत भाव ₹{guardrail.mandiRate}/Q के अनुकूल)।
            </span>
          </div>
        )}
      </SurfaceCard>

      <SurfaceCard>
        <h2 className="text-base font-bold text-soil-text">3. स्टॉक उपलब्धता (Availability)</h2>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {availabilityPresets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setHarvestDate(preset)}
              className={`rounded-2xl border p-2.5 text-xs text-center transition-all ${
                harvestDate === preset
                  ? 'border-leaf-green bg-leaf-soft text-leaf-deep font-bold ring-2 ring-leaf-deep/20'
                  : 'border-cream-border bg-cream-bg text-soil-text hover:border-leaf-green/40'
              }`}
            >
              {preset.split(' ')[0]}
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-2xl bg-cream-tan/50 p-3 text-xs text-soil-brown leading-relaxed">
          <p className="font-semibold text-soil-deep">किसान विवरण (Seller Info):</p>
          <p className="mt-0.5">नाम: {MOCK_FARMER.name}</p>
          <p>स्थान: {MOCK_FARMER.location}</p>
          <p>सत्यापित किसान: हाँ (Kisan Credit Card Verified ✓)</p>
        </div>

        <button
          type="button"
          onClick={handlePublish}
          className="mt-4 flex min-h-[56px] w-full items-center justify-center gap-2 rounded-full bg-leaf-green text-sm font-bold text-cream-card shadow-md transition active:scale-95 hover:bg-leaf-deep"
        >
          <Send size={18} />
          <span>मार्केटप्लेस पर प्रकाशित करें (Publish Listing)</span>
        </button>
      </SurfaceCard>
    </div>
  );
}
