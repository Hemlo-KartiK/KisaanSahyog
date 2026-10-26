import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  INITIAL_MOCK_LISTINGS,
  type CropListing,
} from '@kisaansahyog/shared';

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

interface ListingState {
  listings: CropListing[];
  offers: BargainOffer[];
  searchQuery: string;
  selectedCropFilter: string;
  addListing: (listing: Partial<CropListing> & { farmerName: string; farmerPhone: string }) => void;
  addOffer: (offer: Omit<BargainOffer, 'id' | 'createdAt' | 'status'>) => void;
  setSearchQuery: (q: string) => void;
  setSelectedCropFilter: (crop: string) => void;
  resetToMockData: () => void;
}

const getInitialListings = (): CropListing[] => {
  return (INITIAL_MOCK_LISTINGS as unknown as CropListing[]).map((listing) => ({
    ...listing,
    quantityQuintals:
      listing.quantityQuintals ?? (listing as any).quantity ?? 0,
    ratePerQuintal:
      listing.ratePerQuintal ?? (listing as any).rate ?? 0,
    district: listing.district ?? (listing as any).location?.split(',')[0]?.trim() ?? '',
    state: listing.state ?? '',
    createdAt: listing.createdAt ?? new Date().toISOString(),
    verified: listing.verified ?? true,
    organic: listing.organic ?? false,
  }));
};

export const useListingStore = create<ListingState>()(
  persist(
    (set) => ({
      listings: getInitialListings(),
      offers: [],
      searchQuery: '',
      selectedCropFilter: 'All',

      addListing: (newLot) => {
        const now = new Date();
        const quantityQuintals = Number(newLot.quantityQuintals ?? (newLot as any).quantity ?? 0);
        const ratePerQuintal = Number(newLot.ratePerQuintal ?? (newLot as any).rate ?? 0);
        const id = `lot-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

        const listing: CropListing = {
          id,
          cropName: newLot.cropName ?? '',
          cropNameHi: (newLot as any).cropNameHi ?? newLot.cropName ?? '',
          variety: newLot.variety ?? '',
          quantityQuintals,
          ratePerQuintal,
          farmerName: newLot.farmerName,
          farmerPhone: newLot.farmerPhone,
          district: (newLot as any).district ?? (newLot as any).location?.split(',')[0]?.trim() ?? '',
          state: (newLot as any).state ?? '',
          harvestDate: (newLot as any).harvestDate ?? 'Ready Now (तैयार स्टॉक)',
          verified: newLot.verified ?? true,
          organic: newLot.organic ?? false,
          createdAt: now.toISOString(),
          quantity: quantityQuintals,
          rate: ratePerQuintal,
          location: (newLot as any).location ?? `${(newLot as any).district ?? ''}, ${(newLot as any).state ?? ''}`.replace(/^, |, $/g, ''),
        } as CropListing;

        set((state) => ({
          listings: [listing, ...state.listings],
        }));
      },

      addOffer: (offer) => {
        const newOffer: BargainOffer = {
          ...offer,
          id: `offer-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          offers: [newOffer, ...state.offers],
        }));
      },

      setSearchQuery: (q: string) => set({ searchQuery: q }),
      setSelectedCropFilter: (crop: string) => set({ selectedCropFilter: crop }),

      resetToMockData: () => set({ listings: getInitialListings(), offers: [] }),
    }),
    {
      name: 'kisaan_listings_v1',
    },
  ),
);
