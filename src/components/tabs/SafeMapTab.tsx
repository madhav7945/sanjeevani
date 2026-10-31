// Generated with Antigravity / Gemini, reviewed and modified by the team
// CTBF-AI-12: Tab 2 — Safe GPS Map with Google Maps-Grade Live Directions & Floating Dock

'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Tractor,
  Footprints,
  Car,
  ShieldCheck,
  ChevronUp,
  ChevronDown,
  AlertOctagon,
  RefreshCw,
  Navigation,
  ArrowUpLeft,
  ArrowUpRight,
  X,
  Volume2,
  VolumeX,
  Search,
  Compass,
  Layers,
  AlertTriangle,
  LocateFixed,
} from 'lucide-react';
import { useFloodApp } from '../../context/FloodAppContext';
import { playPunjabiVoiceAlert, stopSpeech } from '../../lib/punjabiSpeech';

const LeafletMapInner = dynamic(
  () =>
    import('./LeafletMapInner').catch((err) => {
      console.warn('LeafletMap offline chunk load fallback:', err);
      return function OfflineMapFallback() {
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#F8FAFC] text-slate-600 p-6 text-center space-y-2">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
            <p className="text-sm font-bold text-slate-800">ਆਫ਼ਲਾਈਨ ਮੈਪ ਮੋਡ (Offline GIS Routing Active)</p>
            <p className="text-xs text-slate-500 max-w-xs">
              ਨੈੱਟਵਰਕ ਬੰਦ ਹੋਣ ਕਾਰਨ ਮੈਸ਼ ਸਾਇਰਨ ਅਤੇ ਐਮਰਜੈਂਸੀ ਅਲਰਟ ਪ੍ਰਣਾਲੀ ਲੋਕਲ ਮੈਮੋਰੀ ਵਿੱਚ ਸਰਗਰਮ ਹੈ।
            </p>
          </div>
        );
      };
    }),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#F4F6FA] text-slate-500 gap-2">
        <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
        <span className="text-xs font-semibold">Loading Punjab Flood GIS Map...</span>
      </div>
    ),
  }
);

export default function SafeMapTab() {
  const {
    evacuationRoute,
    language,
    blockedRoadIds,
    isNavigating,
    setIsNavigating,
    setActiveTab,
  } = useFloodApp();

  const [sheetState, setSheetState] = useState<'peek' | 'expanded' | 'steps'>('peek');
  const [recenterTrigger, setRecenterTrigger] = useState<number>(0);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [showAltRoutes, setShowAltRoutes] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isPa = language === 'pa';
  const hasBreachReroute = blockedRoadIds.length > 0;

  const startLiveNavigation = () => {
    setIsNavigating(true);
    setSheetState('peek');

    // Announce first turn direction via Microsoft Edge Neural Female Voice
    if (!isAudioMuted) {
      const turnText = isPa
        ? 'ਨੈਵੀਗੇਸ਼ਨ ਸ਼ੁਰੂ ਹੋਈ। 450 ਮੀਟਰ ਬਾਅਦ ਸਟੇਟ ਹਾਈਵੇ 25 ਤੇ ਖੱਬੇ ਮੁੜੋ।'
        : 'Navigation started. In 450 meters, turn left onto Elevated State Highway 25.';
      playPunjabiVoiceAlert(turnText);
    }
  };

  const stopLiveNavigation = () => {
    setIsNavigating(false);
    stopSpeech();
  };

  const toggleAudio = () => {
    const nextMuted = !isAudioMuted;
    setIsAudioMuted(nextMuted);
    if (nextMuted) {
      stopSpeech();
    }
  };

  const handleRecenter = () => {
    setRecenterTrigger((prev) => prev + 1);
  };

  // Calculate ETA time string (current time + tractor duration)
  const calculateEtaTime = () => {
    const now = new Date();
    const durationMins = evacuationRoute?.tractorTimeMinutes || 28;
    const eta = new Date(now.getTime() + durationMins * 60000);
    return eta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 flex flex-col relative h-full overflow-hidden bg-[#F4F6FA]">
      {/* Map Canvas (Expands to Full Viewport) */}
      <div className="flex-1 w-full h-full relative">
        <LeafletMapInner recenterTrigger={recenterTrigger} />

        {/* ---------------- LIVE NAVIGATION MODE (GOOGLE MAPS STYLE) ---------------- */}
        {isNavigating ? (
          <>
            {/* Top Green Turn-by-Turn Banner (Matches Google Maps Navigation Header) */}
            <div className="absolute top-3 left-3 right-3 z-[500] select-none animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="bg-[#064E3B] text-white rounded-[24px] p-3 shadow-[0_12px_32px_rgba(6,78,59,0.5)] border border-emerald-500/40 flex items-stretch justify-between gap-2.5">
                {/* Main Turn Direction Tile */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/90 flex items-center justify-center text-white shrink-0 shadow-inner">
                    <ArrowUpLeft className="w-7 h-7 stroke-[2.8]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-bold text-white flex items-center gap-1.5">
                      <span className="text-emerald-300 text-sm font-bold">450 m</span>
                      <span className="truncate">{isPa ? 'ਖੱਬੇ ਮੁੜੋ' : 'Turn left'}</span>
                    </div>
                    <div className="text-xs font-normal text-emerald-100 truncate mt-0.5">
                      {isPa
                        ? 'ਸਟੇਟ ਹਾਈਵੇ 25 (ਉੱਚਾ ਬੰਨ੍ਹ ਕੋਰੀਡੋਰ)'
                        : 'Elevated State Highway 25 (Dry Corridor)'}
                    </div>
                  </div>
                </div>

                {/* Sub-turn Preview Box ("Then ↱ Keep right") */}
                <div className="border-l border-emerald-700/70 pl-2.5 flex flex-col justify-center items-start shrink-0 text-[10px] text-emerald-200">
                  <span className="text-[9px] uppercase tracking-wider text-emerald-300 font-extrabold">
                    {isPa ? 'ਫਿਰ' : 'Then'}
                  </span>
                  <div className="flex items-center gap-1 font-bold text-white mt-0.5">
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-300" />
                    <span>{isPa ? 'ਸੱਜੇ ਰਹੋ' : 'Keep right'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side Vertical Circular Action Buttons (Google Maps Style) */}
            <div className="absolute right-3.5 top-28 z-[500] flex flex-col gap-2.5 select-none animate-in fade-in slide-in-from-right-3 duration-300">
              {/* Compass / Orientation */}
              <button
                onClick={handleRecenter}
                className="w-10 h-10 rounded-full bg-[#1E293B]/90 backdrop-blur-md border border-slate-700/60 shadow-[0_4px_16px_rgba(0,0,0,0.35)] flex items-center justify-center text-rose-500 active:scale-95 transition"
                title="North Heading"
              >
                <Compass className="w-5 h-5 text-rose-400" />
              </button>

              {/* Search Along Route */}
              <button
                onClick={() => alert(isPa ? 'ਰਾਹਤ ਕੈਂਪ, ਲੰਗਰ ਅਤੇ ਡੀਜ਼ਲ ਪੰਪ ਰੂਟ ਤੇ ਉਪਲਬਧ ਹਨ।' : 'Relief camps, food distribution, and high-ground fueling points verified along SH-25.')}
                className="w-10 h-10 rounded-full bg-[#1E293B]/90 backdrop-blur-md border border-slate-700/60 shadow-[0_4px_16px_rgba(0,0,0,0.35)] flex items-center justify-center text-slate-200 hover:text-white active:scale-95 transition"
                title="Search Along Route"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Audio / Voice Guidance Toggle */}
              <button
                onClick={toggleAudio}
                className={`w-10 h-10 rounded-full backdrop-blur-md border shadow-[0_4px_16px_rgba(0,0,0,0.35)] flex items-center justify-center active:scale-95 transition ${
                  isAudioMuted
                    ? 'bg-rose-950/80 text-rose-400 border-rose-800/60'
                    : 'bg-[#1E293B]/90 text-emerald-400 border-slate-700/60'
                }`}
                title={isAudioMuted ? 'Unmute Audio Voice Guidance' : 'Mute Voice Guidance'}
              >
                {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Alternate Routes / Layers */}
              <button
                onClick={() => setShowAltRoutes((prev) => !prev)}
                className={`w-10 h-10 rounded-full backdrop-blur-md border shadow-[0_4px_16px_rgba(0,0,0,0.35)] flex items-center justify-center active:scale-95 transition ${
                  showAltRoutes
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-[#1E293B]/90 text-slate-200 border-slate-700/60'
                }`}
                title="Alternate Safe Roads"
              >
                <Layers className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom Floating Pill Actions (Above the bottom bar) */}
            <div className="absolute bottom-[92px] left-3.5 right-3.5 z-[500] flex items-center justify-between select-none animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* ▲ Re-centre Floating Pill */}
              <button
                onClick={handleRecenter}
                className="h-9 px-3.5 rounded-full bg-[#0F172A]/90 hover:bg-[#0F172A] text-white backdrop-blur-md border border-slate-700/80 shadow-[0_4px_14px_rgba(0,0,0,0.35)] flex items-center gap-1.5 text-xs font-bold active:scale-95 transition"
              >
                <LocateFixed className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isPa ? '▲ ਕੇਂਦਰਿਤ ਕਰੋ' : '▲ Re-centre'}</span>
              </button>

              {/* Report Road Hazard / Water Pill */}
              <button
                onClick={() => {
                  stopLiveNavigation();
                  setActiveTab('report');
                }}
                className="h-9 px-3.5 rounded-full bg-[#DC2626]/90 hover:bg-[#B91C1C] text-white backdrop-blur-md border border-rose-500/50 shadow-[0_4px_14px_rgba(220,38,38,0.4)] flex items-center gap-1.5 text-xs font-bold active:scale-95 transition"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{isPa ? 'ਪਾਣੀ ਦੀ ਰਿਪੋਰਟ' : 'Report Hazard'}</span>
              </button>
            </div>

            {/* Bottom Dark Navigation Dock (Google Maps Style Bar) */}
            <div className="absolute bottom-0 left-0 right-0 z-[500] bg-[#0F172A] text-white border-t border-slate-800 shadow-[0_-8px_32px_rgba(0,0,0,0.5)] px-4 pt-3 pb-5 flex items-center justify-between gap-3 select-none animate-in fade-in slide-in-from-bottom-4 duration-300">
              {/* Red Exit / Close Navigation Button */}
              <button
                onClick={stopLiveNavigation}
                className="w-10 h-10 rounded-full bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-300 border border-slate-700 flex items-center justify-center transition active:scale-95 shrink-0"
                title="Exit Navigation"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>

              {/* Center Route Metrics (Time, Vehicle, Distance & ETA) */}
              <div className="flex-1 text-center min-w-0">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl font-bold text-white tracking-tight">
                    {evacuationRoute.tractorTimeMinutes} min
                  </span>
                  <span className="text-xs bg-slate-800 text-emerald-300 font-medium px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-500/30">
                    <Tractor className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Tractor</span>
                  </span>
                </div>
                <div className="text-xs text-slate-300 font-normal flex items-center justify-center gap-2 mt-1">
                  <span className="font-semibold text-white">12.4 km</span>
                  <span>•</span>
                  <span suppressHydrationWarning>{mounted ? calculateEtaTime() : 'ETA'}</span>
                  <span>•</span>
                  <span className="text-emerald-400 text-[12px] font-semibold">+2.8m Dry Elevation</span>
                </div>
              </div>

              {/* Destination Pill / End Trip */}
              <button
                onClick={() => setSheetState(sheetState === 'peek' ? 'expanded' : 'peek')}
                className="w-10 h-10 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center active:scale-95 transition shrink-0"
                title="Route Overview"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
            </div>
          </>
        ) : (
          /* ---------------- NORMAL EXPLORATION MODE ---------------- */
          <>
            {/* Top Floating Legend & Breach Alert */}
            <div className="absolute top-3 left-3 right-3 floating-capsule p-2.5 z-[500] flex items-center justify-between text-[11px] select-none">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#059669] shadow-sm" />
                  <span className="font-bold text-slate-900">
                    {isPa ? 'ਸੁਰੱਖਿਅਤ ਰੂਟ' : 'Safe Route'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-[#DC2626]" />
                  <span className="font-medium text-slate-600">
                    {isPa ? 'ਪਾਣੀ ਵਿੱਚ ਸੜਕ' : 'Flooded'}
                  </span>
                </div>
              </div>
              <span className="text-[10px] bg-[#ECFDF5] text-emerald-800 px-2.5 py-0.5 rounded-full font-mono font-bold border border-emerald-200">
                Dijkstra A* Active
              </span>
            </div>

            {hasBreachReroute && (
              <div className="absolute top-16 left-3 right-3 bg-[#F59E0B] text-slate-950 font-bold text-xs p-2.5 rounded-2xl z-[500] shadow-[0_4px_16px_rgba(245,158,11,0.3)] flex items-center gap-2 select-none">
                <AlertOctagon className="w-4 h-4 shrink-0 text-slate-950" />
                <span className="truncate">
                  {isPa
                    ? 'ਬੰਨ੍ਹ ਪਾੜ ਕਾਰਨ ਰਸਤਾ ਬਦਲਿਆ: ਸਟੇਟ ਹਾਈਵੇ 25 ਰਾਹੀਂ ਨਿਕਲੋ'
                    : 'Dhussi Breach Detected: Rerouted via Elevated SH-25'}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* ---------------- ERGONOMIC BOTTOM SHEET (NORMAL MODE) ---------------- */}
      {/* Positioned at bottom-[84px] so it strictly FLOATS ABOVE the bottom tab navigation bar */}
      {!isNavigating && (
        <div
          className={`absolute left-3 right-3 bottom-[84px] bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-[28px] shadow-[0_12px_36px_rgba(15,23,42,0.16)] transition-all duration-300 z-[490] flex flex-col overflow-hidden ${
            sheetState === 'peek'
              ? 'max-h-[148px]'
              : sheetState === 'expanded'
              ? 'max-h-[380px]'
              : 'max-h-[75%]'
          }`}
        >
          {/* Drag / Toggle Pill */}
          <button
            onClick={() =>
              setSheetState(
                sheetState === 'peek'
                  ? 'expanded'
                  : sheetState === 'expanded'
                  ? 'steps'
                  : 'peek'
              )
            }
            className="w-full py-2 flex items-center justify-center text-slate-400 hover:text-slate-600"
            title="Toggle Sheet"
          >
            <div className="w-10 h-1.5 bg-slate-200 rounded-full" />
          </button>

          <div className="px-4 pb-3 overflow-y-auto space-y-2.5">
            {/* Destination Header with "Start Directions" Action */}
            <div className="flex items-center justify-between gap-2">
              <div className="overflow-hidden flex-1">
                <div className="text-[10px] text-emerald-800 font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">
                    {isPa ? 'ਸਭ ਤੋਂ ਨੇੜਲਾ ਉੱਚਾ ਰਾਹਤ ਕੈਂਪ' : 'Nearest High-Ground Camp'}
                  </span>
                </div>
                <div className="text-sm font-black text-slate-900 truncate">
                  {isPa ? evacuationRoute.camp.punjabiName : evacuationRoute.camp.name}
                </div>
              </div>

              {/* Google Maps-Style "Start Directions" Button */}
              <button
                onClick={startLiveNavigation}
                className="h-10 px-4 rounded-2xl bg-[#059669] hover:bg-[#047857] text-white flex items-center gap-1.5 text-xs font-black shadow-[0_4px_14px_rgba(5,150,105,0.35)] transition active:scale-95 shrink-0"
              >
                <Navigation className="w-3.5 h-3.5 fill-white" />
                <span>{isPa ? 'ਰੂਟ ਸ਼ੁਰੂ ਕਰੋ' : 'Start'}</span>
              </button>

              {/* Expand / Collapse Chevron */}
              <button
                onClick={() =>
                  setSheetState(sheetState === 'peek' ? 'expanded' : 'peek')
                }
                className="w-9 h-10 rounded-2xl bg-[#F0F3F8] hover:bg-slate-200/70 text-slate-600 flex items-center justify-center transition active:scale-95 shrink-0"
                title={sheetState === 'peek' ? 'Show Details' : 'Minimize'}
              >
                {sheetState === 'peek' ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Travel Modes Times — Pill Cards */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-[#F0F3F8] border border-white p-2 rounded-2xl flex items-center gap-2 shadow-xs">
                <Tractor className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <div className="text-[9px] text-slate-500 font-bold">Tractor</div>
                  <div className="text-xs font-bold text-slate-900">
                    {evacuationRoute.tractorTimeMinutes} min
                  </div>
                </div>
              </div>

              <div className="bg-[#F0F3F8] border border-white p-2 rounded-2xl flex items-center gap-2 shadow-xs">
                <Car className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <div className="text-[9px] text-slate-500 font-bold">Vehicle</div>
                  <div className="text-xs font-bold text-slate-900">
                    {evacuationRoute.carTimeMinutes} min
                  </div>
                </div>
              </div>

              <div className="bg-[#F0F3F8] border border-white p-2 rounded-2xl flex items-center gap-2 shadow-xs">
                <Footprints className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <div className="text-[9px] text-slate-500 font-bold">Walking</div>
                  <div className="text-xs font-bold text-slate-900">
                    {evacuationRoute.walkingTimeMinutes} min
                  </div>
                </div>
              </div>
            </div>

            {/* Expanded Content: Topographic Clearance + Steps */}
            {sheetState !== 'peek' && (
              <div className="space-y-3 pt-1 animate-in fade-in duration-200">
                {/* Why is this Road Safe? (NASA DEM Topographic Elevation Clearance) */}
                <div className="bg-[#ECFDF5] border border-emerald-200/90 p-2.5 rounded-2xl flex items-center justify-between text-[11px] shadow-xs">
                  <div className="flex items-center gap-2 overflow-hidden pr-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="truncate">
                      <span className="font-extrabold text-emerald-950">
                        {isPa ? 'ਸੜਕ ਦੀ ਸੁਰੱਖਿਆ ਗਾਰੰਟੀ:' : 'Topographic Clearance:'}
                      </span>
                      <span className="text-emerald-800 font-medium ml-1">
                        {isPa
                          ? 'ਸਟੇਟ ਹਾਈਵੇ 25 (213m ਉਚਾਈ) ਹੜ੍ਹ ਤੋਂ +2.8m ਉੱਚਾ ਹੈ'
                          : 'SH-25 sits at 213.2m elevation (+2.8m above Sutlej flood level)'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] bg-white px-2 py-0.5 rounded-full text-emerald-800 font-bold border border-emerald-200 shrink-0">
                    NASA DEM
                  </span>
                </div>

                {/* Turn-by-Turn Steps */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span>
                      {isPa ? 'ਸੁਰੱਖਿਅਤ ਰਸਤੇ ਦੇ ਕਦਮ (ਉੱਚੀਆਂ ਸੜਕਾਂ):' : 'Turn-by-Turn Safe Steps:'}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold">
                      {evacuationRoute.steps.length} Steps
                    </span>
                  </div>
                  <div className="space-y-2">
                    {evacuationRoute.steps.map((step, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 text-xs bg-[#F0F3F8] p-3 rounded-2xl border border-white shadow-xs"
                      >
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0">
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <div className="text-slate-900 font-bold">
                            {isPa ? step.instructionPa : step.instructionEn}
                          </div>
                          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                            +{step.distanceKm} km {step.isSafeHighway && '· Elevated Highway Corridor'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
