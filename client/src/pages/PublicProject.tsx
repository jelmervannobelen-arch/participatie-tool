import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { LayoutPreview } from "../components/LayoutPreview";
import { MetricsPanel } from "../components/MetricsPanel";
import { SliderControl, updateSlider } from "../components/SliderControl";
import { fetchProject, submitDesign } from "../utils/api";
import { emptySliders, simulateMetrics } from "../utils/simulation";
import type { LayoutJson, Project, SliderValues } from "../utils/types";

const respondentOptions = [
  { label: "Bewoner", value: "RESIDENT" },
  { label: "Ondernemer", value: "BUSINESS" },
  { label: "Bezoeker", value: "VISITOR" },
  { label: "Onbekend", value: "UNKNOWN" }
];

const ageOptions = [
  { label: "< 18", value: "UNDER_18" },
  { label: "18-34", value: "AGE_18_34" },
  { label: "35-54", value: "AGE_35_54" },
  { label: "55-74", value: "AGE_55_74" },
  { label: "75+", value: "AGE_75_PLUS" },
  { label: "Onbekend", value: "UNKNOWN" }
];

export const PublicProject = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [sliders, setSliders] = useState<SliderValues>(emptySliders());
  const [status, setStatus] = useState<string | null>(null);
  const [respondentType, setRespondentType] = useState("RESIDENT");
  const [ageGroup, setAgeGroup] = useState("UNKNOWN");
  const [postalCode4, setPostalCode4] = useState("");

  useEffect(() => {
    if (!projectId) return;
    fetchProject(projectId)
      .then((data) => setProject(data))
      .catch((err) => setStatus((err as Error).message));
  }, [projectId]);

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

  const currentMetrics = useMemo(() => {
    if (!project) return null;
    return simulateMetrics({
      baselineParkingPressure: project.baselineParkingPressure,
      baselineParkingSpots: project.baselineParkingSpots,
      intersectionCount: project.intersections.length,
      sliders
    });
  }, [project, sliders]);

  const limits = {
    removedParkingSpots: Math.min(project?.baselineParkingSpots ?? 20, 40),
    addedGreenUnits: 10,
    addedSharedCars: 6,
    addedBikeUnits: 12,
    addedPublicSpace: 10
  };

  const handleSubmit = async () => {
    if (!projectId) return;
    setStatus(null);
    try {
      const response = await submitDesign(projectId, {
        respondentType,
        ageGroup,
        postalCode4: postalCode4 || undefined,
        sliders
      });
      setStatus(`Ontwerp opgeslagen! Ontwerp-ID: ${response.id}`);
    } catch (error) {
      setStatus((error as Error).message);
    }
  };

  if (!project || !layout || !baselineMetrics || !currentMetrics) {
    return <div className="p-8 text-slate-500">Project laden...</div>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-8">
      <div>
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <p className="text-sm text-slate-500">{project.areaName}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <LayoutPreview layout={layout} sliders={sliders} />
        <div className="space-y-4">
          <MetricsPanel title="Baseline" metrics={baselineMetrics} />
          <MetricsPanel title="Jouw ontwerp" metrics={currentMetrics} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SliderControl
          label="Parkeerplaatsen verwijderen"
          value={sliders.removedParkingSpots}
          min={0}
          max={limits.removedParkingSpots}
          onChange={(value) =>
            setSliders((prev) => updateSlider(prev, "removedParkingSpots", value))
          }
          description="Verkleint het aantal parkeerplekken en verhoogt de druk."
        />
        <SliderControl
          label="Groen toevoegen"
          value={sliders.addedGreenUnits}
          min={0}
          max={limits.addedGreenUnits}
          onChange={(value) => setSliders((prev) => updateSlider(prev, "addedGreenUnits", value))}
          description="Verbetering van biodiversiteit en leefbaarheid."
        />
        <SliderControl
          label="Deelauto hubs toevoegen"
          value={sliders.addedSharedCars}
          min={0}
          max={limits.addedSharedCars}
          onChange={(value) => setSliders((prev) => updateSlider(prev, "addedSharedCars", value))}
          description="Deelauto's verminderen parkeerdruk."
        />
        <SliderControl
          label="Fietsvoorzieningen toevoegen"
          value={sliders.addedBikeUnits}
          min={0}
          max={limits.addedBikeUnits}
          onChange={(value) => setSliders((prev) => updateSlider(prev, "addedBikeUnits", value))}
          description="Meer fietsvoorzieningen verhogen veiligheid."
        />
        <SliderControl
          label="Verblijfsruimte/stoepen vergroten"
          value={sliders.addedPublicSpace}
          min={0}
          max={limits.addedPublicSpace}
          onChange={(value) => setSliders((prev) => updateSlider(prev, "addedPublicSpace", value))}
          description="Meer ruimte voor ontmoeten en verblijven."
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Sla jouw ontwerp op</h2>
        <p className="text-sm text-slate-500">
          Dit helpt het ontwerpteam de keuzes te analyseren. Gegevens blijven anoniem.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="text-sm text-slate-600">
            Postcode (4 cijfers)
            <input
              className="mt-1 w-full rounded-lg border border-slate-200 p-2"
              maxLength={4}
              value={postalCode4}
              onChange={(event) => setPostalCode4(event.target.value.replace(/\D/g, ""))}
            />
          </label>
          <label className="text-sm text-slate-600">
            Leeftijdscategorie
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 p-2"
              value={ageGroup}
              onChange={(event) => setAgeGroup(event.target.value)}
            >
              {ageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-slate-600">
            Type respondent
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 p-2"
              value={respondentType}
              onChange={(event) => setRespondentType(event.target.value)}
            >
              {respondentOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button
          onClick={handleSubmit}
          className="mt-4 rounded-lg bg-emerald-600 px-6 py-2 text-sm font-semibold text-white"
        >
          Ontwerp opslaan
        </button>
        {status ? <p className="mt-3 text-sm text-slate-600">{status}</p> : null}
      </div>
    </div>
  );
};
