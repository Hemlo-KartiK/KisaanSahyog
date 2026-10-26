import type { Request, Response } from 'express';
import type { BargainOffer } from '@kisaansahyog/shared';
import { getSupabaseClientSafe } from '../config/supabase.js';
import {
  inMemoryOffers,
  mapSupabaseOffer,
} from '../store/inMemoryStore.js';

export const handleGetOffers = async (_req: Request, res: Response) => {
  const supabase = getSupabaseClientSafe();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return res.status(200).json({
        source: 'live',
        offers: (data || []).map(mapSupabaseOffer),
      });
    } catch (err: any) {
      console.warn(
        '[API] Supabase offers query failed, falling back to in-memory store:',
        err?.message || err,
      );
    }
  }

  return res.status(200).json({
    source: 'fallback',
    offers: inMemoryOffers,
  });
};

export const handleCreateOffer = async (req: Request, res: Response) => {
  const body = req.body || {};
  const listingId = body.listingId || body.listing_id || '';
  const cropName = body.cropName || body.crop_name || '';
  const farmerName = body.farmerName || body.farmer_name || '';
  const farmerPhone = body.farmerPhone || body.farmer_phone || '';
  const buyerName = body.buyerName || body.buyer_name || 'Buyer';
  const buyerPhone = body.buyerPhone || body.buyer_phone || '';
  const originalRate = Number(body.originalRate ?? body.original_rate ?? 0);
  const offeredRate = Number(body.offeredRate ?? body.offered_rate ?? 0);
  const quantityQuintals = Number(
    body.quantityQuintals ?? body.quantity_quintals ?? 0,
  );
  const status = body.status || 'pending';

  const supabase = getSupabaseClientSafe();
  if (supabase) {
    try {
      const payload = {
        listing_id: listingId,
        crop_name: cropName,
        farmer_name: farmerName,
        farmer_phone: farmerPhone,
        buyer_name: buyerName,
        buyer_phone: buyerPhone,
        original_rate: originalRate,
        offered_rate: offeredRate,
        quantity_quintals: quantityQuintals,
        status,
      };

      const { data, error } = await supabase
        .from('offers')
        .insert(payload)
        .select()
        .single();

      if (error) {
        throw error;
      }

      const mapped = mapSupabaseOffer(data);
      inMemoryOffers.unshift(mapped);
      return res.status(201).json({ source: 'live', offer: mapped });
    } catch (err: any) {
      console.warn(
        '[API] Supabase offer creation failed, saving to in-memory store:',
        err?.message || err,
      );
    }
  }

  const fallbackOffer: BargainOffer = {
    id: `offer-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    listingId,
    cropName,
    farmerName,
    farmerPhone,
    buyerName,
    buyerPhone,
    originalRate,
    offeredRate,
    quantityQuintals,
    status: status as any,
    createdAt: new Date().toISOString(),
  };

  inMemoryOffers.unshift(fallbackOffer);
  return res.status(201).json({
    source: 'fallback',
    message: 'Offer saved to in-memory store',
    offer: fallbackOffer,
  });
};

export const getOffers = handleGetOffers;
export const createOffer = handleCreateOffer;
