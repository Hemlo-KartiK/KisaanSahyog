import {
  INITIAL_MOCK_LISTINGS,
  type CropListing,
  type BargainOffer,
} from '@kisaansahyog/shared';

export const inMemoryListings: CropListing[] = (
  INITIAL_MOCK_LISTINGS as unknown as CropListing[]
).map((item) => ({
  id: item.id,
  cropName: item.cropName,
  cropNameHi: (item as any).cropNameHi ?? item.cropName,
  variety: item.variety,
  quantityQuintals: item.quantityQuintals ?? (item as any).quantity ?? 0,
  ratePerQuintal: item.ratePerQuintal ?? (item as any).rate ?? 0,
  farmerName: item.farmerName,
  farmerPhone: item.farmerPhone,
  district:
    item.district ??
    (item as any).location?.split(',')[0]?.trim() ??
    '',
  state: item.state ?? '',
  harvestDate: item.harvestDate ?? 'Ready Now (तैयार स्टॉक)',
  verified: item.verified ?? true,
  organic: item.organic ?? false,
  createdAt: item.createdAt ?? new Date().toISOString(),
  quantity: item.quantityQuintals ?? (item as any).quantity ?? 0,
  rate: item.ratePerQuintal ?? (item as any).rate ?? 0,
  location:
    (item as any).location ??
    [item.district, item.state].filter(Boolean).join(', '),
}));

export const inMemoryOffers: BargainOffer[] = [];

export const mapSupabaseListing = (row: any): CropListing => ({
  id: row.id,
  cropName: row.crop_name,
  cropNameHi: row.crop_name_hi ?? row.crop_name,
  variety: row.variety,
  quantityQuintals: Number(row.quantity_quintals ?? 0),
  ratePerQuintal: Number(row.rate_per_quintal ?? 0),
  farmerName: row.farmer_name,
  farmerPhone: row.farmer_phone,
  district: row.district ?? '',
  state: row.state ?? '',
  harvestDate: row.harvest_date ?? 'Ready Now',
  verified: Boolean(row.verified ?? true),
  organic: Boolean(row.organic ?? false),
  createdAt: row.created_at ?? new Date().toISOString(),
  quantity: Number(row.quantity_quintals ?? 0),
  rate: Number(row.rate_per_quintal ?? 0),
  location:
    row.district && row.state
      ? `${row.district}, ${row.state}`
      : row.district || row.state || '',
});

export const mapSupabaseOffer = (row: any): BargainOffer => ({
  id: row.id,
  listingId: row.listing_id,
  cropName: row.crop_name,
  farmerName: row.farmer_name,
  farmerPhone: row.farmer_phone,
  buyerName: row.buyer_name,
  buyerPhone: row.buyer_phone,
  originalRate: Number(row.original_rate ?? 0),
  offeredRate: Number(row.offered_rate ?? 0),
  quantityQuintals: Number(row.quantity_quintals ?? 0),
  status: row.status ?? 'pending',
  createdAt: row.created_at ?? new Date().toISOString(),
});
