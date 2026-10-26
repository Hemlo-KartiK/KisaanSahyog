import { z } from 'zod';

export const CropListingSchema = z.object({
  crop_name: z.string().min(2),
  crop_name_hi: z.string().optional(),
  variety: z.string().min(1),
  quantity_quintals: z.number().positive(),
  rate_per_quintal: z.number().positive(),
  farmer_name: z.string().min(2),
  farmer_phone: z.string().min(10),
  district: z.string().min(2),
  state: z.string().min(2),
  harvest_date: z.string().optional(),
  verified: z.boolean().optional(),
  organic: z.boolean().optional(),
});

export type CreateCropListingInput = z.infer<typeof CropListingSchema>;

export const BargainOfferSchema = z.object({
  listing_id: z.string().uuid().or(z.string().min(1)),
  crop_name: z.string().min(2),
  farmer_name: z.string().min(2),
  farmer_phone: z.string().min(10),
  buyer_name: z.string().min(2),
  buyer_phone: z.string().min(10),
  original_rate: z.number().positive(),
  offered_rate: z.number().positive(),
  quantity_quintals: z.number().positive(),
});

export type CreateBargainOfferInput = z.infer<typeof BargainOfferSchema>;
