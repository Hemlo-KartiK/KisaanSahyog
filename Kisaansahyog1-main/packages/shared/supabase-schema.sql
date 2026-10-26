-- ============================================================================
-- KisaanSahyog Complete Supabase SQL Migration Script
-- Schema for Farmers, Crop Listings, Bargain Offers, and Daily Advisory Tasks
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. Farmers Profile Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.farmers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    district TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    land_acres NUMERIC NOT NULL DEFAULT 3.0,
    active_crop TEXT NOT NULL DEFAULT 'Wheat HD-2967',
    crop_stage TEXT NOT NULL DEFAULT 'Tillering',
    soil_type TEXT NOT NULL DEFAULT 'Alluvial Loam',
    soil_ph NUMERIC NOT NULL DEFAULT 7.2,
    soil_moisture NUMERIC NOT NULL DEFAULT 34.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. Crop Listings Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crop_name TEXT NOT NULL,
    crop_name_hi TEXT NOT NULL,
    variety TEXT NOT NULL,
    quantity_quintals NUMERIC NOT NULL,
    rate_per_quintal NUMERIC NOT NULL,
    farmer_name TEXT NOT NULL,
    farmer_phone TEXT NOT NULL,
    district TEXT NOT NULL,
    state TEXT NOT NULL,
    harvest_date TEXT NOT NULL DEFAULT 'Ready Now',
    verified BOOLEAN DEFAULT TRUE,
    organic BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 3. Bargain Offers Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id TEXT NOT NULL,
    crop_name TEXT NOT NULL,
    farmer_name TEXT NOT NULL,
    farmer_phone TEXT NOT NULL,
    buyer_name TEXT NOT NULL,
    buyer_phone TEXT NOT NULL,
    original_rate NUMERIC NOT NULL,
    offered_rate NUMERIC NOT NULL,
    quantity_quintals NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, rejected, countered
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 4. Daily Agricultural Tasks Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.daily_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_phone TEXT NOT NULL,
    title TEXT NOT NULL,
    stage TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active', -- active, postponed, cancelled, done
    savings_amount NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- Indexes for High Performance Queries
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_listings_crop_name ON public.listings (crop_name);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON public.listings (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_offers_listing_id ON public.offers (listing_id);
CREATE INDEX IF NOT EXISTS idx_offers_farmer_phone ON public.offers (farmer_phone);
CREATE INDEX IF NOT EXISTS idx_offers_buyer_phone ON public.offers (buyer_phone);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_farmer_phone ON public.daily_tasks (farmer_phone);

-- ----------------------------------------------------------------------------
-- Row Level Security (RLS)
-- ----------------------------------------------------------------------------
ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- RLS Policies (Allow public read, insert, and update for pilot/demo)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public read listings" ON public.listings;
CREATE POLICY "Public read listings" ON public.listings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert listings" ON public.listings;
CREATE POLICY "Public insert listings" ON public.listings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public update listings" ON public.listings;
CREATE POLICY "Public update listings" ON public.listings FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public read offers" ON public.offers;
CREATE POLICY "Public read offers" ON public.offers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert offers" ON public.offers;
CREATE POLICY "Public insert offers" ON public.offers FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public update offers" ON public.offers;
CREATE POLICY "Public update offers" ON public.offers FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public read farmers" ON public.farmers;
CREATE POLICY "Public read farmers" ON public.farmers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert farmers" ON public.farmers;
CREATE POLICY "Public insert farmers" ON public.farmers FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public update farmers" ON public.farmers;
CREATE POLICY "Public update farmers" ON public.farmers FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public read tasks" ON public.daily_tasks;
CREATE POLICY "Public read tasks" ON public.daily_tasks FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert tasks" ON public.daily_tasks;
CREATE POLICY "Public insert tasks" ON public.daily_tasks FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public update tasks" ON public.daily_tasks;
CREATE POLICY "Public update tasks" ON public.daily_tasks FOR UPDATE USING (true);

-- ----------------------------------------------------------------------------
-- Seed Data: Default Profile and Initial Listings
-- ----------------------------------------------------------------------------
INSERT INTO public.farmers (name, phone, district, state, pincode, land_acres, active_crop, crop_stage)
VALUES ('रमेश कुमार (Ramesh Kumar)', '9876543210', 'Sitapur', 'Uttar Pradesh', '261001', 3.0, 'Wheat HD-2967', 'Tillering')
ON CONFLICT (phone) DO UPDATE SET
    district = EXCLUDED.district,
    state = EXCLUDED.state;

INSERT INTO public.listings (crop_name, crop_name_hi, variety, quantity_quintals, rate_per_quintal, farmer_name, farmer_phone, district, state, verified)
VALUES 
('Wheat', 'गेहूं', 'HD-2967 (Sharbati)', 40, 2450, 'रमेश कुमार (Ramesh Kumar)', '9876543210', 'Sitapur', 'Uttar Pradesh', true),
('Mustard', 'सरसों', 'Pusa Bold', 25, 5400, 'सुरेश पटेल (Suresh Patel)', '9876543211', 'Karnal', 'Haryana', true),
('Chana', 'चना', 'Desi Chana', 15, 5850, 'महेंद्र सिंह (Mahendra Singh)', '9876543212', 'Nashik', 'Maharashtra', true),
('Basmati', 'बासमती धान', 'Pusa 1121', 60, 3800, 'बलबीर सिंह (Balbir Singh)', '9876543213', 'Ludhiana', 'Punjab', true),
('Maize', 'मक्का', 'Hybrid Yellow', 35, 2150, 'राजेश यादव (Rajesh Yadav)', '9876543214', 'Alwar', 'Rajasthan', true)
ON CONFLICT DO NOTHING;
