"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import {
  getCategoryHexColor,
  getCategoryLabel,
  getEraLabel,
  formatYear,
} from "@/lib/utils";

// ── Types ──

interface PersonData {
  id: string;
  name: { ko: string; en: string; original?: string };
  era: string;
  period: { start: number; end: number; approximate?: boolean };
  location: { lat: number; lng: number; region: string };
  category: string;
  summary: string;
  mvp?: boolean;
}

interface ReligionData {
  id: string;
  name: { ko: string; en: string };
  type: string;
  region: string[];
  origin: { year: number; location: string };
  summary: string;
}

interface ReligionWithCoords extends ReligionData {
  lat: number;
  lng: number;
}

export interface WorldMapProps {
  persons: PersonData[];
  religions: ReligionData[];
  categoryFilter: string;
  eraFilter: string;
  onViewportPersons?: (persons: PersonData[]) => void;
}

// ── Religion origin coordinate mapping ──

const RELIGION_COORDS: Record<string, { lat: number; lng: number }> = {
  christianity: { lat: 31.77, lng: 35.23 },
  islam: { lat: 21.42, lng: 39.83 },
  buddhism: { lat: 27.48, lng: 83.27 },
  hinduism: { lat: 25.32, lng: 82.99 },
  "greek-mythology": { lat: 37.97, lng: 23.72 },
  "norse-mythology": { lat: 59.33, lng: 18.07 },
  "egyptian-mythology": { lat: 25.69, lng: 32.64 },
  "mesopotamian-mythology": { lat: 32.54, lng: 44.42 },
  "celtic-mythology": { lat: 53.35, lng: -6.26 },
  judaism: { lat: 31.77, lng: 35.23 },
  confucianism: { lat: 35.6, lng: 116.99 },
  shinto: { lat: 34.68, lng: 135.5 },
};

// ── Cluster logic ──

interface ClusterGroup {
  lat: number;
  lng: number;
  persons: PersonData[];
}

function clusterPersons(
  persons: PersonData[],
  zoom: number
): ClusterGroup[] {
  // At high zoom, don't cluster
  if (zoom >= 7) {
    return persons.map((p) => ({
      lat: p.location.lat,
      lng: p.location.lng,
      persons: [p],
    }));
  }

  const threshold = Math.max(2, 40 / Math.pow(2, zoom));
  const clusters: ClusterGroup[] = [];
  const assigned = new Set<number>();

  for (let i = 0; i < persons.length; i++) {
    if (assigned.has(i)) continue;

    const group: PersonData[] = [persons[i]];
    assigned.add(i);

    let sumLat = persons[i].location.lat;
    let sumLng = persons[i].location.lng;

    for (let j = i + 1; j < persons.length; j++) {
      if (assigned.has(j)) continue;
      const dLat = Math.abs(persons[i].location.lat - persons[j].location.lat);
      const dLng = Math.abs(persons[i].location.lng - persons[j].location.lng);
      if (dLat < threshold && dLng < threshold) {
        group.push(persons[j]);
        assigned.add(j);
        sumLat += persons[j].location.lat;
        sumLng += persons[j].location.lng;
      }
    }

    clusters.push({
      lat: sumLat / group.length,
      lng: sumLng / group.length,
      persons: group,
    });
  }

  return clusters;
}

// ── Viewport tracker ──

function ViewportTracker({
  persons,
  onViewportPersons,
}: {
  persons: PersonData[];
  onViewportPersons: (persons: PersonData[]) => void;
}) {
  const map = useMap();

  const updateViewport = useCallback(() => {
    const bounds = map.getBounds();
    const visible = persons.filter((p) =>
      bounds.contains(L.latLng(p.location.lat, p.location.lng))
    );
    onViewportPersons(visible);
  }, [map, persons, onViewportPersons]);

  useMapEvents({
    moveend: updateViewport,
    zoomend: updateViewport,
  });

  useEffect(() => {
    updateViewport();
  }, [updateViewport]);

  return null;
}

// ── Zoom tracker ──

function ZoomTracker({ onZoomChange }: { onZoomChange: (z: number) => void }) {
  const map = useMap();

  useMapEvents({
    zoomend: () => {
      onZoomChange(map.getZoom());
    },
  });

  useEffect(() => {
    onZoomChange(map.getZoom());
  }, [map, onZoomChange]);

  return null;
}

// ── Dominant category for cluster color ──

function getDominantCategory(persons: PersonData[]): string {
  const counts: Record<string, number> = {};
  for (const p of persons) {
    counts[p.category] = (counts[p.category] || 0) + 1;
  }
  let max = 0;
  let dominant = persons[0]?.category || "philosopher";
  for (const [cat, count] of Object.entries(counts)) {
    if (count > max) {
      max = count;
      dominant = cat;
    }
  }
  return dominant;
}

// ── Person detail link ──

function getPersonLink(person: PersonData): string {
  if (person.category === "philosopher") return `/philosophy/${person.id}/`;
  return `/persons/${person.id}/`;
}

// ── Main Component ──

export default function WorldMap({
  persons,
  religions,
  categoryFilter,
  eraFilter,
  onViewportPersons,
}: WorldMapProps) {
  const [zoom, setZoom] = useState(3);

  const filteredPersons = useMemo(() => {
    return persons.filter((p) => {
      if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
      if (eraFilter !== "all" && p.era !== eraFilter) return false;
      return true;
    });
  }, [persons, categoryFilter, eraFilter]);

  const clusters = useMemo(
    () => clusterPersons(filteredPersons, zoom),
    [filteredPersons, zoom]
  );

  const religionsWithCoords = useMemo<ReligionWithCoords[]>(() => {
    return religions
      .map((r) => {
        const coords = RELIGION_COORDS[r.id];
        if (!coords) return null;
        return { ...r, ...coords };
      })
      .filter(Boolean) as ReligionWithCoords[];
  }, [religions]);

  const handleViewportPersons = useCallback(
    (vp: PersonData[]) => {
      onViewportPersons?.(vp);
    },
    [onViewportPersons]
  );

  return (
    <MapContainer
      center={[35, 50]}
      zoom={3}
      minZoom={2}
      maxZoom={12}
      scrollWheelZoom={true}
      className="w-full h-full rounded-xl"
      style={{ background: "#1a1a2e" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      <ZoomTracker onZoomChange={setZoom} />

      {onViewportPersons && (
        <ViewportTracker
          persons={filteredPersons}
          onViewportPersons={handleViewportPersons}
        />
      )}

      {/* Religion origin markers */}
      {categoryFilter === "all" && religionsWithCoords.map((r) => (
        <CircleMarker
          key={`religion-${r.id}`}
          center={[r.lat, r.lng]}
          radius={zoom >= 5 ? 10 : 8}
          pathOptions={{
            color: r.type === "religion" ? "#F59E0B" : "#10B981",
            fillColor: r.type === "religion" ? "#F59E0B" : "#10B981",
            fillOpacity: 0.25,
            weight: 2,
            dashArray: "4 4",
          }}
        >
          <Popup>
            <div className="min-w-[200px]">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{
                    backgroundColor:
                      r.type === "religion" ? "#F59E0B" : "#10B981",
                  }}
                />
                <span className="text-xs font-medium uppercase tracking-wide" style={{ color: r.type === "religion" ? "#F59E0B" : "#10B981" }}>
                  {r.type === "religion" ? "종교" : "신화"}
                </span>
              </div>
              <h3 className="font-bold text-sm mb-0.5">
                {r.name.ko}
              </h3>
              <p className="text-xs text-gray-500 mb-1">
                {r.name.en} | {formatYear(r.origin.year)}
              </p>
              <p className="text-xs leading-relaxed mb-2 line-clamp-3">
                {r.summary}
              </p>
              <Link
                href={`/religion/${r.id}/`}
                className="text-xs font-medium text-purple-600 hover:text-purple-800"
              >
                상세 보기 &rarr;
              </Link>
            </div>
          </Popup>
        </CircleMarker>
      ))}

      {/* Person clusters/markers */}
      {clusters.map((cluster, idx) => {
        const isCluster = cluster.persons.length > 1;
        const radius = isCluster
          ? Math.min(6 + Math.log2(cluster.persons.length) * 4, 20)
          : zoom >= 5
          ? 7
          : 6;

        const color = isCluster
          ? getCategoryHexColor(getDominantCategory(cluster.persons))
          : getCategoryHexColor(cluster.persons[0].category);

        return (
          <CircleMarker
            key={`cluster-${idx}`}
            center={[cluster.lat, cluster.lng]}
            radius={radius}
            pathOptions={{
              color: color,
              fillColor: color,
              fillOpacity: isCluster ? 0.5 : 0.7,
              weight: isCluster ? 2 : 1.5,
            }}
          >
            <Popup maxWidth={300}>
              <div className="min-w-[220px] max-h-[300px] overflow-y-auto">
                {isCluster ? (
                  <>
                    <div className="flex items-center gap-2 mb-2 pb-1 border-b border-gray-200">
                      <span className="font-bold text-sm">
                        {cluster.persons.length}명의 인물
                      </span>
                    </div>
                    <div className="space-y-2">
                      {cluster.persons.slice(0, 10).map((p) => (
                        <div key={p.id} className="flex items-start gap-2">
                          <span
                            className="inline-block w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                            style={{
                              backgroundColor: getCategoryHexColor(p.category),
                            }}
                          />
                          <div className="min-w-0">
                            <Link
                              href={getPersonLink(p)}
                              className="text-xs font-semibold hover:text-purple-600 block truncate"
                            >
                              {p.name.ko}
                            </Link>
                            <span className="text-[10px] text-gray-500">
                              {getCategoryLabel(p.category)} |{" "}
                              {formatYear(p.period.start)}~
                              {formatYear(p.period.end)}
                            </span>
                          </div>
                        </div>
                      ))}
                      {cluster.persons.length > 10 && (
                        <p className="text-[10px] text-gray-400 pt-1">
                          +{cluster.persons.length - 10}명 더...
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  (() => {
                    const p = cluster.persons[0];
                    return (
                      <>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="inline-block w-2 h-2 rounded-full"
                            style={{
                              backgroundColor: getCategoryHexColor(p.category),
                            }}
                          />
                          <span
                            className="text-xs font-medium"
                            style={{ color: getCategoryHexColor(p.category) }}
                          >
                            {getCategoryLabel(p.category)}
                          </span>
                          <span className="text-xs text-gray-400">
                            {getEraLabel(p.era)}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm mb-0.5">
                          {p.name.ko}
                        </h3>
                        <p className="text-xs text-gray-500 mb-1">
                          {p.name.en} | {formatYear(p.period.start)}~
                          {formatYear(p.period.end)}
                        </p>
                        <p className="text-xs leading-relaxed mb-2 line-clamp-3">
                          {p.summary}
                        </p>
                        <Link
                          href={getPersonLink(p)}
                          className="text-xs font-medium text-purple-600 hover:text-purple-800"
                        >
                          상세 보기 &rarr;
                        </Link>
                      </>
                    );
                  })()
                )}
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
