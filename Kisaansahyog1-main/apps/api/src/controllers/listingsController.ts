import type { Request, Response } from 'express';
import type { CropListing } from '@kisaansahyog/shared';
import { getSupabaseClientSafe } from '../config/supabase.js';
import {
  inMemoryListings,
  mapSupabaseListing,
} from '../store/inMemoryStore.js';

export const handleGetListings = async (_req: Request, res: Response) => {
  const supabase = getSupabaseClientSafe();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        return res.status(200).json({
          source: 'live',
          listings: data.map(mapSupabaseListing),
        });
      }
    } catch (err: any) {
      console.warn(
        '[API] Supabase listings query failed, falling back to in-memory store:',
        err?.message || err,
      );
    }
  }

  return res.status(200).json({
    source: 'fallback',
    listings: inMemoryListings,
  });
};

export const handleCreateListing = async (req: Request, res: Response) => {
  const body = req.body || {};
  const cropName = body.cropName || body.crop_name || 'Wheat';
  const cropNameHi = body.cropNameHi || body.crop_name_hi || cropName;
  const variety = body.variety || 'Standard';
  const quantityQuintals = Number(
    body.quantityQuintals ?? body.quantity_quintals ?? body.quantity ?? 0,
  );
  const ratePerQuintal = Number(
    body.ratePerQuintal ?? body.rate_per_quintal ?? body.rate ?? 0,
  );
  const farmerName = body.farmerName || body.farmer_name || 'Farmer';
  const farmerPhone = body.farmerPhone || body.farmer_phone || '9876543210';
  const district =
    body.district ||
    (body.location ? String(body.location).split(',')[0]?.trim() : '') ||
    'Sitapur';
  const state = body.state || 'Uttar Pradesh';
  const harvestDate =
    body.harvestDate || body.harvest_date || 'Ready Now (तैयार स्टॉक)';
  const verified = body.verified !== undefined ? Boolean(body.verified) : true;
  const organic = Boolean(body.organic);

  const supabase = getSupabaseClientSafe();
  if (supabase) {
    try {
      const payload = {
        crop_name: cropName,
        crop_name_hi: cropNameHi,
        variety,
        quantity_quintals: quantityQuintals,
        rate_per_quintal: ratePerQuintal,
        farmer_name: farmerName,
        farmer_phone: farmerPhone,
        district,
        state,
        harvest_date: harvestDate,
        verified,
        organic,
      };

      const { data, error } = await supabase
        .from('listings')
        .insert(payload)
        .select()
        .single();

      if (error) {
        throw error;
      }

      const mapped = mapSupabaseListing(data);
      inMemoryListings.unshift(mapped);
      return res.status(201).json({ source: 'live', listing: mapped });
    } catch (err: any) {
      console.warn(
        '[API] Supabase listing creation failed, saving to in-memory store:',
        err?.message || err,
      );
    }
  }

  // Fallback in-memory insertion
  const fallbackListing: CropListing = {
    id: `lot-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    cropName,
    cropNameHi,
    variety,
    quantityQuintals,
    ratePerQuintal,
    farmerName,
    farmerPhone,
    district,
    state,
    harvestDate,
    verified,
    organic,
    createdAt: new Date().toISOString(),
    quantity: quantityQuintals,
    rate: ratePerQuintal,
    location: body.location || `${district}, ${state}`,
  };

  inMemoryListings.unshift(fallbackListing);
  return res.status(201).json({
    source: 'fallback',
    message: 'Listing saved to in-memory store',
    listing: fallbackListing,
  });
};

export const getListings = handleGetListings;
export const createListing = handleCreateListing;
