import type { LayoutJson, SliderValues } from "../utils/types";

const zoneColor = (type: string) => {
  if (type === "PARKING") return "fill-amber-400/70";
  if (type === "GREEN") return "fill-emerald-400/70";
  return "fill-slate-300/60";
};

const segmentColor = (type: string) => {
  if (type === "ROAD") return "fill-slate-500";
  if (type === "SIDEWALK") return "fill-slate-300";
  return "fill-slate-200";
};

const range = (count: number) => Array.from({ length: count }, (_, i) => i);

type LayoutPreviewProps = {
  layout: LayoutJson;
  sliders: SliderValues;
};

export const LayoutPreview = ({ layout, sliders }: LayoutPreviewProps) => {
  const parkingZones = layout.zones.filter((zone) => zone.type === "PARKING");
  const greenZones = layout.zones.filter((zone) => zone.type === "GREEN");

  const parkingRemoved = Math.min(parkingZones.length, sliders.removedParkingSpots);
  const visibleParking = parkingZones.slice(0, Math.max(parkingZones.length - parkingRemoved, 0));

  const extraGreenUnits = sliders.addedGreenUnits;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between pb-3">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Voorbeeldstraat
          </h3>
          <p className="text-xs text-slate-400">Realtime visualisatie op basis van sliders</p>
        </div>
        <div className="text-xs text-slate-500">
          Parkeerplekken actief: {visibleParking.length} / {parkingZones.length}
        </div>
      </div>
      <svg
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        className="h-64 w-full rounded-xl border border-slate-200 bg-slate-100"
      >
        {layout.segments.map((segment) => (
          <rect
            key={segment.id}
            x={segment.x}
            y={segment.y}
            width={segment.width}
            height={segment.height}
            className={segmentColor(segment.type)}
          />
        ))}
        {visibleParking.map((zone) => (
          <rect
            key={zone.id}
            x={zone.x}
            y={zone.y}
            width={zone.width}
            height={zone.height}
            className={zoneColor(zone.type)}
          />
        ))}
        {greenZones.map((zone) => (
          <rect
            key={zone.id}
            x={zone.x}
            y={zone.y}
            width={zone.width}
            height={zone.height}
            className={zoneColor(zone.type)}
          />
        ))}
        {range(extraGreenUnits).map((index) => (
          <rect
            key={`extra-green-${index}`}
            x={40 + index * 30}
            y={layout.height - 70}
            width={20}
            height={40}
            className="fill-emerald-500/80"
          />
        ))}
      </svg>
      <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-slate-500">
        <span>Groen toegevoegd: {sliders.addedGreenUnits}</span>
        <span>Deelauto hubs: {sliders.addedSharedCars}</span>
        <span>Fietsvoorzieningen: {sliders.addedBikeUnits}</span>
        <span>Stoepen/verblijfsruimte: {sliders.addedPublicSpace}</span>
        <span>Parkeerplekken verwijderd: {sliders.removedParkingSpots}</span>
      </div>
    </div>
  );
};
