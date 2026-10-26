import { CheckCircle2, MessageCircle, Phone, Store } from "lucide-react";
import { getDictionary } from "@kisaansahyog/shared";
import { useAppStore } from "../store/useAppStore";
import { SurfaceCard } from "../components/stitch/SurfaceCard";
import { StatusBadge } from "../components/stitch/StatusBadge";

const listings = [
  {
    id: "1",
    crop: "Wheat",
    variety: "PBW 824",
    qty: "30 Q",
    price: "₹2400/Q",
    location: "Ludhiana",
    distance: "12 km",
    verified: true,
  },
  {
    id: "2",
    crop: "Mustard",
    variety: "Pusa Bold",
    qty: "15 Q",
    price: "₹5450/Q",
    location: "Jagraon",
    distance: "24 km",
    verified: true,
  },
  {
    id: "3",
    crop: "Basmati",
    variety: "Pusa 1121",
    qty: "25 Q",
    price: "₹3850/Q",
    location: "Khanna",
    distance: "18 km",
    verified: false,
  },
];

export default function MarketScreen() {
  const language = useAppStore((state) => state.language);
  const dictionary = getDictionary(language);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-soil-text">
            {dictionary.screens.market}
          </h1>
          <p className="text-xs text-soil-brown">
            Direct farmer marketplace • 0% commission
          </p>
        </div>
        <StatusBadge tone="gold">0% fee</StatusBadge>
      </div>

      <div className="space-y-3">
        {listings.map((listing) => (
          <SurfaceCard key={listing.id}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-leaf-soft">
                  <Store size={18} className="text-leaf-deep" />
                </div>
                <div>
                  <p className="text-base font-bold">
                    {listing.crop} • {listing.variety}
                  </p>
                  <p className="text-xs text-soil-brown">
                    {listing.location} • {listing.distance}
                  </p>
                </div>
              </div>
              {listing.verified && (
                <StatusBadge>
                  <CheckCircle2 size={11} /> Verified
                </StatusBadge>
              )}
            </div>

            <div className="mt-3 flex items-center justify-between rounded-2xl bg-cream-bg px-3 py-2">
              <div>
                <p className="text-xs text-soil-brown">Quantity</p>
                <p className="text-sm font-semibold">{listing.qty}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-soil-brown">Price</p>
                <p className="text-sm font-semibold text-leaf-deep">
                  {listing.price}
                </p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button className="flex min-h-[56px] items-center justify-center gap-2 rounded-2xl bg-leaf-green text-cream-card">
                <Phone size={18} /> Call
              </button>
              <button className="flex min-h-[56px] items-center justify-center gap-2 rounded-2xl border border-leaf-green/30 bg-leaf-soft text-leaf-deep">
                <MessageCircle size={18} /> WhatsApp
              </button>
            </div>
          </SurfaceCard>
        ))}
      </div>
    </div>
  );
}
