// CTBF-AI-12: Punjab SDMA / District Emergency Operations Center (DEOC) Command Center
// Prototype for SDMA / DC Administration — Jalandhar & Sutlej Basin
// Soft-neumorphic design (#F4F6FA), strictly Lucide icons, tabular monospace telemetry

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import {
  ShieldAlert,
  Radio,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  Truck,
  Anchor,
  Activity,
  ExternalLink,
  RefreshCw,
  Compass,
  Check,
  AlertOctagon,
  Building,
  FileText,
  Printer,
  X,
  Trash2,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Cpu,
} from 'lucide-react';
import type {
  TelemetryRecord,
  CitizenReportRecord,
  MeshBeaconRecord,
  CitizenAcknowledgementRecord,
} from '@/lib/serverDb';
import type { ReliefCamp, VillageData } from '@/data/villagesAndCamps';

// Tactical Geospatial Map (Dynamic import for clean Next.js client-side Leaflet rendering)
const AdminGeospatialMap = dynamic(
  () =>
    import('@/components/admin/AdminGeospatialMap').catch((err) => {
      console.warn('Admin map chunk load fallback:', err);
      return function OfflineAdminMapFallback() {
        return (
          <div className="w-full h-[540px] bg-white rounded-3xl border border-slate-200/90 flex flex-col items-center justify-center text-slate-500 font-mono text-xs gap-2">
            <span>Tactical Map operating in offline cached mode</span>
          </div>
        );
      };
    }),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[540px] bg-white rounded-3xl border border-slate-200/90 flex flex-col items-center justify-center text-slate-400 font-mono text-xs gap-2">
        <Compass className="w-8 h-8 text-blue-500 animate-spin" />
        <span>Loading Punjab SDMA Geospatial Map Engine...</span>
      </div>
    ),
  }
);

export default function AdminCommandCenter() {
  // Live State
  const [telemetry, setTelemetry] = useState<TelemetryRecord | null>(null);
  const [villages, setVillages] = useState<VillageData[]>([]);
  const [camps, setCamps] = useState<ReliefCamp[]>([]);
  const [activeObstacleRoadIds, setActiveObstacleRoadIds] = useState<string[]>([]);
  const [reports, setReports] = useState<CitizenReportRecord[]>([]);
  const [meshBeacons, setMeshBeacons] = useState<MeshBeaconRecord[]>([]);
  const [acknowledgements, setAcknowledgements] = useState<CitizenAcknowledgementRecord[]>([]);
  const [lastSyncedAt, setLastSyncedAt] = useState<string>('Connecting...');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Dam Discharge Control State (Human-in-the-Loop)
  const [damSliderValue, setDamSliderValue] = useState<number>(112000);
  const [phillaurSliderValue, setPhillaurSliderValue] = useState<number>(233.8);
  const [isUpdatingTelemetry, setIsUpdatingTelemetry] = useState<boolean>(false);
  const [isBroadcastingEvac, setIsBroadcastingEvac] = useState<boolean>(false);
  const [showEvacConfirmModal, setShowEvacConfirmModal] = useState<boolean>(false);
  const [showSitrepModal, setShowSitrepModal] = useState<boolean>(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync state from serverDb snapshot
  const fetchDashboardData = useCallback(async () => {
    try {
      const res = await fetch('/api/offline-sync');
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && data.offlineBundle) {
        const bundle = data.offlineBundle;
        if (bundle.telemetry) {
          setTelemetry(bundle.telemetry);
          // Only sync slider on first load
          if (isLoading) {
            setDamSliderValue(bundle.telemetry.bhakraDamDischargeCusecs || 112000);
            setPhillaurSliderValue(bundle.telemetry.phillaurGaugeMeters || 233.8);
          }
        }
        if (Array.isArray(bundle.villages)) setVillages(bundle.villages);
        if (Array.isArray(bundle.camps)) setCamps(bundle.camps);
        if (Array.isArray(bundle.activeBlockedRoadIds)) setActiveObstacleRoadIds(bundle.activeBlockedRoadIds);
        if (Array.isArray(bundle.reports)) setReports(bundle.reports);
        if (Array.isArray(bundle.allMeshBeacons)) setMeshBeacons(bundle.allMeshBeacons);
        if (Array.isArray(bundle.citizenAcknowledgements)) setAcknowledgements(bundle.citizenAcknowledgements);
        setLastSyncedAt(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        setIsLoading(false);
      }
    } catch (err) {
      console.warn('Admin fetch error:', err);
    }
  }, [isLoading]);

  // Poll server state every 2 seconds for live telemetry updates
  useEffect(() => {
    fetchDashboardData();
    const timer = setInterval(fetchDashboardData, 2000);
    return () => clearInterval(timer);
  }, [fetchDashboardData]);

  // Flash action notification
  const triggerToast = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  // Preset Hydrological Scenario handlers
  const applyPresetScenario = (cusecs: number, gauge: number) => {
    setDamSliderValue(cusecs);
    setPhillaurSliderValue(gauge);
  };

  // 1. Submit Dam Discharge Telemetry (Routine Update)
  const handleUpdateTelemetry = async () => {
    setIsUpdatingTelemetry(true);
    try {
      const res = await fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bhakraDamDischargeCusecs: damSliderValue,
          phillaurGaugeMeters: phillaurSliderValue,
          headlineEn: `Dam discharge adjusted to ${damSliderValue.toLocaleString('en-IN')} cusecs by DEOC`,
          headlinePa: `ਡਿਪਟੀ ਕਮਿਸ਼ਨਰ ਦਫ਼ਤਰ ਵੱਲੋਂ ਡੈਮ ਪਾਣੀ ਵਹਾਅ ${damSliderValue.toLocaleString('en-IN')} ਕਿਊਸਿਕ ਅੱਪਡੇਟ ਕੀਤਾ ਗਿਆ`,
          evacuationBroadcast: false,
        }),
      });
      if (res.ok) {
        triggerToast(`Telemetry updated to ${damSliderValue.toLocaleString('en-IN')} cusecs. Pushed to all citizen apps.`);
        fetchDashboardData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdatingTelemetry(false);
    }
  };

  // 2. Broadcast Emergency Evacuation Order (Human DC Approval)
  const handleBroadcastEvacuation = async () => {
    setIsBroadcastingEvac(true);
    setShowEvacConfirmModal(false);
    try {
      const res = await fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bhakraDamDischargeCusecs: Math.max(damSliderValue, 195000),
          phillaurGaugeMeters: Math.max(phillaurSliderValue, 235.2),
          headlineEn: 'MANDATORY EVACUATION ORDER: Approved by Deputy Commissioner / SDMA',
          headlinePa: 'ਡਿਪਟੀ ਕਮਿਸ਼ਨਰ ਜਲੰਧਰ ਵੱਲੋਂ ਹੜ੍ਹ ਪ੍ਰਭਾਵਿਤ ਪਿੰਡਾਂ ਲਈ ਤੁਰੰਤ ਨਿਕਾਸੀ ਦਾ ਹੁਕਮ ਜਾਰੀ',
          evacuationBroadcast: true,
          broadcastApprovedBy: 'DC Office / SDMA Command Center Jalandhar',
        }),
      });
      if (res.ok) {
        triggerToast('MANDATORY EVACUATION DIRECTIVE BROADCAST. Transmitted to citizen devices across sector.');
        fetchDashboardData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsBroadcastingEvac(false);
    }
  };

  // 3. Cancel / Stand Down Evacuation
  const handleCancelEvacuation = async () => {
    try {
      const res = await fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bhakraDamDischargeCusecs: 45000,
          phillaurGaugeMeters: 232.4,
          headlineEn: 'Evacuation order stood down. Normal monitoring resumed.',
          headlinePa: 'ਨਿਕਾਸੀ ਅਲਰਟ ਵਾਪਸ ਲਿਆ ਗਿਆ। ਆਮ ਨਿਗਰਾਨੀ ਜਾਰੀ ਹੈ।',
          evacuationBroadcast: false,
        }),
      });
      if (res.ok) {
        triggerToast('Evacuation stood down. Safe baseline restored.');
        fetchDashboardData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 3c. Broadcast Simulated P2P Mesh SOS Beacon to all Citizen Devices
  const handleBroadcastMeshSOS = async () => {
    try {
      const res = await fetch('/api/send-mesh-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: 'ਜਸਵੀਰ ਸਿੰਘ (Jasvir Singh - Ward 3)',
          senderPhone: '+91 98723 11223',
          villageName: 'Lohian Khas',
          coords: [31.1215, 75.2298],
          familyMembers: 5,
          cattleCount: 4,
          medicalNeeds: 'Elderly diabetic parent & infant (water entering courtyard)',
          hops: 1,
        }),
      });
      if (res.ok) {
        triggerToast('P2P MESH SOS BEACON BROADCAST! Transmitted to citizen devices.');
        fetchDashboardData();
      }
    } catch {
      triggerToast('Error broadcasting mesh SOS');
    }
  };

  // 3b. Master Demo Reset — Restores 45k baseline, clears obstacles & acknowledgements
  const handleResetDemo = async () => {
    try {
      const res = await fetch('/api/reset-demo', { method: 'POST' });
      if (res.ok) {
        triggerToast('Demo reset to safe baseline (45,000 cusecs, roads clear, normal monitoring).');
        setDamSliderValue(45000);
        setPhillaurSliderValue(232.4);
        await fetchDashboardData();
      }
    } catch (e) {
      console.error(e);
      triggerToast('Error resetting demo baseline');
    }
  };

  // 4. Toggle Road Obstacles (Instant Dijkstra Rerouting)
  const handleToggleRoad = async (roadId: string, currentlyBlocked: boolean, roadName: string) => {
    try {
      if (currentlyBlocked) {
        await fetch(`/api/obstacles?roadId=${encodeURIComponent(roadId)}`, { method: 'DELETE' });
        triggerToast(`Road ${roadName} reopened. Citizen Dijkstra route updated.`);
      } else {
        await fetch('/api/obstacles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roadId,
            roadName,
            reportedBy: 'DEOC District Operations Officer',
            reason: 'Administrative road closure due to approaching flood crest',
            severity: 'CRITICAL',
          }),
        });
        triggerToast(`Road ${roadName} BLOCKED. Citizen safe routing recalculating away from segment.`);
      }
      fetchDashboardData();
    } catch (e) {
      console.error(e);
    }
  };

  // 5. Approve or Dismiss Citizen Camera Breach Reports
  const handleReportAction = async (reportId: string, action: 'approve' | 'dismiss') => {
    try {
      const res = await fetch('/api/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reportId, action }),
      });
      if (res.ok) {
        triggerToast(action === 'approve' ? 'Breach report APPROVED. Road blocked and safe route recalculated.' : 'Report dismissed.');
        fetchDashboardData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 6. Dispatch NDRF Rescue Boat for Mesh Beacon
  const handleDispatchBoat = async (beaconId: string, senderName: string) => {
    try {
      const res = await fetch('/api/send-mesh-sms', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ beaconId }),
      });
      if (res.ok) {
        triggerToast(`NDRF Motorized Inflatable Boat dispatched for ${senderName}!`);
        fetchDashboardData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 7. Adjust Relief Camp Bed Capacity
  const handleAdjustBeds = async (campId: string, delta: number) => {
    try {
      const res = await fetch('/api/camps', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: campId, bedDelta: delta }),
      });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 8. Deploy New Relief Shelter to GIS Network
  const handleAddCamp = async (newCampData: Omit<ReliefCamp, 'id'> & { id?: string }) => {
    try {
      const res = await fetch('/api/camps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCampData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast(`Relief Shelter "${data.camp.name}" deployed and broadcast to all citizen phones!`);
        await fetchDashboardData();
        return;
      }
      triggerToast(`Failed to deploy shelter: ${data.error || 'Server error'}`);
    } catch (e) {
      console.error(e);
      triggerToast('Error connecting to shelter deployment API');
    }
  };

  // 9. Decommission / Delete Relief Shelter
  const handleDeleteCamp = async (campId: string) => {
    try {
      const targetCamp = camps.find((c) => c.id === campId);
      const campName = targetCamp?.name || campId;
      const res = await fetch(`/api/camps?id=${encodeURIComponent(campId)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast(`Shelter "${campName}" decommissioned. Citizen routes automatically rerouted!`);
        await fetchDashboardData();
        return;
      }
      triggerToast(`Failed to decommission shelter: ${data.error || 'Server error'}`);
    } catch (e) {
      console.error(e);
      triggerToast('Error connecting to shelter decommission API');
    }
  };

  const isEvacuationActive = Boolean(telemetry?.evacuationBroadcast);

  // Key roads monitored for live demo
  const monitoredRoads = [
    { id: 'road_lohian_makhu_low', name: 'Lohian–Makhu Low Link Road', desc: 'Low-lying culvert section vulnerable to backflow' },
    { id: 'road_gidderpindi_causeway', name: 'Gidderpindi Railway Causeway', desc: 'Railway overpass access road, prone to mud silt' },
    { id: 'road_mandala_channa_bundh', name: 'Mandala Channa Dhussi Bandh Link', desc: 'Dhussi embankment service crest' },
    { id: 'road_sh25_elevated', name: 'State Highway 25 (Elevated Corridor)', desc: 'Primary elevated concrete evacuation trunk route' },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6FA] text-[#0F172A] font-sans antialiased">
      {/* Toast Notification */}
      {actionSuccessMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#0F172A] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-medium">{actionSuccessMessage}</span>
        </div>
      )}

      {/* Confirmation Modal for Evacuation Order */}
      {showEvacConfirmModal && (
        <div className="fixed inset-0 z-[9999] bg-[#0F172A]/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Authorize Emergency Evacuation Broadcast?</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                This will officially transmit a <strong>Mandatory Evacuation Directive</strong> to all connected citizen devices in the Sutlej basin.
                Citizen devices will receive emergency route guidance to designated relief shelters and high ground.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Bhakra Release:</span>
                <span className="font-bold text-slate-800">{Math.max(damSliderValue, 195000).toLocaleString('en-IN')} cusecs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phillaur Gauge:</span>
                <span className="font-bold text-red-600">{Math.max(phillaurSliderValue, 235.2)} m (Danger: 234.6m)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Authorizing Officer:</span>
                <span className="font-bold text-slate-800">Deputy Commissioner, Jalandhar</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowEvacConfirmModal(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 active:scale-98 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleBroadcastEvacuation}
                className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold active:scale-98 transition shadow-md flex items-center justify-center gap-2"
              >
                <Radio className="w-4 h-4 animate-pulse" />
                <span>Authorize & Blast</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Government SITREP (Situation Report) Printable Modal */}
      {showSitrepModal && (
        <div className="fixed inset-0 z-[9999] bg-[#0F172A]/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 space-y-6 my-auto text-slate-900">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-xs border border-emerald-600/30 bg-[#006837] shrink-0 flex items-center justify-center p-0.5">
                  <Image
                    src="/images/sanjeevani-emblem.png"
                    alt="Sanjeevani Emblem"
                    width={48}
                    height={48}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-emerald-800 font-mono">
                    ਸੰਜੀਵਨੀ · SANJEEVANI DISASTER DEFENSE
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    SITUATION REPORT (SITREP) • SUTLEJ FLOOD SURGE
                  </h3>
                  <p className="text-xs text-slate-500 font-mono" suppressHydrationWarning>
                    DEOC Jalandhar • Ref: PUN/JAL/DIS-2026-T7 • Generated {mounted ? new Date().toLocaleString('en-IN') : '2026-10-30'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSitrepModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SITREP Core Intelligence Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="text-slate-500 font-medium">Bhakra Outflow</div>
                <div className="text-lg font-bold font-mono text-slate-900">
                  {(telemetry?.bhakraDamDischargeCusecs || 112000).toLocaleString('en-IN')} cusecs
                </div>
                <div className="text-[10px] text-red-600 font-semibold font-mono">Surge Active</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="text-slate-500 font-medium">Phillaur Gauge</div>
                <div className="text-lg font-bold font-mono text-slate-900">
                  {telemetry?.phillaurGaugeMeters || 233.8} m
                </div>
                <div className="text-[10px] text-slate-500 font-mono">Danger: 234.6m</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="text-slate-500 font-medium">Monitored Citizens</div>
                <div className="text-lg font-bold font-mono text-blue-700">14 Active App Nodes</div>
                <div className="text-[10px] text-slate-500 font-mono">Mesh Relays Synced</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="text-slate-500 font-medium">Active Roadblocks</div>
                <div className="text-lg font-bold font-mono text-red-600">
                  {activeObstacleRoadIds.length} Cutoffs
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold">SH-25 Elevated Clear</div>
              </div>
            </div>

            {/* Inundated Villages Status Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Sector Risk & Evacuation Progress
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold font-mono text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Village / Sector</th>
                      <th className="p-2.5">Basin Elev</th>
                      <th className="p-2.5">Risk Status</th>
                      <th className="p-2.5">Designated Shelter</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-[11px]">
                    {villages.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50/70">
                        <td className="p-2.5 font-bold text-slate-900">
                          {v.name} ({v.punjabiName})
                        </td>
                        <td className="p-2.5 font-mono text-slate-600">{v.elevation}m</td>
                        <td className="p-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                              v.id === 'lohian_khas' || v.id === 'gidderpindi'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-orange-100 text-orange-800'
                            }`}
                          >
                            {v.id === 'lohian_khas' || v.id === 'gidderpindi' ? 'CRITICAL EVAC' : 'WATCH 48H'}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-700">Govt Sr. Sec. School, Shahkot</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Directive Sign-off */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs flex items-center justify-between">
              <div>
                <span className="font-bold text-blue-900">Official Directive Authority:</span>
                <span className="text-blue-700 ml-1">Office of Deputy Commissioner & District Magistrate, Jalandhar</span>
              </div>
              <span className="font-mono text-[10px] text-blue-600 font-bold uppercase">Authorized</span>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowSitrepModal(false)}
                className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
              >
                Close Report
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="py-2.5 px-4 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Government Navigation Header */}
      <header className="bg-white border-b border-slate-200/90 shadow-xs sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Official Sanjeevani Emblem */}
            <div className="relative w-12 h-12 rounded-2xl overflow-hidden shadow-sm border border-emerald-600/30 bg-[#006837] shrink-0 ring-2 ring-emerald-500/20 flex items-center justify-center p-0.5">
              <Image
                src="/images/sanjeevani-emblem.png"
                alt="Sanjeevani Official Emblem"
                width={48}
                height={48}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-black tracking-wider uppercase text-emerald-800 bg-emerald-50 border border-emerald-300/80 px-2 py-0.5 rounded-md font-mono">
                  ਸੰਜੀਵਨੀ · SANJEEVANI
                </span>
                <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900">
                  Punjab SDMA Command Center
                </h1>
                <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-300 font-mono font-semibold">
                  DEOC Jalandhar
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                District Emergency Operations Center • Sutlej & Beas Basin Flood Defense
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Live Polling Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-mono text-slate-600" suppressHydrationWarning>
                Synced {mounted ? lastSyncedAt : 'Connecting...'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Evacuation Alert Banner (Shown when active) */}
      {isEvacuationActive && (
        <div className="bg-red-600 text-white px-4 py-3 shadow-md border-b border-red-700">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <AlertOctagon className="w-5 h-5 text-amber-300 animate-bounce shrink-0" />
              <div>
                <span className="font-bold text-xs uppercase tracking-wide bg-black/25 px-2 py-0.5 rounded mr-2 font-mono">
                  ACTIVE BROADCAST
                </span>
                <span className="text-xs sm:text-sm font-semibold">
                  Deputy Commissioner Mandatory Evacuation Directive Active — Citizens instructed to seek designated high ground.
                </span>
              </div>
            </div>

            <button
              onClick={handleCancelEvacuation}
              className="px-4 py-1.5 bg-white text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl shadow-xs active:scale-95 transition cursor-pointer"
            >
              Cancel Order / Stand Down
            </button>
          </div>
        </div>
      )}

      {/* Main Command Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Interactive Judge Demo Control Ribbon */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-4 sm:p-5 shadow-lg border border-slate-700/80 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
              <Sparkles className="w-5 h-5 text-indigo-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-md font-mono border border-indigo-400/30">
                  LIVE DEMO CONTROLLER
                </span>
                <span className="text-xs text-slate-400 font-mono">Bilateral Sync</span>
              </div>
              <p className="text-xs text-slate-200 font-medium mt-0.5">
                Simulate real-time emergency response across Citizen App and DEOC in 4 verified steps:
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end w-full md:w-auto">
            {/* Step 1: Baseline */}
            <button
              onClick={handleResetDemo}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>1. Safe Baseline</span>
            </button>

            {/* Step 2: Trigger Evac Siren & Voice */}
            <button
              onClick={() => {
                setDamSliderValue(195000);
                setPhillaurSliderValue(235.2);
                handleBroadcastEvacuation();
              }}
              className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-red-900/40 transition active:scale-95 cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>2. Blast Evacuation (Siren + Voice)</span>
            </button>

            {/* Step 2b: Broadcast P2P Mesh SOS Beacon */}
            <button
              onClick={handleBroadcastMeshSOS}
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-900/40 transition active:scale-95 cursor-pointer"
              title="Broadcast P2P Bluetooth Mesh SOS to Citizen Phones"
            >
              <Cpu className="w-3.5 h-3.5 animate-pulse text-rose-200" />
              <span>Mesh SOS Alert</span>
            </button>

            {/* Step 3: Block Low Road */}
            <button
              onClick={() =>
                handleToggleRoad(
                  'road_lohian_makhu_low',
                  activeObstacleRoadIds.includes('road_lohian_makhu_low'),
                  'Lohian–Makhu Low Link Road'
                )
              }
              className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer ${
                activeObstacleRoadIds.includes('road_lohian_makhu_low')
                  ? 'bg-amber-600/30 border-amber-500/60 text-amber-200 hover:bg-amber-600/40'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>
                3.{' '}
                {activeObstacleRoadIds.includes('road_lohian_makhu_low')
                  ? 'Unblock Road'
                  : 'Block Road (Reroute)'}
              </span>
            </button>

            {/* Step 4: Stand Down */}
            <button
              onClick={handleCancelEvacuation}
              className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>4. Stand Down</span>
            </button>
          </div>
        </div>
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Bhakra Dam Discharge */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Bhakra Dam Discharge</span>
              <Activity className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold font-mono text-slate-900">
                {(telemetry?.bhakraDamDischargeCusecs || 112000).toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-slate-500 font-medium">cusecs</span>
            </div>
            <div className="text-[11px] font-mono text-slate-600 pt-1">
              Safe channel capacity: <span className="font-semibold text-emerald-600">40,000 cusecs</span>
            </div>
          </div>

          {/* Phillaur River Gauge */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Phillaur Gauge Elevation</span>
              <Compass className="w-4 h-4 text-amber-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold font-mono text-slate-900">
                {telemetry?.phillaurGaugeMeters || 233.8}
              </span>
              <span className="text-xs text-slate-500 font-medium">meters</span>
            </div>
            <div className="text-[11px] font-mono pt-1">
              Danger Mark: <span className="font-semibold text-red-600">234.60 m</span> ({((telemetry?.phillaurGaugeMeters || 233.8) - 234.6).toFixed(2)}m)
            </div>
          </div>

          {/* Blocked Road Obstacles */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Dynamic Roadblocks</span>
              <Truck className="w-4 h-4 text-rose-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold font-mono text-slate-900">
                {activeObstacleRoadIds.length}
              </span>
              <span className="text-xs text-slate-500 font-medium">segments blocked</span>
            </div>
            <div className="text-[11px] text-emerald-600 font-medium pt-1">
              SH-25 Elevated Corridor <span className="font-bold">OPEN</span>
            </div>
          </div>

          {/* Citizen Device Acknowledgements */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Citizen Evacuation Acks</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold font-mono text-slate-900">
                {acknowledgements.length}
              </span>
              <span className="text-xs text-slate-500 font-medium">devices confirmed</span>
            </div>
            <div className="text-[11px] text-slate-600 font-mono pt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>
                {acknowledgements.length > 0 ? `Latest: ${acknowledgements[0].villageName}` : 'Awaiting citizen receipt'}
              </span>
            </div>
          </div>
        </div>

        {/* Tactical Geospatial Map: Citizen App User Locations, Danger Inundation Zones & Boat Dispatch */}
        <AdminGeospatialMap
          villages={villages}
          camps={camps}
          activeObstacleRoadIds={activeObstacleRoadIds}
          liveMeshBeacons={meshBeacons}
          onDispatchBoat={(id) => handleDispatchBoat(id, 'Citizen Survivor')}
          damDischargeCusecs={damSliderValue}
          onAddCamp={handleAddCamp}
          onDeleteCamp={handleDeleteCamp}
        />

        {/* Section 1: Dam Discharge Telemetry & Human-in-the-Loop Evacuation Broadcast */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Hydrological Scenario Model & Dam Discharge Telemetry
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Calibrated against Sutlej catchment data. Moving the slider simulates inflow surges. Evacuation broadcasting requires explicit officer confirmation.
              </p>
            </div>

            {/* Quick Scenario Preset Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[11px] text-slate-400 font-mono mr-1">Scenarios:</span>
              <button
                onClick={() => applyPresetScenario(38000, 232.4)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-medium active:scale-95 transition"
              >
                Normal (38k)
              </button>
              <button
                onClick={() => applyPresetScenario(112000, 233.8)}
                className="px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 text-xs font-medium active:scale-95 transition"
              >
                Spillway (112k)
              </button>
              <button
                onClick={() => applyPresetScenario(195000, 235.2)}
                className="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-xs font-bold active:scale-95 transition"
              >
                Flood Crest (195k)
              </button>
              <button
                onClick={() => applyPresetScenario(350000, 236.4)}
                className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 hover:bg-rose-200 text-xs font-bold active:scale-95 transition"
              >
                Extreme 350k (Scenario)
              </button>
            </div>
          </div>

          {/* Interactive Sliders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bhakra Discharge Slider */}
            <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  Bhakra Dam Discharge (Cusecs)
                </label>
                <span className="font-mono text-base font-extrabold text-blue-600 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
                  {damSliderValue.toLocaleString('en-IN')} cusecs
                </span>
              </div>
              <input
                type="range"
                min={30000}
                max={350000}
                step={5000}
                value={damSliderValue}
                onChange={(e) => setDamSliderValue(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>30,000 (Baseline)</span>
                <span>150,000 (Spillway)</span>
                <span>350,000 (Extreme Scenario)</span>
              </div>
            </div>

            {/* Phillaur River Gauge Slider */}
            <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  Phillaur Railway Bridge Gauge (Meters)
                </label>
                <span className={`font-mono text-base font-extrabold px-2.5 py-0.5 rounded-lg border ${
                  phillaurSliderValue >= 234.6 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-slate-800 border-slate-200'
                }`}>
                  {phillaurSliderValue.toFixed(2)} m
                </span>
              </div>
              <input
                type="range"
                min={231.5}
                max={236.5}
                step={0.1}
                value={phillaurSliderValue}
                onChange={(e) => setPhillaurSliderValue(Number(e.target.value))}
                className="w-full accent-red-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>231.50 m</span>
                <span className="text-red-500 font-semibold">234.60 m (Danger Mark)</span>
                <span>236.50 m</span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Routine Telemetry vs DC Evacuation Order */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <button
              onClick={handleUpdateTelemetry}
              disabled={isUpdatingTelemetry}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold shadow-xs active:scale-98 transition flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isUpdatingTelemetry ? 'animate-spin' : ''}`} />
              <span>Update Dam Discharge Telemetry</span>
            </button>

            {!isEvacuationActive ? (
              <button
                onClick={() => setShowEvacConfirmModal(true)}
                disabled={isBroadcastingEvac}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md active:scale-98 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <AlertOctagon className="w-4 h-4" />
                <span>Authorize Evacuation Directive (SDMA / DC Order)</span>
              </button>
            ) : (
              <button
                onClick={handleCancelEvacuation}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md active:scale-98 transition flex items-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Stand Down Evacuation Directive (Safe Baseline)</span>
              </button>
            )}
          </div>
        </div>

        {/* Section 2: Road Obstacle Control & Dynamic Dijkstra Rerouting */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Road Network Control & Dynamic Dijkstra Safe Rerouting
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Toggling a road status immediately updates dynamic obstacles in <code>serverDb</code>, prompting connected citizen devices to recalculate safe high-ground escape routes.
              </p>
            </div>
            <div className="text-[11px] font-mono text-slate-500">
              Live Dijkstra Engine Active
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {monitoredRoads.map((road) => {
              const isBlocked = activeObstacleRoadIds.includes(road.id);
              return (
                <div
                  key={road.id}
                  className={`p-4 rounded-2xl border transition ${
                    isBlocked
                      ? 'bg-rose-50/60 border-rose-200'
                      : 'bg-white border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isBlocked ? 'bg-red-500' : 'bg-emerald-500'}`} />
                        <h4 className="text-xs font-bold text-slate-900">{road.name}</h4>
                      </div>
                      <p className="text-[11px] text-slate-500">{road.desc}</p>
                      <div className="text-[10px] font-mono text-slate-400">ID: {road.id}</div>
                    </div>

                    <button
                      onClick={() => handleToggleRoad(road.id, isBlocked, road.name)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 shrink-0 cursor-pointer ${
                        isBlocked
                          ? 'bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-50'
                          : 'bg-rose-600 text-white hover:bg-rose-700 shadow-xs'
                      }`}
                    >
                      {isBlocked ? 'Reopen Road' : 'Block Road'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Citizen Camera Breach Report Approval Matrix & SOS Mesh Radar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Citizen Camera Breach Reports */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span>Citizen Camera Breach Report Matrix</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Field photos submitted by citizens. Vision AI Breach Analysis (Mock Prototype) scores erosion hazards.
                </p>
              </div>
              <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                {reports.length} reports
              </span>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {reports.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 font-mono">
                  No pending citizen hazard submissions
                </div>
              ) : (
                reports.map((report) => (
                  <div
                    key={report.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-slate-900">{report.landmark}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          Village: {report.villageId} • {report.timestamp}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-800">
                        {report.confidenceScore}% AI Confidence
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 italic leading-relaxed">
                      &ldquo;{report.notes}&rdquo;
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] font-mono text-slate-400">
                        Target Road: {report.roadId || 'General Landmark'}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleReportAction(report.id, 'dismiss')}
                          className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-[11px] font-medium active:scale-95 transition cursor-pointer"
                        >
                          Dismiss
                        </button>
                        <button
                          onClick={() => handleReportAction(report.id, 'approve')}
                          className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold active:scale-95 transition shadow-xs cursor-pointer"
                        >
                          Approve & Block Road
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Live Citizen SOS Mesh Beacon Radar */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Radio className="w-4 h-4 text-blue-600" />
                  <span>Citizen SOS Mesh Beacon Radar</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Simulated P2P BLE Mesh Relay. Survivor distress packets gossiped without cell towers.
                </p>
              </div>
              <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                {meshBeacons.length} beacons
              </span>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {meshBeacons.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 font-mono">
                  No active survivor SOS mesh packets received yet.
                </div>
              ) : (
                meshBeacons.map((beacon) => (
                  <div
                    key={beacon.id}
                    className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-200/70 space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{beacon.senderName}</span>
                          <span className="text-[10px] font-mono text-slate-500">({beacon.senderPhone})</span>
                        </div>
                        <div className="text-[11px] text-slate-600 font-mono">
                          {beacon.villageName} • GPS: {beacon.coords[0].toFixed(4)}°N, {beacon.coords[1].toFixed(4)}°E
                        </div>
                      </div>

                      <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-blue-200 font-bold text-blue-800">
                        {beacon.hops} Hops
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-600 font-medium">
                      <span>Family: <strong>{beacon.familyMembers}</strong></span>
                      <span>•</span>
                      <span>Cattle: <strong>{beacon.cattleCount}</strong></span>
                      <span>•</span>
                      <span className="text-red-600">Needs: {beacon.medicalNeeds}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-blue-100">
                      <span className="text-[10px] font-mono text-slate-400">#{beacon.packetHash}</span>
                      {beacon.ndrfDispatched ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                          <Check className="w-3 h-3" />
                          <span>NDRF Boat Dispatched</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleDispatchBoat(beacon.id, beacon.senderName)}
                          className="px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold active:scale-95 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Anchor className="w-3.5 h-3.5" />
                          <span>Dispatch NDRF Boat</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Citizen Evacuation Acknowledgement Feed & Relief Camps Capacity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Live Citizen Acknowledgements */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Citizen Evacuation Acknowledgement Log</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Verified receipts when citizen taps &ldquo;Got It / ਮੈਂ ਸੁਰੱਖਿਅਤ ਥਾਂ ਵੱਲ ਜਾ ਰਿਹਾ ਹਾਂ&rdquo; on their device.
                </p>
              </div>
              <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200 font-bold">
                {acknowledgements.length} Acknowledged
              </span>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {acknowledgements.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 font-mono">
                  Awaiting first citizen device acknowledgement. Trigger evacuation broadcast to test.
                </div>
              ) : (
                acknowledgements.map((ack) => (
                  <div
                    key={ack.id}
                    className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-200/70 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">
                          {ack.citizenName || 'Citizen Resident'} ({ack.villageName})
                        </div>
                        <div className="text-[10px] font-mono text-slate-500" suppressHydrationWarning>
                          Acknowledged at {mounted ? new Date(ack.timestamp).toLocaleTimeString('en-IN') : 'Just now'}
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200">
                      SAFE EVACUATION IN PROGRESS
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Relief Camp Bed Capacity Control */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Building className="w-4 h-4 text-blue-600" />
                  <span>Designated Relief Shelters & Bed Capacity</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Real-time bed availability for evacuated citizens and livestock corridors.
                </p>
              </div>
              <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                {camps.length} camps
              </span>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {camps.map((camp) => (
                <div
                  key={camp.id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900">{camp.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Elevation: {camp.elevation}m • {camp.hasMedical ? 'Medical Support' : 'Shelter'} • {camp.hasLangar ? 'Langar Active' : ''}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-mono font-bold text-slate-900">
                        {camp.availableBeds} / {camp.capacity}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">Available Beds</div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleAdjustBeds(camp.id, -10)}
                        className="w-6 h-6 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-mono text-xs font-bold active:scale-95 transition"
                        title="Reduce available beds by 10"
                      >
                        -
                      </button>
                      <button
                        onClick={() => handleAdjustBeds(camp.id, 10)}
                        className="w-6 h-6 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-mono text-xs font-bold active:scale-95 transition"
                        title="Increase available beds by 10"
                      >
                        +
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Decommission relief shelter "${camp.name}"? This immediately removes it from the GIS network and citizen mobile apps.`)) {
                            handleDeleteCamp(camp.id);
                          }
                        }}
                        className="w-6 h-6 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 flex items-center justify-center active:scale-95 transition ml-1"
                        title="Decommission shelter from network"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 4: NDRF & SDRF Rescue Boat Fleet Sector Dispatch Tracking */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Anchor className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  NDRF 7th Battalion & SDRF Motorized Rescue Boat Fleet
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Tactical motorboat deployment across Lohian Khas, Gidderpindi causeway, and Dhussi Bandh breach corridors.
              </p>
            </div>
            <span className="text-[11px] font-mono bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200 font-bold">
              4 Boats Active in Sector
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Boat 1 */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 font-mono">NDRF Boat #01 (Lohian)</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="text-[11px] text-slate-600 space-y-0.5 font-mono">
                <div>Sector: Lohian Low Culverts</div>
                <div>Crew: 4 Divers • 1 Paramedic</div>
                <div className="text-emerald-700 font-semibold">Status: Rescuing Family at 31.119°N</div>
              </div>
              <button
                onClick={() => triggerToast('NDRF Boat #01 radio comms acknowledged: En route to Lohian distress node.')}
                className="w-full py-1.5 px-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 font-medium text-[11px] text-slate-700 active:scale-95 transition"
              >
                Hail VHF Radio Ch 16
              </button>
            </div>

            {/* Boat 2 */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 font-mono">NDRF Boat #02 (Gidderpindi)</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="text-[11px] text-slate-600 space-y-0.5 font-mono">
                <div>Sector: Railway Causeway</div>
                <div>Crew: 3 Divers • Tractor Hitch</div>
                <div className="text-blue-700 font-semibold">Status: Patrolling Water Mark 1.8m</div>
              </div>
              <button
                onClick={() => triggerToast('NDRF Boat #02 radio comms acknowledged: Stationed at Gidderpindi overpass.')}
                className="w-full py-1.5 px-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 font-medium text-[11px] text-slate-700 active:scale-95 transition"
              >
                Hail VHF Radio Ch 16
              </button>
            </div>

            {/* Boat 3 */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 font-mono">SDRF Boat #03 (Nasirpur)</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="text-[11px] text-slate-600 space-y-0.5 font-mono">
                <div>Sector: Nasirpur River Island</div>
                <div>Crew: 4 Rescuers • Vet Assistant</div>
                <div className="text-emerald-700 font-semibold">Status: 6 Evacuees Loaded</div>
              </div>
              <button
                onClick={() => triggerToast('SDRF Boat #03 radio comms acknowledged: Heading to Shahkot Dry Ramp.')}
                className="w-full py-1.5 px-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 font-medium text-[11px] text-slate-700 active:scale-95 transition"
              >
                Hail VHF Radio Ch 16
              </button>
            </div>

            {/* Boat 4 */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 font-mono">SDRF Boat #04 (Mandala)</span>
                <span className="w-2 h-2 rounded-full bg-amber-500" />
              </div>
              <div className="text-[11px] text-slate-600 space-y-0.5 font-mono">
                <div>Sector: Dhussi Ring Embankment</div>
                <div>Crew: 3 Sapper Personnel</div>
                <div className="text-amber-700 font-semibold">Status: Reinforcing Sandbags</div>
              </div>
              <button
                onClick={() => triggerToast('SDRF Boat #04 radio comms acknowledged: Sandbagging Mandala breach crest.')}
                className="w-full py-1.5 px-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 font-medium text-[11px] text-slate-700 active:scale-95 transition"
              >
                Hail VHF Radio Ch 16
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
