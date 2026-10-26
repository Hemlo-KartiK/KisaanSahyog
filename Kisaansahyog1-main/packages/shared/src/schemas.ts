import { z } from "zod";
import { BUYER_TABS, FARMER_TABS, LANGUAGES, ROLES } from "./constants.js";

export const languageSchema = z.enum(LANGUAGES);
export const roleSchema = z.enum(ROLES);
export const farmerTabSchema = z.enum(FARMER_TABS);
export const buyerTabSchema = z.enum(BUYER_TABS);

export const indianPhoneSchema = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number.");

export const farmerProfileSchema = z.object({
  fullName: z.string().trim().min(2, "Name must be at least 2 characters.").max(80),
  phone: indianPhoneSchema,
  language: languageSchema.default("hi"),
  state: z.string().trim().min(2).max(60),
  district: z.string().trim().min(2).max(60),
  landSizeAcres: z.number().positive().max(1000),
  primaryCrops: z.array(z.string().trim().min(1)).min(1),
});

export const buyerRequirementSchema = z.object({
  crop: z.string().trim().min(2).max(60),
  quantityQuintals: z.number().positive().max(100000),
  maxPricePerQuintal: z.number().positive().max(1000000),
  district: z.string().trim().min(2).max(60),
  neededBy: z.iso.date(),
  notes: z.string().trim().max(500).optional(),
});

export const weatherQuerySchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  language: languageSchema.default("hi"),
});

export const mandiPriceQuerySchema = z.object({
  crop: z.string().trim().min(2).max(60),
  district: z.string().trim().min(2).max(60).optional(),
  limit: z.number().int().min(1).max(100).default(20),
});

export type LanguageInput = z.infer<typeof languageSchema>;
export type RoleInput = z.infer<typeof roleSchema>;
export type FarmerProfileInput = z.infer<typeof farmerProfileSchema>;
export type BuyerRequirementInput = z.infer<typeof buyerRequirementSchema>;
export type WeatherQueryInput = z.infer<typeof weatherQuerySchema>;
export type MandiPriceQueryInput = z.infer<typeof mandiPriceQuerySchema>;
