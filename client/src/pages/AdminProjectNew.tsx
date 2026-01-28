import { useState } from "react";
import { createProject } from "../utils/api";

const sampleLayout = JSON.stringify(
  {
    width: 800,
    height: 360,
    segments: [
      { id: "road", x: 0, y: 120, width: 800, height: 120, type: "ROAD" },
      { id: "sidewalk-n", x: 0, y: 80, width: 800, height: 40, type: "SIDEWALK" },
      { id: "sidewalk-s", x: 0, y: 240, width: 800, height: 40, type: "SIDEWALK" }
    ],
    zones: [
      { id: "park-1", x: 40, y: 130, width: 120, height: 100, type: "PARKING" },
      { id: "green-1", x: 560, y: 130, width: 160, height: 100, type: "GREEN" }
    ]
  },
  null,
  2
);

const sampleIntersections = JSON.stringify(
  [
    { x: 120, y: 120 },
    { x: 420, y: 120 }
  ],
  null,
  2
);

const sampleZones = JSON.stringify(
  [
    {
      type: "PARKING",
      geometryJson: "{\"x\":40,\"y\":130,\"width\":120,\"height\":100}",
      capacity: 14
    },
    {
      type: "GREEN",
      geometryJson: "{\"x\":560,\"y\":130,\"width\":160,\"height\":100}",
      capacity: 80
    }
  ],
  null,
  2
);

export const AdminProjectNew = () => {
  const [form, setForm] = useState({
    name: "Voorbeeldstraat",
    areaName: "Binnenstad",
    baselineParkingPressure: 72,
    baselineParkingSpots: 48,
    notes: "",
    layoutJson: sampleLayout,
    intersections: sampleIntersections,
    zones: sampleZones
  });
  const [adminToken, setAdminToken] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setStatus(null);
    try {
      const payload = {
        name: form.name,
        areaName: form.areaName,
        baselineParkingPressure: Number(form.baselineParkingPressure),
        baselineParkingSpots: Number(form.baselineParkingSpots),
        notes: form.notes || undefined,
        layoutJson: form.layoutJson,
        intersections: JSON.parse(form.intersections),
        zones: JSON.parse(form.zones)
      };

      const response = await createProject(payload, adminToken);
      setProjectId(response.id);
      setStatus("Project aangemaakt!");
    } catch (error) {
      setStatus((error as Error).message);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-8">
      <div>
        <h1 className="text-2xl font-bold">Nieuw project aanmaken</h1>
        <p className="text-sm text-slate-500">
          Vul de baseline en upload een eenvoudige JSON layout.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="block text-sm font-medium text-slate-600">
            Projectnaam
            <input
              className="mt-1 w-full rounded-lg border border-slate-200 p-2"
              value={form.name}
              onChange={(event) => handleChange("name", event.target.value)}
            />
          </label>
          <label className="block text-sm font-medium text-slate-600">
            Buurt/wijk
            <input
              className="mt-1 w-full rounded-lg border border-slate-200 p-2"
              value={form.areaName}
              onChange={(event) => handleChange("areaName", event.target.value)}
            />
          </label>
          <label className="block text-sm font-medium text-slate-600">
            Baseline parkeerdruk (0-200)
            <input
              type="number"
              className="mt-1 w-full rounded-lg border border-slate-200 p-2"
              value={form.baselineParkingPressure}
              onChange={(event) => handleChange("baselineParkingPressure", event.target.value)}
            />
          </label>
          <label className="block text-sm font-medium text-slate-600">
            Aantal parkeerplaatsen (baseline)
            <input
              type="number"
              className="mt-1 w-full rounded-lg border border-slate-200 p-2"
              value={form.baselineParkingSpots}
              onChange={(event) => handleChange("baselineParkingSpots", event.target.value)}
            />
          </label>
          <label className="block text-sm font-medium text-slate-600">
            Notities
            <textarea
              className="mt-1 w-full rounded-lg border border-slate-200 p-2"
              rows={3}
              value={form.notes}
              onChange={(event) => handleChange("notes", event.target.value)}
            />
          </label>
          <label className="block text-sm font-medium text-slate-600">
            Admin token
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-slate-200 p-2"
              value={adminToken}
              onChange={(event) => setAdminToken(event.target.value)}
            />
          </label>
          <button
            onClick={handleSubmit}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Project opslaan
          </button>
          {status ? <p className="text-sm text-slate-600">{status}</p> : null}
          {projectId ? (
            <div className="rounded-lg bg-slate-100 p-3 text-xs text-slate-600">
              Project ID: {projectId}
              <div className="mt-2 flex flex-wrap gap-2">
                <a
                  className="text-emerald-600 underline"
                  href={`/admin/projects/${projectId}`}
                >
                  Admin detail
                </a>
                <a className="text-emerald-600 underline" href={`/p/${projectId}`}>
                  Publieke pagina
                </a>
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-600">
            Layout JSON
            <textarea
              className="mt-1 h-48 w-full rounded-lg border border-slate-200 p-2 font-mono text-xs"
              value={form.layoutJson}
              onChange={(event) => handleChange("layoutJson", event.target.value)}
            />
          </label>
          <label className="block text-sm font-medium text-slate-600">
            Intersections JSON
            <textarea
              className="mt-1 h-32 w-full rounded-lg border border-slate-200 p-2 font-mono text-xs"
              value={form.intersections}
              onChange={(event) => handleChange("intersections", event.target.value)}
            />
          </label>
          <label className="block text-sm font-medium text-slate-600">
            Zones JSON
            <textarea
              className="mt-1 h-40 w-full rounded-lg border border-slate-200 p-2 font-mono text-xs"
              value={form.zones}
              onChange={(event) => handleChange("zones", event.target.value)}
            />
          </label>
        </div>
      </div>
    </div>
  );
};
