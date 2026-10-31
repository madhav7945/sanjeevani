// Generated with Antigravity / Gemini, reviewed and modified by the team
// CTBF-AI-12: Dynamic Leaflet Map Component (Google Maps Navigation Puck & Topographic Routing)

'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Crosshair, Layers, Plus, Minus } from 'lucide-react';
import { useFloodApp } from '../../context/FloodAppContext';
import { ROAD_EDGES } from '../../data/roadNetworkGraph';

function calculateBearing(p1: [number, number], p2: [number, number]): number {
  const dLon = ((p2[1] - p1[1]) * Math.PI) / 180;
  const lat1 = (p1[0] * Math.PI) / 180;
  const lat2 = (p2[0] * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return (Math.atan2(y, x) * (180 / Math.PI) + 360) % 360;
}

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 12, { animate: true });
  }, [center, map]);
  return null;
}

function NavigationCameraController({
  active,
  coords,
  recenterTrigger,
}: {
  active: boolean;
  coords: [number, number];
  recenterTrigger?: number;
}) {
  const map = useMap();
  useEffect(() => {
    if (active && coords) {
      map.flyTo(coords, 14, { duration: 1.2 });
    }
  }, [active, coords, recenterTrigger, map]);
  return null;
}

function MapFloatingControls({
  centerCoords,
  mapStyle,
  setMapStyle,
  isNavigating,
}: {
  centerCoords: [number, number];
  mapStyle: 'streets' | 'satellite';
  setMapStyle: (s: 'streets' | 'satellite') => void;
  isNavigating: boolean;
}) {
  const map = useMap();

  // If navigating, navigation tab provides Google Maps HUD buttons
  if (isNavigating) return null;

  return (
    <div className="absolute right-3.5 top-28 z-[500] flex flex-col gap-2 select-none">
      {/* Recenter / My Location Button */}
      <button
        onClick={() => map.flyTo(centerCoords, 13, { duration: 1.2 })}
        className="w-10 h-10 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-[0_4px_14px_rgba(15,23,42,0.14)] flex items-center justify-center text-blue-600 hover:text-blue-700 active:scale-95 transition"
        title="Recenter on My Location"
      >
        <Crosshair className="w-5 h-5 text-blue-600" />
      </button>

      {/* Satellite / Street Switcher */}
      <button
        onClick={() => setMapStyle(mapStyle === 'streets' ? 'satellite' : 'streets')}
        className={`w-10 h-10 rounded-2xl backdrop-blur-md border shadow-[0_4px_14px_rgba(15,23,42,0.14)] flex items-center justify-center active:scale-95 transition ${
          mapStyle === 'satellite'
            ? 'bg-emerald-600 text-white border-emerald-500'
            : 'bg-white/95 text-slate-700 border-slate-200/80 hover:text-emerald-600'
        }`}
        title={mapStyle === 'streets' ? 'Switch to Satellite View' : 'Switch to Street Map'}
      >
        <Layers className="w-5 h-5" />
      </button>

      {/* Zoom In / Out Controls */}
      <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-[0_4px_14px_rgba(15,23,42,0.14)] overflow-hidden flex flex-col">
        <button
          onClick={() => map.zoomIn()}
          className="w-10 h-9 flex items-center justify-center text-slate-700 hover:bg-slate-50 border-b border-slate-100 font-bold active:scale-95 transition"
          title="Zoom In"
        >
          <Plus className="w-4 h-4 text-slate-700" />
        </button>
        <button
          onClick={() => map.zoomOut()}
          className="w-10 h-9 flex items-center justify-center text-slate-700 hover:bg-slate-50 font-bold active:scale-95 transition"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4 text-slate-700" />
        </button>
      </div>
    </div>
  );
}

export default function LeafletMapInner({
  recenterTrigger = 0,
}: {
  recenterTrigger?: number;
}) {
  const {
    activeVillage,
    evacuationRoute,
    reliefCamps,
    setPreferredCampId,
    blockedRoadIds,
    citizenReports,
    language,
    currentForecast,
    isNavigating,
    isOffline,
  } = useFloodApp();

  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite'>('streets');
  const [navStepIdx, setNavStepIdx] = useState<number>(0);
  const isPa = language === 'pa';

  // Advance navigation puck along evacuation route while navigating
  useEffect(() => {
    if (!isNavigating || !evacuationRoute?.fullCoordinates?.length) {
      setNavStepIdx(0);
      return;
    }
    const interval = setInterval(() => {
      setNavStepIdx((prev) => {
        const next = prev + 1;
        if (next >= evacuationRoute.fullCoordinates.length) {
          return prev; // Stay at camp destination
        }
        return next;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, [isNavigating, evacuationRoute]);

  // Current navigation position and heading
  const currentNavPos: [number, number] =
    isNavigating && evacuationRoute?.fullCoordinates?.length
      ? evacuationRoute.fullCoordinates[Math.min(navStepIdx, evacuationRoute.fullCoordinates.length - 1)]
      : activeVillage.coords;

  const nextNavPos: [number, number] =
    isNavigating && evacuationRoute?.fullCoordinates?.length && navStepIdx + 1 < evacuationRoute.fullCoordinates.length
      ? evacuationRoute.fullCoordinates[navStepIdx + 1]
      : currentNavPos;

  const navBearing = calculateBearing(currentNavPos, nextNavPos);

  // Google Maps Style Live Navigation Puck
  const navPuckIcon = L.divIcon({
    className: 'custom-nav-puck',
    html: `
      <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background-color: #2563EB; opacity: 0.35; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position: absolute; top: -6px; width: 0; height: 0; border-left: 7px solid transparent; border-right: 7px solid transparent; border-bottom: 12px solid #1D4ED8; transform: rotate(${navBearing}deg); transform-origin: 50% 28px;"></div>
        <div style="width: 24px; height: 24px; border-radius: 50%; background-color: #2563EB; border: 3px solid white; box-shadow: 0 4px 14px rgba(37,99,235,0.7); display: flex; align-items: center; justify-content: center; z-index: 10;">
          <div style="width: 7px; height: 7px; border-radius: 50%; background-color: white;"></div>
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });

  // Crisp Vector SVG Markers
  const villageIcon = L.divIcon({
    className: 'custom-village-icon',
    html: `
      <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background-color: ${currentForecast.statusColor}; opacity: 0.25; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="width: 22px; height: 22px; border-radius: 50%; background-color: white; border: 3px solid ${currentForecast.statusColor}; box-shadow: 0 4px 12px rgba(15,23,42,0.18); display: flex; align-items: center; justify-content: center;">
          <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${currentForecast.statusColor};"></div>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  const createShelterIcon = (isTarget: boolean) =>
    L.divIcon({
      className: isTarget ? 'target-shelter-icon' : 'general-shelter-icon',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          ${
            isTarget
              ? `<div style="position: absolute; width: 44px; height: 44px; border-radius: 16px; background-color: rgba(16, 185, 129, 0.28); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
              : ''
          }
          <div style="background-color: ${
            isTarget ? '#047857' : '#059669'
          }; color: white; width: ${isTarget ? '36px' : '30px'}; height: ${
        isTarget ? '36px' : '30px'
      }; border-radius: 12px; border: ${
        isTarget ? '3px solid #FCD34D' : '2.5px solid white'
      }; box-shadow: 0 6px 18px rgba(5, 150, 105, 0.45); display: flex; align-items: center; justify-content: center;">
            <svg width="${isTarget ? '20' : '16'}" height="${
        isTarget ? '20' : '16'
      }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

  const breachHazardIcon = L.divIcon({
    className: 'custom-hazard-icon',
    html: `
      <div style="background-color: #DC2626; color: white; width: 30px; height: 30px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 6px 16px rgba(220, 38, 38, 0.45); display: flex; align-items: center; justify-content: center;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

  return (
    <div className="w-full h-full relative">
      {/* Offline Tactical Vector GIS Indicator */}
      {isOffline && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[500] bg-slate-900/90 text-white backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-700/80 shadow-lg text-[10px] font-mono flex items-center gap-2 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>ਆਫ਼ਲਾਈਨ ਜੀ.ਆਈ.ਐਸ. ਮੋਡ (Offline Vector Routing Active)</span>
        </div>
      )}

      <MapContainer
        center={activeVillage.coords}
        zoom={12}
        scrollWheelZoom={true}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#F1F5F9',
          backgroundImage:
            'radial-gradient(#CBD5E1 1px, transparent 1px), linear-gradient(to right, #E2E8F0 1px, transparent 1px), linear-gradient(to bottom, #E2E8F0 1px, transparent 1px)',
          backgroundSize: '24px 24px, 48px 48px, 48px 48px',
        }}
        zoomControl={false}
      >
        {/* Street Map vs Satellite Tile Layer (Zero-Network Offline Capable via /api/map-tiles) */}
        {mapStyle === 'streets' ? (
          <TileLayer
            key="osm-streets"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="/api/map-tiles/{z}/{x}/{y}.png"
            maxZoom={19}
          />
        ) : (
          <TileLayer
            key="esri-satellite"
            attribution='&copy; Esri World Imagery'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            fallbackUrl="/api/map-tiles/{z}/{x}/{y}.png"
            maxZoom={18}
          />
        )}

        <MapController center={activeVillage.coords} />
        <NavigationCameraController
          active={isNavigating}
          coords={currentNavPos}
          recenterTrigger={recenterTrigger}
        />
        <MapFloatingControls
          centerCoords={activeVillage.coords}
          mapStyle={mapStyle}
          setMapStyle={setMapStyle}
          isNavigating={isNavigating}
        />

        {/* Inundation Risk Circle */}
        <Circle
          center={activeVillage.coords}
          radius={currentForecast.riskLevel === 'EVACUATE_24H' ? 2400 : 1200}
          pathOptions={{
            color: currentForecast.statusColor,
            fillColor: currentForecast.statusColor,
            fillOpacity: 0.15,
            weight: 2,
            dashArray: '4, 8',
          }}
        />

        {/* Render Road Network Edges */}
        {ROAD_EDGES.map((edge) => {
          const isBlocked = blockedRoadIds.includes(edge.id);
          return (
            <Polyline
              key={edge.id}
              positions={edge.path}
              pathOptions={{
                color: isBlocked ? '#DC2626' : '#94A3B8',
                weight: isBlocked ? 4 : 2.5,
                dashArray: isBlocked ? '6, 6' : undefined,
                opacity: isBlocked ? 0.9 : 0.45,
              }}
            >
              <Popup>
                <div className="text-xs p-1 text-slate-900 font-sans">
                  <div className="font-bold">{isPa ? edge.punjabiName : edge.name}</div>
                  <div className="text-[10px] mt-0.5">
                    {isBlocked ? 'SUBMERGED / CLOSED' : `Elevation: ${edge.baseElevation}m (Open)`}
                  </div>
                </div>
              </Popup>
            </Polyline>
          );
        })}

        {/* Dynamic Safe Dijkstra Evacuation Route */}
        {evacuationRoute && evacuationRoute.fullCoordinates && (
          <Polyline
            positions={evacuationRoute.fullCoordinates}
            pathOptions={{
              color: isNavigating ? '#10B981' : '#059669',
              weight: isNavigating ? 7 : 5.5,
              opacity: 0.95,
            }}
          />
        )}

        {/* Live Navigation Puck Moving Along Route */}
        {isNavigating && (
          <Marker position={currentNavPos} icon={navPuckIcon} zIndexOffset={1000}>
            <Popup>
              <div className="text-xs p-1 text-slate-900 font-sans">
                <div className="font-bold text-blue-600">
                  {isPa ? 'ਤੁਹਾਡਾ ਵਾਹਨ (ਜੀ.ਪੀ.ਐੱਸ. ਲਾਈਵ)' : 'Your Vehicle (GPS Live)'}
                </div>
                <div className="text-[10px] text-slate-500">
                  {isPa ? 'ਗਤੀ: 18 km/h · ਟਰੈਕਟਰ' : 'Speed: 18 km/h · High-Axle Tractor'}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Active Village Pin */}
        {!isNavigating && (
          <Marker position={activeVillage.coords} icon={villageIcon}>
            <Popup>
              <div className="text-xs p-1 text-slate-900 font-sans">
                <div className="font-bold">{isPa ? activeVillage.punjabiName : activeVillage.name}</div>
                <div className="text-[11px] text-slate-600">
                  {isPa ? 'ਪਿੰਡ ਉਚਾਈ: ' : 'Elevation: '}
                  {activeVillage.elevation}m
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* All Active Relief Camp Shelters */}
        {reliefCamps.map((camp) => {
          const isTarget = evacuationRoute?.camp?.id === camp.id;
          return (
            <Marker key={`camp-${camp.id}`} position={camp.coords} icon={createShelterIcon(isTarget)}>
              <Popup>
                <div className="text-xs p-1 text-slate-900 font-sans min-w-[190px] space-y-1">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                    <span className="font-bold text-emerald-800">{isPa ? camp.punjabiName : camp.name}</span>
                    {isTarget && (
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-bold">
                        {isPa ? 'ਸਰਗਰਮ ਰੂਟ' : 'Target'}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-600">
                    {isPa ? 'ਉੱਚੀ ਥਾਂ: ' : 'Elevation: '}
                    <span className="font-semibold text-slate-800">{camp.elevation}m</span>
                  </div>
                  <div className="text-[10px] text-slate-600 space-y-0.5 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                    <div>
                      {isPa ? 'ਖਾਲੀ ਬਿਸਤਰੇ: ' : 'Available Beds: '}
                      <span className="font-bold text-emerald-700">{camp.availableBeds}</span> / {camp.capacity}
                    </div>
                    <div>
                      {isPa ? 'ਲੰਗਰ: ' : 'Langar: '}
                      <span className="font-medium text-slate-800">{camp.hasLangar ? (isPa ? 'ਚਾਲੂ ਹੈ' : 'Active') : (isPa ? 'ਸੀਮਤ' : 'Limited')}</span>
                    </div>
                    {camp.contactNumber && (
                      <div>
                        {isPa ? 'ਸੰਪਰਕ: ' : 'Helpline: '}
                        <span className="font-mono text-slate-700">{camp.contactNumber}</span>
                      </div>
                    )}
                  </div>
                  {!isTarget && (
                    <button
                      onClick={() => setPreferredCampId(camp.id)}
                      className="w-full mt-1.5 py-1 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] shadow-sm transition active:scale-95"
                    >
                      {isPa ? 'ਇੱਥੇ ਨਿਕਾਸੀ ਰੂਟ ਬਣਾਓ' : 'Set as Evacuation Destination'}
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Citizen Reported Hazard Pins (Deduplicated per road to prevent marker stacking) */}
        {Array.from(new Map(citizenReports.map(r => [r.roadId || r.id, r])).values()).slice(0, 3).map((report, idx) => {
          const matchingEdge = report.roadId ? ROAD_EDGES.find((e) => e.id === report.roadId) : undefined;
          const markerPos: [number, number] = matchingEdge && matchingEdge.path.length > 0
            ? matchingEdge.path[Math.floor(matchingEdge.path.length / 2)]
            : [
                activeVillage.coords[0] - 0.008 - ((idx % 3) * 0.004),
                activeVillage.coords[1] - 0.010 - ((idx % 4) * 0.003),
              ];

          return (
            <Marker
              key={report.id}
              position={markerPos}
              icon={breachHazardIcon}
            >
              <Popup>
                <div className="text-xs p-1 text-slate-900 font-sans">
                  <div className="font-bold text-rose-600">Citizen Breach Report</div>
                  <div className="text-[10px] font-semibold">{report.landmark}</div>
                  <div className="text-[9px] text-slate-500">
                    Confidence: {report.confidenceScore}% · {(report as { classification?: string }).classification || 'HAZARD'}
                  </div>
                  {report.notes && (
                    <div className="text-[9px] text-slate-600 mt-0.5 italic">{report.notes}</div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
