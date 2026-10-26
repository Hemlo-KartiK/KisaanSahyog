import { describe, expect, it } from "vitest";
import {
  calculateSeedRequirement,
  ENGINE_PHASE,
  ENGINE_VERSION,
} from "./index.js";
import {
  calculateFertilizerPrescription,
  calculateCropStageInfo,
  calculateCropEconomics,
  type SoilTestInput,
} from "@kisaansahyog/shared";

describe("KisaanSahyog skills engine", () => {
  it("exposes the phase 6 engine metadata", () => {
    expect(ENGINE_VERSION).toBe("0.1.0");
    expect(ENGINE_PHASE).toBe(6);
  });

  it("calculates seed requirements for a plot", () => {
    expect(
      calculateSeedRequirement({ areaAcres: 2.5, seedRateKgPerAcre: 40 }),
    ).toEqual({
      seedKg: 100,
      seedRateKgPerAcre: 40,
      areaAcres: 2.5,
    });
  });

  it("rejects invalid plot areas", () => {
    expect(() =>
      calculateSeedRequirement({ areaAcres: 0, seedRateKgPerAcre: 40 }),
    ).toThrow(RangeError);
  });
});

describe("Phase 6 Agronomy Engine (@kisaansahyog/shared)", () => {
  const mockSoil: SoilTestInput = {
    nitrogenStatus: "low",
    phosphorusStatus: "low",
    potassiumStatus: "medium",
    ph: 7.2,
    organicCarbonPercent: 0.48,
  };

  it("calculates balanced fertilizer prescription for 3 acres Wheat", () => {
    const prescription = calculateFertilizerPrescription(mockSoil, "Wheat", 3.0);

    expect(prescription.totalDapBags).toBeGreaterThanOrEqual(3.5);
    expect(prescription.totalUreaBags).toBeGreaterThanOrEqual(7.0);
    expect(prescription.zincSulphateKg).toBe(75); // 25kg * 3 acres
    expect(prescription.organicCompostQuintals).toBe(45); // 15Q * 3 acres
    expect(prescription.applicationSchedule).toHaveLength(3);

    // Verify split stages: Basal, CRI, Tillering
    expect(prescription.applicationSchedule[0]?.stage).toContain("Basal");
    expect(prescription.applicationSchedule[1]?.stage).toContain("CRI");
    expect(prescription.applicationSchedule[2]?.stage).toContain("Tillering");
  });

  it("determines crop phenology and critical stages for Wheat HD-2967", () => {
    const stageCRI = calculateCropStageInfo("Wheat", 28);
    expect(stageCRI.currentStage).toContain("Crown Root Initiation");
    expect(stageCRI.isCriticalStage).toBe(true);
    expect(stageCRI.waterRequirement).toBe("high");
    expect(stageCRI.stageProgressPercent).toBe(20);
    expect(stageCRI.timeline.length).toBeGreaterThan(5);

    const stageTillering = calculateCropStageInfo("Wheat", 45);
    expect(stageTillering.currentStage).toContain("Tillering");
    expect(stageTillering.isCriticalStage).toBe(false);
  });

  it("computes farm economics and gross margin accurately", () => {
    const economics = calculateCropEconomics("Wheat", 3.0, 19.5, 2450);
    expect(economics.totalEstimatedYieldQuintals).toBe(58.5); // 19.5 * 3
    expect(economics.grossRevenue).toBe(143325); // 58.5 * 2450
    expect(economics.totalInputCost).toBe(46020); // 15340 * 3
    expect(economics.netProfit).toBe(97305);
    expect(economics.costPerQuintal).toBe(787);
    expect(economics.profitMarginPercent).toBe(211);
  });
});
