/**
 * KisaanSahyog agronomic calculation engine.
 *
 * Phase 6 will expand this package with crop calendars, irrigation scheduling,
 * fertiliser splits, and pest risk scoring. The contracts below are deliberately
 * small and dependency-free so they can be tested with Vitest and reused by the
 * web app, API, and offline workers.
 */

export const ENGINE_VERSION = "0.1.0";
export const ENGINE_PHASE = 6;

export interface SeedRequirementInput {
  /** Cultivated area in acres. */
  areaAcres: number;
  /** Recommended seed rate in kilograms per acre. */
  seedRateKgPerAcre: number;
}

export interface SeedRequirementResult {
  seedKg: number;
  seedRateKgPerAcre: number;
  areaAcres: number;
}

/**
 * Calculate the seed required for a plot. This is the first engine primitive
 * used by the advisory screens and will be joined by nutrient and water models.
 */
export function calculateSeedRequirement({
  areaAcres,
  seedRateKgPerAcre,
}: SeedRequirementInput): SeedRequirementResult {
  if (!Number.isFinite(areaAcres) || areaAcres <= 0) {
    throw new RangeError("areaAcres must be a positive number.");
  }

  if (!Number.isFinite(seedRateKgPerAcre) || seedRateKgPerAcre <= 0) {
    throw new RangeError("seedRateKgPerAcre must be a positive number.");
  }

  return {
    seedKg: Number((areaAcres * seedRateKgPerAcre).toFixed(2)),
    seedRateKgPerAcre,
    areaAcres,
  };
}
