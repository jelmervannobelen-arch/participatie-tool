import { z } from "zod";

export const sliderSchema = z.object({
  removedParkingSpots: z.number().int().min(0),
  addedGreenUnits: z.number().int().min(0),
  addedSharedCars: z.number().int().min(0),
  addedBikeUnits: z.number().int().min(0),
  addedPublicSpace: z.number().int().min(0),
});

export const projectCreateSchema = z.object({
  name: z.string().min(1),
  areaName: z.string().min(1),
  baselineParkingPressure: z.number().min(0).max(200),
  baselineParkingSpots: z.number().int().min(0),
  layoutJson: z.string().min(2),
  notes: z.string().optional(),
  intersections: z
    .array(z.object({ x: z.number(), y: z.number() }))
    .default([]),
  zones: z
    .array(
      z.object({
        type: z.enum(["PARKING", "GREEN", "OTHER"]),
        geometryJson: z.string().min(2),
        capacity: z.number().int().optional(),
      }),
    )
    .default([]),
});

export const designCreateSchema = z.object({
  respondentType: z
    .enum(["RESIDENT", "BUSINESS", "VISITOR", "UNKNOWN"])
    .default("UNKNOWN"),
  postalCode4: z.string().min(4).max(4).optional(),
  ageGroup: z
    .enum(["UNDER_18", "AGE_18_34", "AGE_35_54", "AGE_55_74", "AGE_75_PLUS", "UNKNOWN"])
    .default("UNKNOWN"),
  sliders: sliderSchema,
});
