import { Router, Request, Response } from 'express';
import {
  getSitapurWeather,
  getMandiRates,
  getSoilHealthRecord,
  getIrrigationAdvisory,
  evaluatePriceMargin,
  findMatchingBuyers,
} from '../services/telemetry.js';

const router = Router();

// GET /api/telemetry/weather
router.get('/weather', async (req: Request, res: Response) => {
  try {
    const lat = req.query.lat ? Number(req.query.lat) : 27.56;
    const lon = req.query.lon ? Number(req.query.lon) : 80.68;
    const location = (req.query.location as string) || (req.query.loc as string) || undefined;
    const weather = await getSitapurWeather(lat, lon, location);
    return res.status(200).json({
      status: 'ok',
      service: 'telemetry_weather',
      data: weather,
    });
  } catch (err: any) {
    return res.status(500).json({
      status: 'error',
      message: err?.message || 'Failed to fetch weather telemetry',
    });
  }
});

// GET /api/telemetry/mandi
router.get('/mandi', (_req: Request, res: Response) => {
  try {
    const mandiData = getMandiRates();
    return res.status(200).json({
      status: 'ok',
      service: 'telemetry_mandi',
      data: mandiData,
    });
  } catch (err: any) {
    return res.status(500).json({
      status: 'error',
      message: err?.message || 'Failed to fetch mandi benchmarks',
    });
  }
});

// GET /api/telemetry/soil
router.get('/soil', (_req: Request, res: Response) => {
  try {
    const soilData = getSoilHealthRecord();
    return res.status(200).json({
      status: 'ok',
      service: 'telemetry_soil',
      data: soilData,
    });
  } catch (err: any) {
    return res.status(500).json({
      status: 'error',
      message: err?.message || 'Failed to fetch soil telemetry',
    });
  }
});

// GET /api/telemetry/advisory
router.get('/advisory', async (req: Request, res: Response) => {
  try {
    const days = req.query.days ? Number(req.query.days) : 28;
    const rainOverride = req.query.rain ? Number(req.query.rain) : undefined;
    const advisory = await getIrrigationAdvisory(days, rainOverride);
    return res.status(200).json({
      status: 'ok',
      service: 'telemetry_advisory',
      data: advisory,
    });
  } catch (err: any) {
    return res.status(500).json({
      status: 'error',
      message: err?.message || 'Failed to generate irrigation advisory',
    });
  }
});

// Optional/Bonus endpoints for margin evaluation and buyer matching
router.get('/margin', (req: Request, res: Response) => {
  const crop = String(req.query.crop || 'Wheat');
  const rate = Number(req.query.rate || 2450);
  const evaluation = evaluatePriceMargin(crop, rate);
  return res.status(200).json({
    status: 'ok',
    service: 'margin_guardrail',
    data: evaluation,
  });
});

router.get('/buyers', (req: Request, res: Response) => {
  const crop = String(req.query.crop || 'Wheat');
  const quantity = Number(req.query.quantity || 30);
  const rate = Number(req.query.rate || 2450);
  const matches = findMatchingBuyers(crop, quantity, rate);
  return res.status(200).json({
    status: 'ok',
    service: 'buyer_matcher',
    count: matches.length,
    data: matches,
  });
});

export default router;
