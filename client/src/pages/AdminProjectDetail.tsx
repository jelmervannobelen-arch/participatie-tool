import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchProject } from "../utils/api";
import { LayoutPreview } from "../components/LayoutPreview";
import { MetricsPanel } from "../components/MetricsPanel";
import { emptySliders, simulateMetrics } from "../utils/simulation";
import type { LayoutJson, Project } from "../utils/types";

export const AdminProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchProject(id)
      .then((data) => setProject(data))
      .catch((err) => setError((err as Error).message));
  }, [id]);

  const layout = useMemo(() => {
    if (!project) return null;
    return JSON.parse(project.layoutJson) as LayoutJson;
  }, [project]);

  const baselineMetrics = useMemo(() => {
    if (!project) return null;
    return simulateMetrics({
      baselineParkingPressure: project.baselineParkingPressure,
      baselineParkingSpots: project.baselineParkingSpots,
      intersectionCount: project.intersections.length,
      sliders: emptySliders()
    });
  }, [project]);

  if (error) {
    return <div className="p-8 text-red-600">{error}</div>;
  }

  if (!project || !layout || !baselineMetrics) {
    return <div className="p-8 text-slate-500">Project laden...</div>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-sm text-slate-500">{project.areaName}</p>
        </div>
        <Link
          to={`/admin/projects/${project.id}/analysis`}
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
        >
          Analyse dashboard
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <LayoutPreview layout={layout} sliders={emptySliders()} />
        <MetricsPanel title="Baseline metrics" metrics={baselineMetrics} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Referentiemodel
        </h2>
        <div className="mt-4 grid gap-4 text-sm text-slate-600 md:grid-cols-2">
          <div>
            <p className="font-semibold text-slate-700">Notities</p>
            <p>{project.notes || "Geen notities"}</p>
          </div>
          <div>
            <p className="font-semibold text-slate-700">Baselines</p>
            <ul className="list-disc pl-5">
              <li>Parkeerdruk: {project.baselineParkingPressure}</li>
              <li>Parkeerplaatsen: {project.baselineParkingSpots}</li>
              <li>Kruispunten: {project.intersections.length}</li>
              <li>Zones gemarkeerd: {project.zones.length}</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 text-xs text-slate-500">
          Publieke link: <span className="font-mono">/p/{project.id}</span>
        </div>
      </div>
    </div>
  );
};
