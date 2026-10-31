// CTBF-AI-12: Centralized Flood App Context & Hydrological State Machine
// Integrated with Persistent Backend Layer & Dynamic Route Obstacles

'use client';

import React, { createContext, useContext, useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { PUNJAB_VILLAGES, RELIEF_CAMPS, VillageData, ReliefCamp } from '../data/villagesAndCamps';
import { FLOOD_REPLAY_2023, FloodReplayStep } from '../data/floodReplay2023';
import { calculateVillageRisk, VillageHydrologyForecast } from '../lib/hydrologyEngine';
import { calculateSafeEvacuationRoute, EvacuationRouteResult } from '../lib/dijkstraRouter';
import { playPunjabiVoiceAlert, playPreRecordedEmergencyAudio, stopSpeech } from '../lib/punjabiSpeech';
import { emergencySound } from '../lib/emergencyAudio';
import type { TelemetryRecord } from '../lib/serverDb';

export type AppTab = 'home' | 'map' | 'alerts' | 'report' | 'replay' | 'account';

export interface CitizenReportItem {
  id: string;
  villageId: string;
  roadId: string;
  landmark: string;
  timestamp: string;
  verifiedHazard: boolean;
  confidenceScore: number;
  photoUrl: string;
  notes: string;
}

export interface CitizenProfile {
  name: string;
  phone: string;
  familyMembers: number;
  cattleCount: number;
  medicalNeeds: string;
}

export interface MeshBeaconRecord {
  id: string;
  timestamp: string;
  senderName: string;
  senderPhone: string;
  villageName: string;
  coords: [number, number];
  familyMembers: number;
  cattleCount: number;
  medicalNeeds: string;
  hops: number;
  packetHash: string;
  smsBody: string;
  gatewayNode?: string;
}

interface FloodAppContextType {
  activeVillage: VillageData;
  setActiveVillage: (v: VillageData) => void;
  selectedStepIndex: number;
  setSelectedStepIndex: React.Dispatch<React.SetStateAction<number>>;
  currentStep: FloodReplayStep;
  currentForecast: VillageHydrologyForecast;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  language: 'pa' | 'en';
  setLanguage: (lang: 'pa' | 'en') => void;
  blockedRoadIds: string[];
  addBlockedRoad: (roadId: string, reason?: string) => Promise<void>;
  removeBlockedRoad: (roadId: string) => Promise<void>;
  citizenReports: CitizenReportItem[];
  addCitizenReport: (report: CitizenReportItem) => Promise<void>;
  reliefCamps: ReliefCamp[];
  preferredCampId: string | null;
  setPreferredCampId: (id: string | null) => void;
  evacuationRoute: EvacuationRouteResult;
  isOffline: boolean;
  refreshBackendState: () => Promise<void>;
  isNavigating: boolean;
  setIsNavigating: (v: boolean) => void;
  autoVoiceEnabled: boolean;
  setAutoVoiceEnabled: (v: boolean) => void;
  isSpeakingAlert: boolean;
  stopActiveVoice: () => void;
  citizenProfile: CitizenProfile;
  updateCitizenProfile: (p: Partial<CitizenProfile>) => void;
  incomingMeshBeacon: MeshBeaconRecord | null;
  setIncomingMeshBeacon: (b: MeshBeaconRecord | null) => void;
  dismissMeshBeacon: () => void;
  backendTelemetry: TelemetryRecord | null;
  showEvacuationTakeover: boolean;
  setShowEvacuationTakeover: (v: boolean) => void;
  isSirenActive: boolean;
  toggleSiren: () => void;
  isAudioUnlocked: boolean;
  unlockAudio: () => boolean;
  acknowledgeEvacuation: () => Promise<void>;
}

const FloodAppContext = createContext<FloodAppContextType | undefined>(undefined);

export function FloodAppProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = Boolean(pathname?.startsWith('/admin'));

  const [activeVillage, setActiveVillage] = useState<VillageData>(PUNJAB_VILLAGES[0]);
  const [selectedStepIndex, setSelectedStepIndex] = useState<number>(1); // Default to T-48h (Prepare)
  const [activeTab, setActiveTab] = useState<AppTab>('home');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab') as AppTab | null;
      if (tab && ['home', 'map', 'alerts', 'report', 'account'].includes(tab)) {
        setActiveTab(tab);
      }
    }
  }, []);
  const [language, setLanguage] = useState<'pa' | 'en'>('pa');
  const [persistentBlockedRoads, setPersistentBlockedRoads] = useState<string[]>([]);
  const [reliefCamps, setReliefCamps] = useState<ReliefCamp[]>(Object.values(RELIEF_CAMPS));
  const [preferredCampId, setPreferredCampId] = useState<string | null>(null);
  const [citizenReports, setCitizenReports] = useState<CitizenReportItem[]>([]);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [autoVoiceEnabled, setAutoVoiceEnabled] = useState<boolean>(true);
  const [isSpeakingAlert, setIsSpeakingAlert] = useState<boolean>(false);
  const [hasUserInteracted, setHasUserInteracted] = useState<boolean>(false);
  const [backendTelemetry, setBackendTelemetry] = useState<TelemetryRecord | null>(null);
  const [showEvacuationTakeover, setShowEvacuationTakeover] = useState<boolean>(false);
  const [isSirenActive, setIsSirenActive] = useState<boolean>(false);
  const [isAudioUnlocked, setIsAudioUnlocked] = useState<boolean>(false);
  const lastSpokenKeyRef = useRef<string>('');
  const knownCampIdsRef = useRef<Set<string>>(new Set(Object.keys(RELIEF_CAMPS)));
  const lastSpokenHeadlineRef = useRef<string>('');

  // Live P2P Mesh SOS Beacon State
  const [incomingMeshBeacon, setIncomingMeshBeacon] = useState<MeshBeaconRecord | null>(null);
  const acknowledgedBeaconHashesRef = useRef<Set<string>>(new Set());

  const dismissMeshBeacon = useCallback(() => {
    if (incomingMeshBeacon) {
      acknowledgedBeaconHashesRef.current.add(incomingMeshBeacon.packetHash);
    }
    setIncomingMeshBeacon(null);
  }, [incomingMeshBeacon]);

  // Citizen Disaster Profile / Account State
  const [citizenProfile, setCitizenProfile] = useState<CitizenProfile>({
    name: 'ਗੁਰਪ੍ਰੀਤ ਸਿੰਘ (Gurpreet Singh)',
    phone: '+91 98765 43210',
    familyMembers: 5,
    cattleCount: 4,
    medicalNeeds: 'Elderly diabetic parent (requires dry tractor corridor)',
  });

  const updateCitizenProfile = useCallback((updates: Partial<CitizenProfile>) => {
    setCitizenProfile((prev) => ({ ...prev, ...updates }));
  }, []);

  const stopActiveVoice = useCallback(() => {
    stopSpeech();
    setIsSpeakingAlert(false);
  }, []);

  // Restore cached snapshot on mount for instant zero-network rehydration
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const cached = localStorage.getItem('sanjeevani_offline_bundle');
      if (cached) {
        const bundle = JSON.parse(cached);
        if (bundle.telemetry) setBackendTelemetry(bundle.telemetry);
        if (Array.isArray(bundle.camps) && bundle.camps.length > 0) setReliefCamps(bundle.camps);
        if (Array.isArray(bundle.activeBlockedRoadIds)) setPersistentBlockedRoads(bundle.activeBlockedRoadIds);
        if (Array.isArray(bundle.reports) && bundle.reports.length > 0) setCitizenReports(bundle.reports);
      }
    } catch (e) {
      console.warn('Could not read cached bundle from localStorage:', e);
    }
  }, []);

  // Sync state from persistent backend
  const refreshBackendState = useCallback(async () => {
    try {
      const res = await fetch('/api/offline-sync');
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && data.offlineBundle) {
        // Cache to localStorage for offline survival
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('sanjeevani_offline_bundle', JSON.stringify(data.offlineBundle));
          } catch (e) {
            console.warn('Could not cache offline bundle:', e);
          }
        }

        if (data.offlineBundle.telemetry) {
          const tel = data.offlineBundle.telemetry;
          setBackendTelemetry(tel);
        }
        if (Array.isArray(data.offlineBundle.camps) && data.offlineBundle.camps.length > 0) {
          const next = data.offlineBundle.camps as ReliefCamp[];
          knownCampIdsRef.current = new Set(next.map((c) => c.id));

          setReliefCamps((prev) => {
            if (
              prev.length === next.length &&
              prev.every((c, i) => c.id === next[i]?.id && c.availableBeds === next[i]?.availableBeds)
            ) {
              return prev;
            }
            return next;
          });
        }
        if (Array.isArray(data.offlineBundle.activeBlockedRoadIds)) {
          setPersistentBlockedRoads((prev) => {
            const next = data.offlineBundle.activeBlockedRoadIds as string[];
            if (prev.length === next.length && prev.every((v, i) => v === next[i])) return prev;
            return next;
          });
        }
        if (Array.isArray(data.offlineBundle.reports) && data.offlineBundle.reports.length > 0) {
          setCitizenReports((prev) => {
            const next = data.offlineBundle.reports as CitizenReportItem[];
            if (prev.length === next.length && prev[0]?.id === next[0]?.id) return prev;
            return next;
          });
        }
        if (data.offlineBundle.latestMeshBeacon) {
          const beacon = data.offlineBundle.latestMeshBeacon as MeshBeaconRecord;
          const lastSentHash = typeof window !== 'undefined' ? sessionStorage.getItem('last_sent_mesh_hash') : null;
          const isSelfSent = lastSentHash === beacon.packetHash;
          const isAcknowledged = acknowledgedBeaconHashesRef.current.has(beacon.packetHash);
          const ageMs = Date.now() - new Date(beacon.timestamp).getTime();
          if (!isSelfSent && !isAcknowledged && ageMs < 180000) {
            setIncomingMeshBeacon(beacon);
          }
        }
      }
    } catch (err) {
      console.warn('Backend sync offline fallback:', err);
    }
  }, []);

  // Poll backend every 2 seconds for live peer-to-peer mesh broadcasts
  useEffect(() => {
    const pollTimer = setInterval(() => {
      refreshBackendState();
    }, 2000);
    return () => clearInterval(pollTimer);
  }, [refreshBackendState]);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOffline(false);
      refreshBackendState();

      // Flush offline report queue if connection is restored
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem('sanjeevani_queued_reports');
          if (raw) {
            const queued: CitizenReportItem[] = JSON.parse(raw);
            if (Array.isArray(queued) && queued.length > 0) {
              for (const item of queued) {
                await fetch('/api/reports', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(item),
                }).catch(() => {});
              }
              localStorage.removeItem('sanjeevani_queued_reports');
            }
          }
        } catch (e) {
          console.warn('Failed to flush offline queued reports:', e);
        }
      }
    };
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOffline(!navigator.onLine);

    // Initial backend fetch
    refreshBackendState();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refreshBackendState]);

  const currentStep = useMemo(() => {
    const replayBase = FLOOD_REPLAY_2023[selectedStepIndex] || FLOOD_REPLAY_2023[0];
    if (activeTab === 'replay' || !backendTelemetry) {
      return replayBase;
    }
    return {
      ...replayBase,
      bhakraDamDischargeCusecs: backendTelemetry.bhakraDamDischargeCusecs,
      pongDamDischargeCusecs: backendTelemetry.pongDamDischargeCusecs ?? replayBase.pongDamDischargeCusecs,
      kaushalyaDamDischargeCusecs: backendTelemetry.kaushalyaDamDischargeCusecs ?? replayBase.kaushalyaDamDischargeCusecs,
      phillaurGaugeMeters: backendTelemetry.phillaurGaugeMeters,
      harikeDownstreamCusecs: backendTelemetry.harikeDownstreamCusecs ?? replayBase.harikeDownstreamCusecs,
      catchmentRainfall24hMm: backendTelemetry.catchmentRainfall24hMm ?? replayBase.catchmentRainfall24hMm,
      sutlejWaterLevelRelative: backendTelemetry.sutlejWaterLevelRelative ?? replayBase.sutlejWaterLevelRelative,
      systemAlertHeadline: {
        en: backendTelemetry.headlineEn || replayBase.systemAlertHeadline.en,
        pa: backendTelemetry.headlinePa || replayBase.systemAlertHeadline.pa,
      },
      evacuationBroadcast: backendTelemetry.evacuationBroadcast,
    };
  }, [selectedStepIndex, activeTab, backendTelemetry]);

  const allBlockedRoads = useMemo(() => {
    const fromReplay = currentStep.blockedRoadSegments || [];
    return Array.from(new Set([...fromReplay, ...persistentBlockedRoads]));
  }, [currentStep, persistentBlockedRoads]);

  const currentForecast = useMemo(() => {
    return calculateVillageRisk(activeVillage, currentStep);
  }, [activeVillage, currentStep]);

  const evacuationRoute = useMemo(() => {
    return calculateSafeEvacuationRoute(activeVillage, allBlockedRoads, reliefCamps, preferredCampId || undefined);
  }, [activeVillage, allBlockedRoads, reliefCamps, preferredCampId]);

  const addBlockedRoad = async (roadId: string, reason?: string) => {
    // Optimistic local update
    setPersistentBlockedRoads((prev) => (prev.includes(roadId) ? prev : [...prev, roadId]));

    try {
      await fetch('/api/obstacles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roadId,
          roadName: roadId,
          villageId: activeVillage.id,
          reason: reason || 'Blocked by field advisor / breach hazard',
          severity: 'CRITICAL',
        }),
      });
    } catch (e) {
      console.warn('Could not post obstacle to server, running offline:', e);
    }
  };

  const removeBlockedRoad = async (roadId: string) => {
    // Optimistic local update
    setPersistentBlockedRoads((prev) => prev.filter((id) => id !== roadId));

    try {
      await fetch(`/api/obstacles?roadId=${encodeURIComponent(roadId)}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.warn('Could not delete obstacle on server, running offline:', e);
    }
  };

  const addCitizenReport = async (report: CitizenReportItem) => {
    // Optimistic local update
    setCitizenReports((prev) => [report, ...prev]);

    if (report.verifiedHazard && report.roadId) {
      await addBlockedRoad(report.roadId, report.notes || 'Breach reported by citizen camera');
    }

    try {
      await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
      });
    } catch (e) {
      console.warn('Could not post citizen report to server, queuing for offline sync:', e);
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem('sanjeevani_queued_reports');
          const queued = raw ? JSON.parse(raw) : [];
          queued.push(report);
          localStorage.setItem('sanjeevani_queued_reports', JSON.stringify(queued));
        } catch (storageErr) {
          console.warn('LocalStorage report queuing error:', storageErr);
        }
      }
    }
  };

  // Register initial user gesture to unlock browser audio autoplay
  useEffect(() => {
    const registerInteraction = () => {
      setHasUserInteracted(true);
      emergencySound.unlockAudio();
      setIsAudioUnlocked(true);
    };
    window.addEventListener('click', registerInteraction, { once: true });
    window.addEventListener('touchstart', registerInteraction, { once: true });
    window.addEventListener('keydown', registerInteraction, { once: true });
    return () => {
      window.removeEventListener('click', registerInteraction);
      window.removeEventListener('touchstart', registerInteraction);
      window.removeEventListener('keydown', registerInteraction);
    };
  }, []);

  const acknowledgeEvacuation = useCallback(async () => {
    acknowledgedBroadcastIdRef.current = backendTelemetry?.id || 'acknowledged';

    emergencySound.stopSiren();
    setIsSirenActive(false);
    stopActiveVoice();
    setShowEvacuationTakeover(false);

    try {
      await fetch('/api/offline-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          villageId: activeVillage.id,
          villageName: activeVillage.name,
          citizenName: citizenProfile.name,
        }),
      });
    } catch (e) {
      console.warn('Failed to send citizen acknowledgement:', e);
    }
  }, [activeVillage, citizenProfile.name, stopActiveVoice]);

  const toggleSiren = useCallback(() => {
    emergencySound.unlockAudio();
    if (isSirenActive) {
      emergencySound.stopSiren();
      setIsSirenActive(false);
    } else {
      emergencySound.startSiren(0.45, true);
      setIsSirenActive(true);
    }
  }, [isSirenActive]);

  const unlockAudio = useCallback(() => {
    const success = emergencySound.unlockAudio();
    setIsAudioUnlocked(true);
    setHasUserInteracted(true);
    return success;
  }, []);

  // Global one-time interaction listener to unlock audio on first touch anywhere on device
  useEffect(() => {
    const handleFirstTouch = () => {
      emergencySound.unlockAudio();
      setIsAudioUnlocked(true);
      setHasUserInteracted(true);
    };
    window.addEventListener('click', handleFirstTouch, { passive: true });
    window.addEventListener('touchstart', handleFirstTouch, { passive: true });
    window.addEventListener('keydown', handleFirstTouch, { passive: true });
    return () => {
      window.removeEventListener('click', handleFirstTouch);
      window.removeEventListener('touchstart', handleFirstTouch);
      window.removeEventListener('keydown', handleFirstTouch);
    };
  }, []);

  const lastBroadcastIdRef = useRef<string | null>(null);
  const prevBroadcastActiveRef = useRef<boolean>(false);
  const acknowledgedBroadcastIdRef = useRef<string | null>(null);

  // Synchronized Emergency Siren & Evacuation Takeover triggered directly by Admin Panel broadcast
  useEffect(() => {
    // Sirens and full-screen evacuation takeovers are exclusively for citizen phone devices; never trigger on admin dashboard
    if (isAdminRoute) {
      emergencySound.stopSiren();
      setIsSirenActive(false);
      setShowEvacuationTakeover(false);
      return;
    }

    const isBroadcastActive = Boolean(currentStep.evacuationBroadcast);
    const currentBroadcastId = backendTelemetry?.id || (isBroadcastActive ? 'active_broadcast' : null);

    if (isBroadcastActive) {
      // If citizen already acknowledged THIS exact broadcast ID, don't re-trigger it
      if (acknowledgedBroadcastIdRef.current && acknowledgedBroadcastIdRef.current === currentBroadcastId) {
        return;
      }

      // Check if this is a newly received broadcast event
      const isNewBroadcastEvent =
        !prevBroadcastActiveRef.current || (currentBroadcastId && currentBroadcastId !== lastBroadcastIdRef.current);

      if (isNewBroadcastEvent) {
        prevBroadcastActiveRef.current = true;
        if (currentBroadcastId) {
          lastBroadcastIdRef.current = currentBroadcastId;
        }

        setShowEvacuationTakeover(true);
        setIsSirenActive(true);
        emergencySound.unlockAudio();
        emergencySound.startSiren(0.45);

        if (autoVoiceEnabled) {
          const isPa = language === 'pa';
          emergencySound.duckSiren(0.06);

          playPreRecordedEmergencyAudio(
            'evacuation',
            isPa ? 'pa' : 'en',
            () => {
              setIsSpeakingAlert(true);
              emergencySound.duckSiren(0.06);
            },
            () => {
              setIsSpeakingAlert(false);
              emergencySound.restoreSiren(0.4);
            },
            () => {
              setIsSpeakingAlert(false);
              emergencySound.restoreSiren(0.4);
            }
          );
        }
      }
    } else {
      // Broadcast is NOT active (normal baseline or stood down by DC)
      if (prevBroadcastActiveRef.current || showEvacuationTakeover || acknowledgedBroadcastIdRef.current) {
        prevBroadcastActiveRef.current = false;
        lastBroadcastIdRef.current = null;
        acknowledgedBroadcastIdRef.current = null; // Clear acknowledgement so future broadcasts can fire cleanly
        emergencySound.stopSiren();
        setIsSirenActive(false);
        setShowEvacuationTakeover(false);
        stopActiveVoice();
      }
    }
  }, [
    isAdminRoute,
    currentStep.evacuationBroadcast,
    backendTelemetry?.id,
    autoVoiceEnabled,
    language,
    showEvacuationTakeover,
    stopActiveVoice,
  ]);

  return (
    <FloodAppContext.Provider
      value={{
        activeVillage,
        setActiveVillage,
        selectedStepIndex,
        setSelectedStepIndex,
        currentStep,
        currentForecast,
        activeTab,
        setActiveTab,
        language,
        setLanguage,
        blockedRoadIds: allBlockedRoads,
        addBlockedRoad,
        removeBlockedRoad,
        citizenReports,
        addCitizenReport,
        reliefCamps,
        preferredCampId,
        setPreferredCampId,
        evacuationRoute,
        isOffline,
        refreshBackendState,
        isNavigating,
        setIsNavigating,
        autoVoiceEnabled,
        setAutoVoiceEnabled,
        isSpeakingAlert,
        stopActiveVoice,
        citizenProfile,
        updateCitizenProfile,
        incomingMeshBeacon,
        setIncomingMeshBeacon,
        dismissMeshBeacon,
        backendTelemetry,
        showEvacuationTakeover,
        setShowEvacuationTakeover,
        isSirenActive,
        toggleSiren,
        isAudioUnlocked,
        unlockAudio,
        acknowledgeEvacuation,
      }}
    >
      {children}
    </FloodAppContext.Provider>
  );
}

export function useFloodApp(): FloodAppContextType {
  const context = useContext(FloodAppContext);
  if (!context) {
    throw new Error('useFloodApp must be used within a FloodAppProvider');
  }
  return context;
}
