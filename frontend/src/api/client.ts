import type { ThermalEvent, Statistics, GeoJSONCollection, Evidence } from '../types';

const BASE = '/api';

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(`${BASE}${url}`);
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export async function getHealth(): Promise<{ status: string; service: string }> {
  return fetchJSON('/health');
}

export async function getEvents(limit = 200): Promise<ThermalEvent[]> {
  return fetchJSON(`/events?limit=${limit}`);
}

export async function getEvent(eventId: string): Promise<ThermalEvent> {
  return fetchJSON(`/events/${eventId}`);
}

export async function getEventEvidence(eventId: string): Promise<Evidence> {
  return fetchJSON(`/events/${eventId}/evidence`);
}

export async function getEventHistory(eventId: string): Promise<ThermalEvent[]> {
  return fetchJSON(`/events/${eventId}/history`);
}

export async function getStatistics(): Promise<Statistics> {
  return fetchJSON('/statistics');
}

export async function getRiskEvents(limit = 50): Promise<ThermalEvent[]> {
  return fetchJSON(`/risk-events?limit=${limit}`);
}

export async function getGeoJSON(): Promise<GeoJSONCollection> {
  return fetchJSON('/events/geojson');
}
