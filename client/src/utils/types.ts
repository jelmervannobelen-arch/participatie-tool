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

export type Project = {
  id: string;
  name: string;
  areaName: string;
  createdAt: string;
  baselineParkingPressure: number;
  baselineParkingSpots: number;
  layoutJson: string;
  notes?: string | null;
  intersections: { id: string; x: number; y: number }[];
  zones: { id: string; type: string; geometryJson: string; capacity?: number | null }[];
  costConfigs: { id: string; key: string; unitCost: number; unitOpex: number }[];
};

export type Design = {
  id: string;
  createdAt: string;
  respondentType: string;
  postalCode4?: string | null;
  ageGroup: string;
  sliders: SliderValues;
  metrics: Metrics;
};

export type Insights = {
  totalDesigns: number;
  summary: Record<string, { average: number; median: number }>;
  topCombinations: { sliders: SliderValues; count: number }[];
  consensus: { sliders: SliderValues; metrics: Metrics };
  baselineMetrics: Metrics;
  costs: {
    items: { key: string; unitCost: number; unitOpex: number; units: number; capex: number; opex: number }[];
    totalCapex: number;
    totalOpex: number;
  };
};
