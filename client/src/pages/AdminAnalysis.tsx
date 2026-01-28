import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchDesigns, fetchInsights, fetchProject } from "../utils/api";
import type { Design, Insights, Project } from "../utils/types";
import { MetricsPanel } from "../components/MetricsPanel";

export const AdminAnalysis = () => {
  const { id } = useParams();
  const [adminToken, setAdminToken] = useState("");
  const [project, setProject] = useState<Project | null>(null);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchProject(id)
      .then((data) => setProject(data))
      .catch((err) => setError((err as Error).message));
  }, [id]);

  const loadAdminData = async () => {
    if (!id) return;
    setError(null);
    try {
      const [designData, insightsData] = await Promise.all([
        fetchDesigns(id, adminToken),
        fetchInsights(id, adminToken)
      ]);
      setDesigns(designData);
      setInsights(insightsData);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const filteredDesigns = useMemo(() => designs, [designs]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-8">
      <div>
        <h1 className="text-2xl font-bold">Analyse dashboard</h1>
        <p className="text-sm text-slate-500">{project?.name}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Admin toegang
        </h2>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <input
            type="password"
            placeholder="Admin token"
            className="w-64 rounded-lg border border-slate-200 p-2"
            value={adminToken}
            onChange={(event) => setAdminToken(event.target.value)}
          />
          <button
            onClick={loadAdminData}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Laad ontwerpen & insights
          </button>
        </div>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      </div>

      {insights ? (
        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Consensus ontwerp
              </h2>
              <div className="mt-3 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                {Object.entries(insights.consensus.sliders).map(([key, value]) => (
                  <div key={key} className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs uppercase text-slate-400">{key}</p>
                    <p className="text-lg font-semibold text-slate-800">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <MetricsPanel title="Consensus metrics" metrics={insights.consensus.metrics} />
                <MetricsPanel title="Baseline" metrics={insights.baselineMetrics} />
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Top combinaties
              </h2>
              <div className="mt-3 space-y-3 text-sm text-slate-600">
                {insights.topCombinations.length ? (
                  insights.topCombinations.map((combo, index) => (
                    <div key={index} className="rounded-lg bg-slate-50 p-3">
                      <p className="text-xs uppercase text-slate-400">#{index + 1}</p>
                      <pre className="text-xs text-slate-600">
                        {JSON.stringify(combo.sliders, null, 2)}
                      </pre>
                      <p className="text-xs text-slate-500">Aantal: {combo.count}</p>
                    </div>
                  ))
                ) : (
                  <p>Geen combinaties beschikbaar.</p>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Kostenraming
              </h2>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                {insights.costs.items.map((item) => (
                  <div key={item.key} className="flex justify-between">
                    <span>{item.key}</span>
                    <span>€ {item.capex.toFixed(0)} | € {item.opex.toFixed(0)} /jr</span>
                  </div>
                ))}
                <div className="mt-2 border-t border-slate-200 pt-2 font-semibold">
                  <div className="flex justify-between">
                    <span>Totaal CAPEX</span>
                    <span>€ {insights.costs.totalCapex.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Totaal OPEX</span>
                    <span>€ {insights.costs.totalOpex.toFixed(0)} /jr</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Overzicht inzendingen
              </h2>
              <p className="text-sm text-slate-600">Totaal: {insights.totalDesigns}</p>
              <div className="mt-2 text-xs text-slate-500">
                Gemiddelden per slider:
                <pre className="mt-2 rounded-lg bg-slate-50 p-2 text-xs">
                  {JSON.stringify(insights.summary, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Ontwerpen tabel
        </h2>
        {filteredDesigns.length ? (
          <div className="mt-3 overflow-auto">
            <table className="min-w-full text-sm text-slate-600">
              <thead className="text-left text-xs uppercase text-slate-400">
                <tr>
                  <th className="py-2">Datum</th>
                  <th>Type</th>
                  <th>Leeftijd</th>
                  <th>Sliders</th>
                  <th>Metrics</th>
                </tr>
              </thead>
              <tbody>
                {filteredDesigns.map((design) => (
                  <tr key={design.id} className="border-t border-slate-100">
                    <td className="py-2">{new Date(design.createdAt).toLocaleString()}</td>
                    <td>{design.respondentType}</td>
                    <td>{design.ageGroup}</td>
                    <td>
                      <pre className="text-xs text-slate-500">
                        {JSON.stringify(design.sliders, null, 1)}
                      </pre>
                    </td>
                    <td>
                      <pre className="text-xs text-slate-500">
                        {JSON.stringify(design.metrics, null, 1)}
                      </pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-500">Nog geen ontwerpen geladen.</p>
        )}
      </div>
    </div>
  );
};
