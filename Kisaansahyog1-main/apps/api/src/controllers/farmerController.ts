import type { Request, Response } from 'express';
import { getSupabaseClient, isSupabaseConfigured } from '../config/supabase.js';

export const getFarmer = async (req: Request, res: Response) => {
  const phone = req.params.phone;
  if (!phone) {
    return res.status(400).json({ error: 'phone_required' });
  }

  if (!isSupabaseConfigured()) {
    return res.status(200).json({ source: 'fallback', farmer: null });
  }

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('farmers')
      .select('*')
      .eq('phone', phone)
      .single();

    if (error) {
      return res.status(200).json({ source: 'fallback', farmer: null, error: error.message });
    }

    return res.status(200).json({ source: 'live', farmer: data });
  } catch (err: any) {
    return res.status(200).json({ source: 'fallback', farmer: null, error: err?.message });
  }
};

export const getTasks = async (req: Request, res: Response) => {
  const phone = req.params.phone;
  if (!phone) {
    return res.status(400).json({ error: 'phone_required' });
  }

  if (!isSupabaseConfigured()) {
    return res.status(200).json({ source: 'fallback', tasks: [] });
  }

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('daily_tasks')
      .select('*')
      .eq('farmer_phone', phone)
      .eq('status', 'active')
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    return res.status(200).json({ source: 'live', tasks: data || [] });
  } catch (err: any) {
    return res.status(200).json({ source: 'fallback', tasks: [], error: err?.message });
  }
};
