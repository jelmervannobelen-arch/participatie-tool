import type { Metrics, SliderValues } from "./types";

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export type SimulationInput = {
  baselineParkingPressure: number;
  baselineParkingSpots: number;
  intersectionCount: number;
  sliders: SliderValues;
};

export const simulateMetrics = ({
  baselineParkingPressure,
  intersectionCount,
  sliders
}: SimulationInput): Metrics => {
  // Mirror the server-side formulas for realtime feedback.
  const parkingPressure = clamp(
    baselineParkingPressure +
      0.9 * sliders.removedParkingSpots -
      4.5 * sliders.addedSharedCars,
    0,
    200
  );

  const intersectionRiskFactor = clamp(intersectionCount * 2, 0, 30);

  const livability = clamp(
    55 +
      2.2 * sliders.addedGreenUnits +
      1.4 * sliders.addedPublicSpace -
      0.15 * parkingPressure,
    0,
    100
  );

  const safety = clamp(
    50 +
      2.1 * sliders.addedBikeUnits +
      1.6 * sliders.addedPublicSpace -
      0.6 * intersectionRiskFactor,
    0,
    100
  );

  const biodiversity = clamp(35 + 3.4 * sliders.addedGreenUnits, 0, 100);

  const heatStress = clamp(
    75 - 2.8 * sliders.addedGreenUnits - 1.2 * sliders.addedPublicSpace,
    0,
    100
  );

  const accessibility = clamp(
    60 + 1.8 * sliders.addedPublicSpace - 0.4 * sliders.removedParkingSpots,
    0,
    100
  );

  return {
    parkingPressure,
    livability,
    biodiversity,
    safety,
    heatStress,
    accessibility
  };
};

export const emptySliders = (): SliderValues => ({
  removedParkingSpots: 0,
  addedGreenUnits: 0,
  addedSharedCars: 0,
  addedBikeUnits: 0,
  addedPublicSpace: 0
});
