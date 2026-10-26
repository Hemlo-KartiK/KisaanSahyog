import { ArrowRight, Sprout, Store } from "lucide-react";
import { getDictionary } from "@kisaansahyog/shared";
import { useAppStore, type UserProfile } from "../store/useAppStore";
import { SurfaceCard } from "../components/stitch/SurfaceCard";
import { StatusBadge } from "../components/stitch/StatusBadge";

export default function LoginScreen() {
  const language = useAppStore((state) => state.language);
  const loginAs = useAppStore((state) => state.loginAs);
  const dictionary = getDictionary(language);

  const farmerProfile: UserProfile = {
    id: "farmer-demo-1",
    name: "रमेश कुमार / Ramesh Kumar",
    phone: "9876543210",
    location: "सीतापुर, उत्तर प्रदेश / Sitapur, UP",
    role: "farmer",
  };

  const buyerProfile: UserProfile = {
    id: "buyer-demo-1",
    name: "अग्रवाल ट्रेडर्स / Agarwal Traders",
    phone: "9876501234",
    location: "कानपुर, उत्तर प्रदेश / Kanpur, UP",
    role: "buyer",
  };

  return (
    <main className="px-4 py-6">
      <div className="text-center">
        <StatusBadge>
          <Sprout size={11} /> KisaanSahyog
        </StatusBadge>
        <h1 className="mt-3 text-2xl font-extrabold text-soil-text">
          {dictionary.auth.welcome}
        </h1>
        <p className="mt-1 text-sm text-soil-brown">{dictionary.auth.subtitle}</p>
      </div>

      <div className="mt-6 space-y-3">
        <SurfaceCard className="border-leaf-green/30">
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-leaf-soft text-leaf-deep">
              <Sprout size={24} aria-hidden="true" />
            </span>
            <div className="flex-1">
              <h2 className="text-lg font-bold">{dictionary.auth.farmerLogin}</h2>
              <p className="mt-1 text-sm text-soil-brown">
                {dictionary.auth.farmerDesc}
              </p>
            </div>
          </div>
          <button
            onClick={() => loginAs(farmerProfile)}
            className="mt-4 flex min-h-[56px] w-full items-center justify-center gap-2 rounded-2xl bg-leaf-green text-cream-card"
          >
            <ArrowRight size={18} /> {dictionary.auth.demoFarmerBtn}
          </button>
        </SurfaceCard>

        <SurfaceCard className="border-harvest-gold/40">
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-harvest-gold/15 text-soil-brown">
              <Store size={24} aria-hidden="true" />
            </span>
            <div className="flex-1">
              <h2 className="text-lg font-bold">{dictionary.auth.buyerLogin}</h2>
              <p className="mt-1 text-sm text-soil-brown">
                {dictionary.auth.buyerDesc}
              </p>
            </div>
          </div>
          <button
            onClick={() => loginAs(buyerProfile)}
            className="mt-4 flex min-h-[56px] w-full items-center justify-center gap-2 rounded-2xl bg-soil-brown text-cream-card"
          >
            <ArrowRight size={18} /> {dictionary.auth.demoBuyerBtn}
          </button>
        </SurfaceCard>
      </div>

      <div className="mt-6 rounded-2xl bg-cream-tan/50 p-4 text-center">
        <p className="text-xs text-soil-brown">{dictionary.disclaimers.kvkShort}</p>
      </div>
    </main>
  );
}
