-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "areaName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "baselineParkingPressure" REAL NOT NULL,
    "baselineParkingSpots" INTEGER NOT NULL,
    "layoutJson" TEXT NOT NULL,
    "notes" TEXT
);

-- CreateTable
CREATE TABLE "Intersection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "x" REAL NOT NULL,
    "y" REAL NOT NULL,
    CONSTRAINT "Intersection_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Zone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "geometryJson" TEXT NOT NULL,
    "capacity" INTEGER,
    CONSTRAINT "Zone_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ResidentDesign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondentType" TEXT NOT NULL,
    "postalCode4" TEXT,
    "ageGroup" TEXT NOT NULL,
    "slidersJson" TEXT NOT NULL,
    "metricsJson" TEXT NOT NULL,
    "clientHash" TEXT NOT NULL,
    CONSTRAINT "ResidentDesign_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CostConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "unitCost" REAL NOT NULL,
    "unitOpex" REAL NOT NULL,
    CONSTRAINT "CostConfig_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Intersection_projectId_idx" ON "Intersection"("projectId");

-- CreateIndex
CREATE INDEX "Zone_projectId_idx" ON "Zone"("projectId");

-- CreateIndex
CREATE INDEX "ResidentDesign_projectId_idx" ON "ResidentDesign"("projectId");

-- CreateIndex
CREATE INDEX "CostConfig_projectId_idx" ON "CostConfig"("projectId");
