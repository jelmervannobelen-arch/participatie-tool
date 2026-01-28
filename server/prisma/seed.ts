import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const layout = {
  width: 800,
  height: 360,
  segments: [
    { id: "road", x: 0, y: 120, width: 800, height: 120, type: "ROAD" },
    { id: "sidewalk-n", x: 0, y: 80, width: 800, height: 40, type: "SIDEWALK" },
    { id: "sidewalk-s", x: 0, y: 240, width: 800, height: 40, type: "SIDEWALK" }
  ],
  zones: [
    { id: "park-1", x: 40, y: 130, width: 120, height: 100, type: "PARKING" },
    { id: "park-2", x: 200, y: 130, width: 120, height: 100, type: "PARKING" },
    { id: "green-1", x: 560, y: 130, width: 160, height: 100, type: "GREEN" }
  ]
};

const run = async () => {
  const project = await prisma.project.create({
    data: {
      name: "Voorbeeldstraat Noord",
      areaName: "Binnenstad",
      baselineParkingPressure: 72,
      baselineParkingSpots: 48,
      layoutJson: JSON.stringify(layout),
      notes: "Voorbeeldproject voor de participatieavond.",
      intersections: {
        create: [
          { x: 120, y: 120 },
          { x: 420, y: 120 },
          { x: 680, y: 120 }
        ]
      },
      zones: {
        create: [
          {
            type: "PARKING",
            geometryJson: JSON.stringify({ x: 40, y: 130, width: 120, height: 100 }),
            capacity: 14
          },
          {
            type: "PARKING",
            geometryJson: JSON.stringify({ x: 200, y: 130, width: 120, height: 100 }),
            capacity: 12
          },
          {
            type: "GREEN",
            geometryJson: JSON.stringify({ x: 560, y: 130, width: 160, height: 100 }),
            capacity: 80
          }
        ]
      },
      costConfigs: {
        create: [
          { key: "removeParking", unitCost: 1200, unitOpex: 50 },
          { key: "greenUnit", unitCost: 450, unitOpex: 18 },
          { key: "sharedCar", unitCost: 9000, unitOpex: 1200 },
          { key: "bikeUnit", unitCost: 800, unitOpex: 35 },
          { key: "publicSpace", unitCost: 600, unitOpex: 25 }
        ]
      }
    }
  });

  console.log(`Seeded project ${project.id}`);
};

run()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
