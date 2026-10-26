export interface CropListing {
  id: string;
  cropName: string;
  cropNameHi: string;
  variety: string;
  quantityQuintals: number;
  ratePerQuintal: number;
  farmerName: string;
  farmerPhone: string;
  district: string;
  state: string;
  harvestDate: string;
  verified: boolean;
  organic: boolean;
  createdAt: string;
  quantity?: number;
  rate?: number;
  location?: string;
}

export interface BargainOffer {
  id: string;
  listingId: string;
  cropName: string;
  farmerName: string;
  farmerPhone: string;
  buyerName: string;
  buyerPhone: string;
  originalRate: number;
  offeredRate: number;
  quantityQuintals: number;
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
  createdAt: string;
}

export interface FarmerProfile {
  name: string;
  nameHi?: string;
  location: string;
  pin: string;
  phone: string;
  land: string;
  activeCrop: string;
  sown: string;
  soil?: string;
  soilDetails?: {
    type: string;
    pH: number;
    moisture: number;
    n: string;
    p: string;
    k: string;
  };
}

export type UserRole = 'farmer' | 'buyer' | null;
