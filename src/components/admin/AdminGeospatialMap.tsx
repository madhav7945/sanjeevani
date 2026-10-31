// Generated with Antigravity / Gemini, reviewed and modified by the team
// CTBF-AI-12: Government Tactical Geospatial Command Map (Leaflet / GIS)
// Live Citizen App User Locations, Flood Inundation Danger Zones, NDRF Boat Dispatch

'use client';

import React, { useState, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polyline,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Layers,
  PhoneCall,
  Anchor,
  Compass,
  Eye,
  ShieldCheck,
  PlusCircle,
  Trash2,
  X,
  Building,
  MapPin,
  Check,
  AlertOctagon,
} from 'lucide-react';
import type { MeshBeaconRecord } from '@/lib/serverDb';
import type { ReliefCamp, VillageData } from '@/data/villagesAndCamps';
import { ROAD_EDGES } from '@/data/roadNetworkGraph';

export interface CitizenNode {
  id: string;
  name: string;
  phone: string;
  villageName: string;
  coords: [number, number];
  familyMembers: number;
  cattleCount: number;
  medicalNeeds?: string;
  status: 'CRITICAL_SOS' | 'DANGER_ZONE' | 'WARNING' | 'EVACUATED_SAFE';
  waterDepthMeters: number;
  lastPing: string;
  boatDispatched?: boolean;
}

interface AdminGeospatialMapProps {
  villages: VillageData[];
  camps: ReliefCamp[];
  activeObstacleRoadIds: string[];
  liveMeshBeacons?: MeshBeaconRecord[];
  onDispatchBoat?: (beaconOrCitizenId: string) => void;
  damDischargeCusecs?: number;
  onAddCamp?: (newCamp: Omit<ReliefCamp, 'id'> & { id?: string }) => Promise<void>;
  onDeleteCamp?: (campId: string) => Promise<void>;
}

// Simulated active citizen app installations across Sutlej basin
const BASE_CITIZENS: CitizenNode[] = [
  {
    id: 'cit_1',
    name: 'Gurpreet Singh',
    phone: '+91 98765 43210',
    villageName: 'Lohian Khas',
    coords: [31.1195, 75.2505],
    familyMembers: 5,
    cattleCount: 4,
    medicalNeeds: 'Elderly diabetic parent requires dry evacuation',
    status: 'CRITICAL_SOS',
    waterDepthMeters: 1.45,
    lastPing: '1m ago',
    boatDispatched: false,
  },
  {
    id: 'cit_2',
    name: 'Harbhajan Kaur',
    phone: '+91 98140 23456',
    villageName: 'Gidderpindi',
    coords: [31.1255, 75.2012],
    familyMembers: 3,
    cattleCount: 2,
    status: 'CRITICAL_SOS',
    waterDepthMeters: 1.8,
    lastPing: 'Just now',
    boatDispatched: true,
  },
  {
    id: 'cit_3',
    name: 'Balwinder Singh',
    phone: '+91 98150 34567',
    villageName: 'Nasirpur',
    coords: [31.1402, 75.289],
    familyMembers: 6,
    cattleCount: 8,
    medicalNeeds: 'Need tractor corridor for pregnant mother',
    status: 'DANGER_ZONE',
    waterDepthMeters: 0.85,
    lastPing: '3m ago',
    boatDispatched: false,
  },
  {
    id: 'cit_4',
    name: 'Jaswant Singh',
    phone: '+91 98720 45678',
    villageName: 'Mandi Kalu',
    coords: [31.155, 75.221],
    familyMembers: 4,
    cattleCount: 5,
    status: 'DANGER_ZONE',
    waterDepthMeters: 0.65,
    lastPing: '5m ago',
    boatDispatched: false,
  },
  {
    id: 'cit_5',
    name: 'Sukhdev Singh',
    phone: '+91 98880 56789',
    villageName: 'Channa',
    coords: [31.098, 75.275],
    familyMembers: 4,
    cattleCount: 3,
    status: 'WARNING',
    waterDepthMeters: 0.35,
    lastPing: '8m ago',
    boatDispatched: false,
  },
  {
    id: 'cit_6',
    name: 'Paramjit Kaur',
    phone: '+91 98141 67890',
    villageName: 'Kang Kalan',
    coords: [31.168, 75.312],
    familyMembers: 5,
    cattleCount: 6,
    status: 'WARNING',
    waterDepthMeters: 0.2,
    lastPing: '12m ago',
    boatDispatched: false,
  },
  {
    id: 'cit_7',
    name: 'Manpreet Singh',
    phone: '+91 98762 11223',
    villageName: 'Shahkot School Relief Camp',
    coords: [31.0825, 75.3385],
    familyMembers: 4,
    cattleCount: 0,
    status: 'EVACUATED_SAFE',
    waterDepthMeters: 0.0,
    lastPing: '2m ago',
    boatDispatched: false,
  },
  {
    id: 'cit_8',
    name: 'Daljit Singh',
    phone: '+91 98155 33445',
    villageName: 'Nakodar Stadium Shelter',
    coords: [31.1275, 75.4745],
    familyMembers: 7,
    cattleCount: 0,
    status: 'EVACUATED_SAFE',
    waterDepthMeters: 0.0,
    lastPing: '15m ago',
    boatDispatched: false,
  },
  {
    id: 'cit_9',
    name: 'Kuldeep Kaur',
    phone: '+91 98788 55667',
    villageName: 'Malsian Community Hall',
    coords: [31.112, 75.378],
    familyMembers: 3,
    cattleCount: 0,
    status: 'EVACUATED_SAFE',
    waterDepthMeters: 0.0,
    lastPing: '4m ago',
    boatDispatched: false,
  },
];

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  const hasInitializedRef = React.useRef(false);

  React.useEffect(() => {
    if (!hasInitializedRef.current) {
      map.setView(center, 12);
      hasInitializedRef.current = true;
    }
  }, [center, map]);
  return null;
}

function ShelterMapClickCapture({
  active,
  onSelectCoords,
}: {
  active: boolean;
  onSelectCoords: (coords: [number, number]) => void;
}) {
  const map = useMap();

  React.useEffect(() => {
    const container = map.getContainer();
    if (active) {
      container.style.cursor = 'crosshair';
    } else {
      container.style.cursor = '';
    }
  }, [active, map]);

  useMapEvents({
    click(e) {
      if (active) {
        onSelectCoords([Number(e.latlng.lat.toFixed(5)), Number(e.latlng.lng.toFixed(5))]);
      }
    },
  });

  return null;
}

export default function AdminGeospatialMap({
  camps,
  activeObstacleRoadIds,
  liveMeshBeacons = [],
  onDispatchBoat,
  damDischargeCusecs = 112000,
  onAddCamp,
  onDeleteCamp,
}: AdminGeospatialMapProps) {
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite'>('streets');
  const [filterMode, setFilterMode] = useState<'ALL' | 'DANGER' | 'SAFE'>('ALL');
  const [showInundationZones, setShowInundationZones] = useState<boolean>(true);
  const [showRoadNetwork, setShowRoadNetwork] = useState<boolean>(true);
  const [localBoatDispatches, setLocalBoatDispatches] = useState<Record<string, boolean>>({});

  // Shelter Management State
  const [isAddShelterMode, setIsAddShelterMode] = useState<boolean>(false);
  const [hasPlacedNewPin, setHasPlacedNewPin] = useState<boolean>(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState<boolean>(false);
  const [campToDelete, setCampToDelete] = useState<ReliefCamp | null>(null);
  const [newCampCoords, setNewCampCoords] = useState<[number, number]>([31.1215, 75.2530]);
  const [newCampName, setNewCampName] = useState<string>('Govt Senior Secondary School, High Ridge');
  const [newCampPunjabi, setNewCampPunjabi] = useState<string>('ਸਰਕਾਰੀ ਸੀਨੀਅਰ ਸੈਕੰਡਰੀ ਸਕੂਲ');
  const [newCampType, setNewCampType] = useState<'school' | 'gurdwara' | 'college' | 'mandi'>('school');
  const [newCampElevation, setNewCampElevation] = useState<number>(222);
  const [newCampCapacity, setNewCampCapacity] = useState<number>(500);
  const [newCampBeds, setNewCampBeds] = useState<number>(400);
  const [newCampContact, setNewCampContact] = useState<string>('+91 181 2224455');
  const [newCampMedical, setNewCampMedical] = useState<boolean>(true);
  const [newCampLangar, setNewCampLangar] = useState<boolean>(true);
  const [isSubmittingCamp, setIsSubmittingCamp] = useState<boolean>(false);

  const handleDeployCampSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newCampName.trim()) {
      alert('Please enter a relief camp name');
      return;
    }
    if (!onAddCamp) return;

    try {
      setIsSubmittingCamp(true);
      await onAddCamp({
        name: newCampName.trim(),
        punjabiName: newCampPunjabi.trim() || newCampName.trim(),
        type: newCampType,
        coords: newCampCoords,
        elevation: Number(newCampElevation),
        capacity: Number(newCampCapacity),
        availableBeds: Number(newCampBeds),
        contactNumber: newCampContact.trim() || '+91 181 2224455',
        hasMedical: newCampMedical,
        hasLangar: newCampLangar,
      });
      setIsDeployModalOpen(false);
      setIsAddShelterMode(false);
      setHasPlacedNewPin(false);
      setNewCampName('Govt Senior Secondary School, High Ridge');
      setNewCampPunjabi('ਸਰਕਾਰੀ ਸੀਨੀਅਰ ਸੈਕੰਡਰੀ ਸਕੂਲ');
    } catch (err) {
      console.error(err);
      alert('Failed to deploy relief camp');
    } finally {
      setIsSubmittingCamp(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!campToDelete || !onDeleteCamp) return;
    try {
      await onDeleteCamp(campToDelete.id);
      setCampToDelete(null);
    } catch (err) {
      console.error(err);
      alert('Failed to decommission shelter');
    }
  };

  // Merge live incoming mesh beacons from tester phones into the active citizen nodes
  const allCitizens = useMemo(() => {
    const list: CitizenNode[] = [...BASE_CITIZENS];

    liveMeshBeacons.forEach((b) => {
      // Check if already mapped
      const existing = list.find((c) => c.phone === b.senderPhone);
      if (existing) {
        existing.status = 'CRITICAL_SOS';
        existing.coords = b.coords;
        existing.lastPing = 'Active Mesh Beacon';
        existing.medicalNeeds = b.medicalNeeds;
        if (b.gatewayNode?.includes('ACK') || localBoatDispatches[existing.id]) {
          existing.boatDispatched = true;
        }
      } else {
        list.unshift({
          id: b.id,
          name: b.senderName,
          phone: b.senderPhone,
          villageName: b.villageName,
          coords: b.coords,
          familyMembers: b.familyMembers,
          cattleCount: b.cattleCount,
          medicalNeeds: b.medicalNeeds,
          status: 'CRITICAL_SOS',
          waterDepthMeters: 1.6,
          lastPing: 'Live Mesh Beacon',
          boatDispatched: Boolean(localBoatDispatches[b.id]),
        });
      }
    });

    return list;
  }, [liveMeshBeacons, localBoatDispatches]);

  // Filter citizens based on active filter button
  const filteredCitizens = useMemo(() => {
    if (filterMode === 'DANGER') {
      return allCitizens.filter((c) => c.status === 'CRITICAL_SOS' || c.status === 'DANGER_ZONE');
    }
    if (filterMode === 'SAFE') {
      return allCitizens.filter((c) => c.status === 'EVACUATED_SAFE');
    }
    return allCitizens;
  }, [allCitizens, filterMode]);

  // Calculate danger metrics
  const criticalCount = allCitizens.filter((c) => c.status === 'CRITICAL_SOS').length;
  const dangerZoneCount = allCitizens.filter((c) => c.status === 'DANGER_ZONE').length;
  const safeCount = allCitizens.filter((c) => c.status === 'EVACUATED_SAFE').length;
  const totalCattleAtRisk = allCitizens
    .filter((c) => c.status !== 'EVACUATED_SAFE')
    .reduce((acc, c) => acc + c.cattleCount, 0);

  // Inundation radius expands realistically with higher dam discharge cusecs
  const surgeRadiusMeters = useMemo(() => {
    if (damDischargeCusecs > 300000) return 2800;
    if (damDischargeCusecs > 180000) return 2100;
    if (damDischargeCusecs > 100000) return 1400;
    return 700;
  }, [damDischargeCusecs]);

  const handleDispatchBoat = (id: string) => {
    setLocalBoatDispatches((prev) => ({ ...prev, [id]: true }));
    if (onDispatchBoat) onDispatchBoat(id);
  };

  // Custom Icon Generators
  const createCitizenIcon = (citizen: CitizenNode) => {
    const isCritical = citizen.status === 'CRITICAL_SOS';
    const isDanger = citizen.status === 'DANGER_ZONE';
    const isWarning = citizen.status === 'WARNING';
    const isDispatched = citizen.boatDispatched || localBoatDispatches[citizen.id];

    let bgColor = '#059669'; // Green Safe
    let pulseAnim = '';

    if (isCritical) {
      bgColor = '#DC2626'; // Red Critical
      pulseAnim = 'animation: ping 1.4s cubic-bezier(0, 0, 0.2, 1) infinite;';
    } else if (isDanger) {
      bgColor = '#EA580C'; // Orange Danger
      pulseAnim = 'animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;';
    } else if (isWarning) {
      bgColor = '#D97706'; // Amber Warning
    }

    return L.divIcon({
      className: 'custom-citizen-puck',
      html: `
        <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          ${pulseAnim ? `<div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background-color: ${bgColor}; opacity: 0.35; ${pulseAnim}"></div>` : ''}
          <div style="width: 24px; height: 24px; border-radius: 50%; background-color: ${bgColor}; border: 2.5px solid white; box-shadow: 0 4px 12px rgba(15,23,42,0.3); display: flex; align-items: center; justify-content: center; z-index: 10;">
            ${
              isDispatched
                ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a8 8 0 0 0 8-8c0-4.418-8-12-8-12S4 9.582 4 14a8 8 0 0 0 8 8z"/><circle cx="12" cy="14" r="3"/></svg>`
                : `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a6.5 6.5 0 0 1 13 0"/></svg>`
            }
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });
  };

  const campIcon = useMemo(() => {
    return L.divIcon({
      className: 'custom-shelter-pin',
      html: `
        <div style="background-color: #059669; color: white; width: 32px; height: 32px; border-radius: 10px; border: 2.5px solid white; box-shadow: 0 6px 16px rgba(5, 150, 105, 0.4); display: flex; align-items: center; justify-content: center;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  }, []);

  const tempPlacementIcon = useMemo(() => {
    return L.divIcon({
      className: 'custom-temp-placement-pin',
      html: `
        <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background-color: rgba(16, 185, 129, 0.4); animation: ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 32px; height: 32px; border-radius: 12px; background-color: #059669; border: 3px solid #FCD34D; box-shadow: 0 6px 18px rgba(5,150,105,0.6); display: flex; align-items: center; justify-content: center; z-index: 10;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });
  }, []);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden space-y-0">
      {/* Tactical Map Header & Metrics Bar */}
      <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              Live Tactical Geospatial Map • Citizen App Telemetry & Danger Zones
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time geospatial tracking of citizen devices with active Sanjeevani installations across Sutlej basin.
          </p>
        </div>

        {/* Live Status Metric Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-50 text-red-700 border border-red-200 font-semibold">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
            <span>{criticalCount} Critical SOS</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-orange-50 text-orange-700 border border-orange-200 font-semibold">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span>{dangerZoneCount} In Danger Zone</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>{safeCount} Sheltered Safe</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 font-mono text-[11px]">
            <span>🐄 {totalCattleAtRisk} Cattle at Risk</span>
          </div>
        </div>
      </div>

      
      {/* Filter and Layer Action Toolbar */}
      <div className="bg-slate-50 px-5 py-2.5 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mr-1">
            Display Filter:
          </span>
          <button
            onClick={() => setFilterMode('ALL')}
            className={`px-3 py-1 rounded-lg font-medium transition active:scale-95 ${
              filterMode === 'ALL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            All Citizens ({allCitizens.length})
          </button>
          <button
            onClick={() => setFilterMode('DANGER')}
            className={`px-3 py-1 rounded-lg font-medium transition active:scale-95 ${
              filterMode === 'DANGER'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Danger & SOS ({criticalCount + dangerZoneCount})
          </button>
          <button
            onClick={() => setFilterMode('SAFE')}
            className={`px-3 py-1 rounded-lg font-medium transition active:scale-95 ${
              filterMode === 'SAFE'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Evacuated ({safeCount})
          </button>
        </div>

        {/* Layer Toggles & Map Style */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInundationZones(!showInundationZones)}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition flex items-center gap-1 ${
              showInundationZones
                ? 'bg-blue-50 text-blue-700 border-blue-300'
                : 'bg-white text-slate-500 border-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Flood Inundation Layers</span>
          </button>

          <button
            onClick={() => setShowRoadNetwork(!showRoadNetwork)}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition flex items-center gap-1 ${
              showRoadNetwork
                ? 'bg-blue-50 text-blue-700 border-blue-300'
                : 'bg-white text-slate-500 border-slate-200'
            }`}
          >
            <span>Road Graph (Reroutes)</span>
          </button>

          <button
            onClick={() => setMapStyle(mapStyle === 'streets' ? 'satellite' : 'streets')}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-[11px] font-medium transition flex items-center gap-1"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{mapStyle === 'streets' ? 'Satellite View' : 'Street Map'}</span>
          </button>

          {/* Add / Deploy Relief Shelter Button */}
          {onAddCamp && (
            <button
              onClick={() => {
                if (isAddShelterMode) {
                  setIsAddShelterMode(false);
                } else {
                  setIsAddShelterMode(true);
                }
              }}
              className={`px-3 py-1 rounded-lg border text-[11px] font-bold transition flex items-center gap-1.5 active:scale-95 ${
                isAddShelterMode
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm animate-pulse'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{isAddShelterMode ? 'Cancel Pin Drop' : '+ Deploy Shelter'}</span>
            </button>
          )}
        </div>
      </div>

      
      {/* Deployment Map Mode Prompt Banner */}
      {isAddShelterMode && (
        <div className="bg-emerald-700 text-white px-5 py-2.5 text-xs flex flex-wrap items-center justify-between gap-2 shadow-inner">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 animate-bounce text-emerald-200 shrink-0" />
            <span className="font-semibold">
              Deployment Mode Active: Click anywhere on high ground to drop a shelter pin.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsAddShelterMode(false);
                setIsDeployModalOpen(true);
              }}
              className="px-3 py-1 rounded-lg bg-white text-emerald-900 font-bold text-[11px] hover:bg-emerald-50 active:scale-95 transition"
            >
              Enter Coords Manually
            </button>
            <button
              onClick={() => setIsAddShelterMode(false)}
              className="p-1 rounded-lg hover:bg-emerald-800 text-white"
              title="Close deployment mode"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Map Container */}
      <div className="relative w-full h-[540px] sm:h-[600px] bg-slate-100">
        <MapContainer
          center={[31.1189, 75.2512]}
          zoom={12}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%' }}
          zoomControl={true}
        >
          {mapStyle === 'streets' ? (
            <TileLayer
              key="admin-osm-streets"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />
          ) : (
            <TileLayer
              key="admin-esri-satellite"
              attribution='&copy; Esri World Imagery'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={18}
            />
          )}

          <MapController center={[31.1189, 75.2512]} />

          {/* Interactive Shelter Placement Click Capture */}
          <ShelterMapClickCapture
            active={isAddShelterMode}
            onSelectCoords={(coords) => {
              setNewCampCoords(coords);
              setHasPlacedNewPin(true);
            }}
          />

          {/* Placed Temporary Pin during Map Pin-Drop Mode */}
          {isAddShelterMode && hasPlacedNewPin && (
            <Marker position={newCampCoords} icon={tempPlacementIcon}>
              <Popup autoPan={false}>
                <div className="text-xs p-1 font-sans">
                  <div className="font-bold text-emerald-800">Shelter Location Picked</div>
                  <div className="font-mono text-[10px] text-slate-600">{newCampCoords[0]}, {newCampCoords[1]}</div>
                  <div className="text-[10px] text-emerald-600 font-semibold mt-1">Ready for network broadcast</div>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Dynamic Flood Inundation Danger Zones (Pure background visual overlays, non-blocking) */}
          {showInundationZones && (
            <>
              {/* Critical River Surge Core — Lohian Khas Basin */}
              <Circle
                center={[31.1189, 75.2512]}
                radius={surgeRadiusMeters}
                interactive={false}
                pathOptions={{
                  color: '#DC2626',
                  fillColor: '#EF4444',
                  fillOpacity: 0.28,
                  weight: 2,
                  dashArray: '6, 6',
                }}
              />

              {/* Gidderpindi Breach Embankment Zone */}
              <Circle
                center={[31.1255, 75.2012]}
                radius={surgeRadiusMeters * 0.85}
                interactive={false}
                pathOptions={{
                  color: '#EA580C',
                  fillColor: '#F97316',
                  fillOpacity: 0.22,
                  weight: 2,
                }}
              />

              {/* Dhussi Bandh Embankment Buffer — Centered on Channa Sector (Sukhdev Singh) */}
              <Circle
                center={[31.098, 75.275]}
                radius={surgeRadiusMeters * 0.7}
                interactive={false}
                pathOptions={{
                  color: '#D97706',
                  fillColor: '#FBBF24',
                  fillOpacity: 0.18,
                  weight: 1.5,
                }}
              />
            </>
          )}

          {/* Road Network Graph: Clear elevated highway vs Submerged segments */}
          {showRoadNetwork &&
            ROAD_EDGES.map((edge) => {
              const isBlocked = activeObstacleRoadIds.includes(edge.id);
              return (
                <Polyline
                  key={`admin-road-${edge.id}`}
                  positions={edge.path}
                  interactive={!isAddShelterMode}
                  pathOptions={{
                    color: isBlocked ? '#DC2626' : '#10B981',
                    weight: isBlocked ? 5 : 4,
                    opacity: 0.85,
                    dashArray: isBlocked ? '8, 8' : undefined,
                  }}
                />
              );
            })}

          {/* Relief Camp Shelter Markers */}
          {camps.map((camp) => (
            <Marker
              key={`admin-camp-${camp.id}`}
              position={camp.coords}
              icon={campIcon}
            >
              <Popup>
                <div className="text-xs p-1 text-slate-900 font-sans space-y-1.5 min-w-[200px]">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold border-b border-slate-100 pb-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>{camp.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium">{camp.punjabiName}</div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-[10px] space-y-0.5 font-mono">
                    <div>Capacity: {camp.capacity} evacuees</div>
                    <div className="font-bold text-emerald-700">Available Beds: {camp.availableBeds}</div>
                    <div>Medical Support: {camp.hasMedical ? 'Doctor on Duty' : 'Basic Aid'}</div>
                    <div>Langar & Ration: {camp.hasLangar ? 'Hot Meals Active' : 'Rations Ready'}</div>
                    <div>Helpline: {camp.contactNumber}</div>
                  </div>
                  {onDeleteCamp && (
                    <button
                      onClick={() => setCampToDelete(camp)}
                      className="w-full mt-2 py-1 px-2 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold text-[10px] flex items-center justify-center gap-1.5 transition active:scale-95"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-600" />
                      <span>Decommission Shelter</span>
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Citizen App Users Pins */}
          {filteredCitizens.map((citizen) => {
            const isDispatched = citizen.boatDispatched || localBoatDispatches[citizen.id];
            return (
              <Marker
                key={`citizen-pin-${citizen.id}`}
                position={citizen.coords}
                icon={createCitizenIcon(citizen)}
                eventHandlers={{
                  click: () => setSelectedCitizen(citizen),
                }}
              >
                <Popup>
                  <div className="text-xs p-1.5 text-slate-900 font-sans space-y-2 min-w-[240px]">
                    {/* Header */}
                    <div className="flex items-start justify-between border-b border-slate-100 pb-1.5">
                      <div>
                        <div className="font-extrabold text-slate-900 text-sm">{citizen.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{citizen.phone}</div>
                      </div>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono ${
                          citizen.status === 'CRITICAL_SOS'
                            ? 'bg-red-100 text-red-700'
                            : citizen.status === 'DANGER_ZONE'
                            ? 'bg-orange-100 text-orange-800'
                            : citizen.status === 'WARNING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {citizen.status.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Telemetry Snapshot */}
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/80 text-[11px] space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Village:</span>
                        <span className="font-bold text-slate-800">{citizen.villageName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Evacuees:</span>
                        <span className="font-semibold text-slate-800">
                          {citizen.familyMembers} Family • {citizen.cattleCount} Cattle
                        </span>
                      </div>
                      {citizen.status !== 'EVACUATED_SAFE' && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Est. Water Depth:</span>
                          <span className="font-mono font-bold text-red-600">
                            {citizen.waterDepthMeters} m
                          </span>
                        </div>
                      )}
                      {citizen.medicalNeeds && (
                        <div className="text-[10px] text-red-700 bg-red-50 p-1 rounded font-medium mt-1">
                          Priority Need: {citizen.medicalNeeds}
                        </div>
                      )}
                    </div>

                    {/* One-Click Action Buttons */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <a
                        href={`tel:${citizen.phone.replace(/[^0-9]/g, '')}`}
                        className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-semibold rounded-lg text-center flex items-center justify-center gap-1 transition"
                      >
                        <PhoneCall className="w-3 h-3 text-slate-600" />
                        <span>Call</span>
                      </a>

                      {citizen.status !== 'EVACUATED_SAFE' && (
                        <button
                          onClick={() => handleDispatchBoat(citizen.id)}
                          className={`flex-1 py-1.5 px-2 text-[11px] font-bold rounded-lg text-center flex items-center justify-center gap-1 transition shadow-xs ${
                            isDispatched
                              ? 'bg-emerald-600 text-white'
                              : 'bg-red-600 hover:bg-red-700 text-white active:scale-95'
                          }`}
                        >
                          <Anchor className="w-3 h-3" />
                          <span>{isDispatched ? 'Boat Assigned' : 'Dispatch Boat'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Floating In-Map Deployment Card (Appears immediately when clicking on map in pin drop mode) */}
        {isAddShelterMode && hasPlacedNewPin && (
          <div className="absolute top-4 right-4 z-[400] w-84 max-w-[92vw] bg-white/95 backdrop-blur-md rounded-3xl p-4 border border-emerald-400 shadow-2xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Deploy Relief Shelter</h4>
                  <div className="text-[10px] text-emerald-700 font-mono font-semibold">
                    📍 {newCampCoords[0]}, {newCampCoords[1]}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setHasPlacedNewPin(false);
                  setIsAddShelterMode(false);
                }}
                className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
                title="Cancel placement"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Quick Presets:
              </label>
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setNewCampName('Govt Girls High School, Lohian Ridge');
                    setNewCampPunjabi('ਸਰਕਾਰੀ ਕੰਨਿਆ ਹਾਈ ਸਕੂਲ');
                    setNewCampType('school');
                    setNewCampElevation(224);
                  }}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium"
                >
                  High School
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewCampName('Gurdwara Sri Baoli Sahib Relief Wing');
                    setNewCampPunjabi('ਗੁਰਦੁਆਰਾ ਸ੍ਰੀ ਬਾਉਲੀ ਸਾਹਿਬ');
                    setNewCampType('gurdwara');
                    setNewCampElevation(226);
                  }}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium"
                >
                  Gurdwara Sahib
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewCampName('Market Committee Grain Yards, Mandi');
                    setNewCampPunjabi('ਮਾਰਕੀਟ ਕਮੇਟੀ ਅਨਾਜ ਮੰਡੀ');
                    setNewCampType('mandi');
                    setNewCampElevation(220);
                  }}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium"
                >
                  Grain Mandi
                </button>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                  Shelter Name (English)
                </label>
                <input
                  type="text"
                  value={newCampName}
                  onChange={(e) => setNewCampName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Shelter Facility Name"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                  Name (Punjabi / ਗੁਰਮੁਖੀ)
                </label>
                <input
                  type="text"
                  value={newCampPunjabi}
                  onChange={(e) => setNewCampPunjabi(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="ਪੰਜਾਬੀ ਨਾਮ"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Capacity</label>
                  <input
                    type="number"
                    value={newCampCapacity}
                    onChange={(e) => setNewCampCapacity(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded-lg border border-slate-300 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Available Beds</label>
                  <input
                    type="number"
                    value={newCampBeds}
                    onChange={(e) => setNewCampBeds(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded-lg border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>

              <p className="text-[10px] text-slate-400 italic">
                Tip: Click anywhere on the map to re-position this pin.
              </p>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setHasPlacedNewPin(false);
                    setIsAddShelterMode(false);
                  }}
                  className="flex-1 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmittingCamp}
                  onClick={() => handleDeployCampSubmit()}
                  className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-md transition active:scale-95 disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSubmittingCamp ? 'Deploying...' : 'Deploy Shelter'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tactical Legend Box (Floating overlay) */}
        <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-slate-200/90 shadow-lg text-[10px] space-y-1.5 font-medium max-w-[210px] select-none">
          <div className="font-bold text-xs text-slate-900 border-b border-slate-100 pb-1">
            Map Tactical Legend
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-600 border border-white shrink-0 animate-ping" />
            <span className="text-slate-700">Citizen in Critical SOS / Trapped</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-500 border border-white shrink-0" />
            <span className="text-slate-700">Danger Zone Inundation</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-600 border border-white shrink-0" />
            <span className="text-slate-700">Evacuated / Safe Shelter</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-1.5 bg-emerald-500 rounded-sm shrink-0" />
            <span className="text-slate-700">Elevated Highway (Clear)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-1.5 bg-red-600 rounded-sm shrink-0" />
            <span className="text-slate-700">Submerged Road Breach</span>
          </div>
        </div>
      </div>

      {/* Deploy New Relief Shelter Modal */}
      {isDeployModalOpen && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Deploy Relief Shelter</h3>
                  <p className="text-xs text-slate-500">Live GIS high-ground shelter allocation for flood evacuees</p>
                </div>
              </div>
              <button
                onClick={() => setIsDeployModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Fill Presets */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Quick High-Ground Presets:
              </label>
              <div className="flex flex-wrap gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setNewCampName('Govt Girls High School, Lohian Ridge');
                    setNewCampPunjabi('ਸਰਕਾਰੀ ਕੰਨਿਆ ਹਾਈ ਸਕੂਲ, ਲੋਹੀਆਂ');
                    setNewCampType('school');
                    setNewCampElevation(222);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition"
                >
                  Lohian Ridge School
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewCampName('Gurdwara Sri Baoli Sahib Relief Wing');
                    setNewCampPunjabi('ਗੁਰਦੁਆਰਾ ਸ੍ਰੀ ਬਾਉਲੀ ਸਾਹਿਬ ਰਾਹਤ ਵਿੰਗ');
                    setNewCampType('gurdwara');
                    setNewCampElevation(226);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition"
                >
                  Baoli Sahib Gurdwara
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewCampName('Market Committee Grain Yards, Shahkot');
                    setNewCampPunjabi('ਮਾਰਕੀਟ ਕਮੇਟੀ ਅਨਾਜ ਮੰਡੀ, ਸ਼ਾਹਕੋਟ');
                    setNewCampType('mandi');
                    setNewCampElevation(220);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition"
                >
                  Shahkot Mandi Sheds
                </button>
              </div>
            </div>

            <form onSubmit={handleDeployCampSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Shelter Facility Name (English) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Govt Senior Secondary School, Lohian High Ground"
                  value={newCampName}
                  onChange={(e) => setNewCampName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Shelter Name (Punjabi / ਗੁਰਮੁਖੀ)
                </label>
                <input
                  type="text"
                  placeholder="e.g. ਸਰਕਾਰੀ ਸੀਨੀਅਰ ਸੈਕੰਡਰੀ ਸਕੂਲ"
                  value={newCampPunjabi}
                  onChange={(e) => setNewCampPunjabi(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Facility Type</label>
                  <select
                    value={newCampType}
                    onChange={(e) => setNewCampType(e.target.value as 'school' | 'gurdwara' | 'college' | 'mandi')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs bg-white"
                  >
                    <option value="school">School / College</option>
                    <option value="gurdwara">Gurdwara / Shrine</option>
                    <option value="college">College Campus</option>
                    <option value="mandi">Grain Market Mandi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Elevation (Meters)</label>
                  <input
                    type="number"
                    min="200"
                    max="350"
                    value={newCampElevation}
                    onChange={(e) => setNewCampElevation(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                  />
                </div>
              </div>

              {/* Coordinates */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between text-slate-700 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>GPS High-Ground Coordinates</span>
                  </span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-mono">
                    {newCampCoords[0]}, {newCampCoords[1]}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="0.0001"
                    value={newCampCoords[0]}
                    onChange={(e) => setNewCampCoords([Number(e.target.value), newCampCoords[1]])}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono"
                    placeholder="Latitude"
                  />
                  <input
                    type="number"
                    step="0.0001"
                    value={newCampCoords[1]}
                    onChange={(e) => setNewCampCoords([newCampCoords[0], Number(e.target.value)])}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono"
                    placeholder="Longitude"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Total Capacity</label>
                  <input
                    type="number"
                    min="50"
                    max="5000"
                    value={newCampCapacity}
                    onChange={(e) => setNewCampCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Initial Beds</label>
                  <input
                    type="number"
                    min="10"
                    max={newCampCapacity}
                    value={newCampBeds}
                    onChange={(e) => setNewCampBeds(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Emergency Helpline Phone</label>
                <input
                  type="text"
                  value={newCampContact}
                  onChange={(e) => setNewCampContact(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-mono"
                  placeholder="+91 181 2224455"
                />
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newCampMedical}
                    onChange={(e) => setNewCampMedical(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span className="font-semibold text-slate-800">Doctor on Duty</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newCampLangar}
                    onChange={(e) => setNewCampLangar(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span className="font-semibold text-slate-800">Langar / Rations Active</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDeployModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCamp}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center gap-1.5 shadow-md active:scale-95 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSubmittingCamp ? 'Deploying...' : 'Deploy to Network'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Decommission Shelter Modal */}
      {campToDelete && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-red-100 w-full max-w-md space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
                <AlertOctagon className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Decommission Relief Shelter</h3>
                <p className="text-xs text-red-600 font-semibold">Immediate GIS Network Removal</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="font-bold text-slate-900">{campToDelete.name}</div>
              <div className="text-[11px] text-slate-600">{campToDelete.punjabiName}</div>
              <div className="text-[10px] font-mono text-slate-500">
                Available Beds: {campToDelete.availableBeds} / {campToDelete.capacity} • Elevation: {campToDelete.elevation}m
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Are you sure you want to decommission this shelter? It will be immediately removed from all citizen mobile devices, and active evacuation navigation will automatically redirect to the nearest alternative high-ground shelter.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => setCampToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition flex items-center gap-1.5 shadow-md active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Decommission</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
