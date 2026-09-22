import { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { GeoJSONCollection } from '../types';

interface Props {
  geojson: GeoJSONCollection | null;
  onSelectEvent: (eventId: string) => void;
  selectedEventId: string | null;
}

function riskColor(level: string | null): string {
  switch (level) {
    case 'CRITICAL': return '#ef4444';
    case 'HIGH': return '#f97316';
    case 'MEDIUM': return '#eab308';
    case 'LOW': return '#3b82f6';
    default: return '#64748b';
  }
}

function frpRadius(frp: number | null): number {
  if (!frp || frp <= 0) return 5;
  if (frp < 5) return 5;
  if (frp < 20) return 7;
  if (frp < 50) return 9;
  return 12;
}

export default function ThermalMap({ geojson, onSelectEvent, selectedEventId }: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [22.5, 78.9],
      zoom: 5,
      minZoom: 3,
      maxBounds: [
        [-90, -180],
        [90, 180]
      ],
      maxBoundsViscosity: 1.0,
      zoomControl: true,
      attributionControl: true,
    });

    // Use standard OSM tiles, but we'll invert them via CSS for a dark theme without API keys
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
      noWrap: true
    }).addTo(map);

    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Render markers from GeoJSON
  useEffect(() => {
    if (!mapRef.current || !layerRef.current || !geojson) return;

    layerRef.current.clearLayers();

    geojson.features.forEach((feature) => {
      const { coordinates } = feature.geometry;
      const p = feature.properties;
      const color = riskColor(p.risk_level);
      const radius = frpRadius(p.frp);
      const isSelected = p.event_id === selectedEventId;

      const marker = L.circleMarker([coordinates[1], coordinates[0]], {
        radius: isSelected ? radius + 3 : radius,
        fillColor: color,
        color: isSelected ? '#ffffff' : color,
        weight: isSelected ? 2 : 1,
        opacity: 0.9,
        fillOpacity: isSelected ? 0.9 : 0.6,
      });

      marker.bindTooltip(
        `<div style="font-family:Inter,sans-serif;font-size:11px;line-height:1.5;">
          <strong>${p.event_id}</strong><br/>
          FRP: ${p.frp ?? 'N/A'} MW<br/>
          Risk: ${p.risk_level ?? 'Unknown'}<br/>
          ${p.is_anomalous ? '<span style="color:#f97316">⚠ Anomalous</span>' : ''}
        </div>`,
        { direction: 'top', offset: [0, -8] }
      );

      marker.on('click', () => {
        onSelectEvent(p.event_id);
      });
      
      marker.addTo(layerRef.current!);

      if (isSelected && mapRef.current) {
        mapRef.current.panTo([coordinates[1], coordinates[0]], { animate: true, duration: 0.5 });
      }
    });
  }, [geojson, selectedEventId, onSelectEvent]);

  return (
    <div ref={containerRef} className="w-full h-full" />
  );
}
