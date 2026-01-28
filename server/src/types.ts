export type SliderValues = {
  removedParkingSpots: number;
  addedGreenUnits: number;
  addedSharedCars: number;
  addedBikeUnits: number;
  addedPublicSpace: number;
};

export type Metrics = {
  parkingPressure: number;
  livability: number;
  biodiversity: number;
  safety: number;
  heatStress: number;
  accessibility: number;
};

export type LayoutRect = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
};

export type LayoutJson = {
  width: number;
  height: number;
  segments: LayoutRect[];
  zones: LayoutRect[];
};
