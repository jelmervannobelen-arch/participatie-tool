import type { SliderValues } from "../utils/types";

type SliderControlProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  description?: string;
};

export const SliderControl = ({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  description
}: SliderControlProps) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-slate-700">{label}</p>
        {description ? (
          <p className="text-xs text-slate-400">{description}</p>
        ) : null}
      </div>
      <span className="text-lg font-bold text-slate-900">{value}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="mt-3 w-full accent-emerald-500"
    />
    <div className="mt-2 flex justify-between text-xs text-slate-400">
      <span>{min}</span>
      <span>{max}</span>
    </div>
  </div>
);

export type SliderLimits = {
  removedParkingSpots: number;
  addedGreenUnits: number;
  addedSharedCars: number;
  addedBikeUnits: number;
  addedPublicSpace: number;
};

export const updateSlider = (
  sliders: SliderValues,
  key: keyof SliderValues,
  value: number
): SliderValues => ({
  ...sliders,
  [key]: value
});
