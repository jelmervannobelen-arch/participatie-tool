import type { Design, Insights, Project, SliderValues } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:4000";

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "API error");
  }
  return response.json() as Promise<T>;
};

export const fetchProject = (id: string) =>
  fetch(`${API_BASE}/api/projects/${id}`).then((res) =>
    handleResponse<Project>(res)
  );

export const createProject = (data: Record<string, unknown>, adminToken: string) =>
  fetch(`${API_BASE}/api/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-token": adminToken
    },
    body: JSON.stringify(data)
  }).then((res) => handleResponse<{ id: string }>(res));

export const submitDesign = (projectId: string, payload: {
  respondentType: string;
  postalCode4?: string;
  ageGroup: string;
  sliders: SliderValues;
}) =>
  fetch(`${API_BASE}/api/projects/${projectId}/designs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).then((res) => handleResponse<{ id: string; metrics: Record<string, number> }>(res));

export const fetchDesigns = (projectId: string, adminToken: string) =>
  fetch(`${API_BASE}/api/projects/${projectId}/designs`, {
    headers: { "x-admin-token": adminToken }
  }).then((res) => handleResponse<Design[]>(res));

export const fetchInsights = (projectId: string, adminToken: string) =>
  fetch(`${API_BASE}/api/projects/${projectId}/insights`, {
    headers: { "x-admin-token": adminToken }
  }).then((res) => handleResponse<Insights>(res));
