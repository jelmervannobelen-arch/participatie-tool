import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./db.js";
import { requireAdmin } from "./auth.js";
import { designCreateSchema, projectCreateSchema } from "./validation.js";
import { simulateMetrics } from "./simulation.js";
import type { Metrics, SliderValues } from "./types.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

const parseJson = <T,>(value: string): T => JSON.parse(value) as T;

const toClientDesign = (design: {
  id: string;
  createdAt: Date;
  respondentType: string;
  postalCode4: string | null;
  ageGroup: string;
  slidersJson: string;
  metricsJson: string;
}) => ({
  id: design.id,
  createdAt: design.createdAt,
  respondentType: design.respondentType,
  postalCode4: design.postalCode4,
  ageGroup: design.ageGroup,
  sliders: parseJson<SliderValues>(design.slidersJson),
  metrics: parseJson<Metrics>(design.metricsJson),
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/projects", requireAdmin, async (req, res) => {
  const parsed = projectCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { intersections, zones, ...projectData } = parsed.data;
  const project = await prisma.project.create({
    data: {
      ...projectData,
      intersections: {
        create: intersections,
      },
      zones: {
        create: zones,
      },
    },
  });

  return res.status(201).json({ id: project.id });
});

app.get("/api/projects/:id", async (req, res) => {
  const project = await prisma.project.findUnique({
    where: { id: req.params.id },
    include: {
      intersections: true,
      zones: true,
      costConfigs: true,
    },
  });

  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }

  return res.json(project);
});

app.post("/api/projects/:id/designs", async (req, res) => {
  const parsed = designCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const project = await prisma.project.findUnique({
    where: { id: req.params.id },
    include: { intersections: true },
  });

  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }

  const metrics = simulateMetrics({
    baselineParkingPressure: project.baselineParkingPressure,
    baselineParkingSpots: project.baselineParkingSpots,
    intersectionCount: project.intersections.length,
    sliders: parsed.data.sliders,
  });

  const design = await prisma.residentDesign.create({
    data: {
      projectId: project.id,
      respondentType: parsed.data.respondentType,
      postalCode4: parsed.data.postalCode4,
      ageGroup: parsed.data.ageGroup,
      slidersJson: JSON.stringify(parsed.data.sliders),
      metricsJson: JSON.stringify(metrics),
      clientHash: req.header("user-agent") ?? "unknown",
    },
  });

  return res.status(201).json({
    id: design.id,
    metrics,
  });
});

app.get("/api/projects/:id/designs", requireAdmin, async (req, res) => {
  const designs = await prisma.residentDesign.findMany({
    where: { projectId: req.params.id },
    orderBy: { createdAt: "desc" },
  });

  return res.json(designs.map(toClientDesign));
});

const median = (values: number[]) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
};

const average = (values: number[]) =>
  values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;

const summarizeSliders = (designs: SliderValues[]) => {
  const keys = Object.keys(designs[0] ?? {}) as (keyof SliderValues)[];
  const summary: Record<string, { average: number; median: number }> = {};
  keys.forEach((key) => {
    const values = designs.map((design) => design[key]);
    summary[key] = { average: average(values), median: median(values) };
  });
  return summary;
};

const topCombinations = (designs: SliderValues[]) => {
  const counts = new Map<string, number>();
  designs.forEach((design) => {
    const key = JSON.stringify(design);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([key, count]) => ({ sliders: JSON.parse(key) as SliderValues, count }));
};

app.get("/api/projects/:id/insights", requireAdmin, async (req, res) => {
  const project = await prisma.project.findUnique({
    where: { id: req.params.id },
    include: {
      intersections: true,
      costConfigs: true,
    },
  });

  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }

  const designs = await prisma.residentDesign.findMany({
    where: { projectId: req.params.id },
    orderBy: { createdAt: "desc" },
  });

  const parsedDesigns = designs.map((design) =>
    parseJson<SliderValues>(design.slidersJson),
  );

  const summary = parsedDesigns.length
    ? summarizeSliders(parsedDesigns)
    : {};

  const consensusSliders: SliderValues = parsedDesigns.length
    ? {
        removedParkingSpots: summary.removedParkingSpots.median,
        addedGreenUnits: summary.addedGreenUnits.median,
        addedSharedCars: summary.addedSharedCars.median,
        addedBikeUnits: summary.addedBikeUnits.median,
        addedPublicSpace: summary.addedPublicSpace.median,
      }
    : {
        removedParkingSpots: 0,
        addedGreenUnits: 0,
        addedSharedCars: 0,
        addedBikeUnits: 0,
        addedPublicSpace: 0,
      };

  const consensusMetrics = simulateMetrics({
    baselineParkingPressure: project.baselineParkingPressure,
    baselineParkingSpots: project.baselineParkingSpots,
    intersectionCount: project.intersections.length,
    sliders: consensusSliders,
  });

  const baselineMetrics = simulateMetrics({
    baselineParkingPressure: project.baselineParkingPressure,
    baselineParkingSpots: project.baselineParkingSpots,
    intersectionCount: project.intersections.length,
    sliders: {
      removedParkingSpots: 0,
      addedGreenUnits: 0,
      addedSharedCars: 0,
      addedBikeUnits: 0,
      addedPublicSpace: 0,
    },
  });

  const costs = project.costConfigs.reduce(
    (acc, config) => {
      const unitCount =
        config.key === "removeParking"
          ? consensusSliders.removedParkingSpots
          : config.key === "greenUnit"
            ? consensusSliders.addedGreenUnits
            : config.key === "sharedCar"
              ? consensusSliders.addedSharedCars
              : config.key === "bikeUnit"
                ? consensusSliders.addedBikeUnits
                : config.key === "publicSpace"
                  ? consensusSliders.addedPublicSpace
                  : 0;

      acc.items.push({
        key: config.key,
        unitCost: config.unitCost,
        unitOpex: config.unitOpex,
        units: unitCount,
        capex: unitCount * config.unitCost,
        opex: unitCount * config.unitOpex,
      });

      acc.totalCapex += unitCount * config.unitCost;
      acc.totalOpex += unitCount * config.unitOpex;
      return acc;
    },
    { items: [] as Array<{ key: string; unitCost: number; unitOpex: number; units: number; capex: number; opex: number }>, totalCapex: 0, totalOpex: 0 },
  );

  return res.json({
    totalDesigns: designs.length,
    summary,
    topCombinations: parsedDesigns.length ? topCombinations(parsedDesigns) : [],
    consensus: {
      sliders: consensusSliders,
      metrics: consensusMetrics,
    },
    baselineMetrics,
    costs,
  });
});

const port = Number(process.env.PORT ?? 4000);

app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
