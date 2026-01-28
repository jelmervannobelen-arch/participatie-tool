import type { Metrics } from "../utils/types";

const metricLabel: Record<keyof Metrics, string> = {
  parkingPressure: "Parkeerdruk",
  livability: "Leefbaarheid",
  biodiversity: "Biodiversiteit",
  safety: "Verkeersveiligheid",
  heatStress: "Hittestress",
  accessibility: "Toegankelijkheid"
};

type MetricsPanelProps = {
  title: string;
  metrics: Metrics;
};

export const MetricsPanel = ({ title, metrics }: MetricsPanelProps) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
      {title}
    </h3>
    <div className="mt-4 space-y-3">
      {(Object.keys(metrics) as (keyof Metrics)[]).map((key) => (
        <div key={key}>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{metricLabel[key]}</span>
            <span className="font-semibold text-slate-800">
              {metrics[key].toFixed(1)}
            </span>
          </div>
          <div className="mt-1 h-2 w-full rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-emerald-500"
              style={{
                width: `${Math.min(metrics[key], 100)}%`
              }}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);
