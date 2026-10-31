// Generated with Antigravity / Gemini, reviewed and modified by the team
// CTBF-AI-12: Tab 1 — Lean Village Inundation Dashboard (NurseBid Clean Architecture)

'use client';

import React from 'react';
import {
  Clock,
  ShieldAlert,
  Tractor,
  Activity,
  Volume2,
  Compass,
  CheckCircle2,
  Waves,
  CloudRain,
  Gauge,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useFloodApp } from '../../context/FloodAppContext';

export default function HomeRiskTab() {
  const {
    activeVillage,
    currentStep,
    currentForecast,
    language,
    setActiveTab,
  } = useFloodApp();

  const isPa = language === 'pa';
  const isRed = currentForecast.riskLevel === 'EVACUATE_24H';
  const isOrange = currentForecast.riskLevel === 'PREPARE_48H';
  const isYellow = currentForecast.riskLevel === 'WATCH_72H';

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3.5 pb-36 bg-[#F4F6FA]">
      {/* Lean Headline Row */}
      <div className="flex items-center justify-between pt-1 px-1">
        <div>
          <h1 className="text-[22px] font-bold text-slate-900 tracking-[-0.03em] leading-tight">
            {isPa ? activeVillage.punjabiName : activeVillage.name}
          </h1>
          <p className="text-[11px] text-slate-500 font-medium tracking-tight">
            {isPa ? 'ਸਤਲੁਜ ਬੇਸਿਨ · ਅਗਾਊਂ ਹੜ੍ਹ ਨਿਗਰਾਨੀ' : 'Sutlej Basin · 48h Live Flood Telemetry'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setActiveTab('map')}
          className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-emerald-200/90 px-3 py-1.5 rounded-full text-[10px] font-bold text-emerald-800 shadow-[0_2px_6px_rgba(15,23,42,0.04)] transition active:scale-95 cursor-pointer"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-mono">+{activeVillage.hoursSaved}h Early</span>
          <ChevronRight className="w-3 h-3 text-emerald-600 opacity-60" />
        </button>
      </div>

      {/* Hero Evacuation Status Card (Clean Pillowy Surface) */}
      <div
        className="pillowy-card p-5 space-y-3.5 transition-all duration-300 relative overflow-hidden"
        style={{
          borderColor: isRed
            ? 'rgba(254, 202, 202, 0.9)'
            : isOrange
            ? 'rgba(254, 215, 170, 0.9)'
            : isYellow
            ? 'rgba(253, 230, 138, 0.9)'
            : 'rgba(167, 243, 208, 0.9)',
        }}
      >
        <div className="flex items-center justify-between">
          <span
            className="text-[10px] font-bold uppercase px-3 py-1 rounded-full tracking-wider flex items-center gap-1.5"
            style={{
              backgroundColor: isRed
                ? '#FEE2E2'
                : isOrange
                ? '#FFEDD5'
                : isYellow
                ? '#FEF3C7'
                : '#ECFDF5',
              color: isRed
                ? '#DC2626'
                : isOrange
                ? '#EA580C'
                : isYellow
                ? '#D97706'
                : '#059669',
            }}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            {isPa ? currentForecast.statusLabelPa : currentForecast.statusLabelEn}
          </span>
          <span className="text-[11px] font-mono font-bold text-slate-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {currentStep.hoursToHistoricalBreach > 0
              ? `T - ${currentStep.hoursToHistoricalBreach}h Arrival`
              : 'T - 0h Peak Flood'}
          </span>
        </div>

        {/* Headline message */}
        <p className="text-sm font-bold text-slate-900 leading-snug tracking-tight">
          {isPa ? currentForecast.urgencyDescriptionPa : currentForecast.urgencyDescriptionEn}
        </p>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={() => setActiveTab('alerts')}
            className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-[#EEF2F7] hover:bg-slate-200/70 text-slate-800 font-semibold text-xs transition active:scale-[0.98]"
          >
            <Volume2 className="w-4 h-4 text-emerald-600" />
            <span>{isPa ? 'ਪੰਜਾਬੀ ਚ ਸੁਣੋ' : 'Listen Alert'}</span>
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-[0_4px_14px_rgba(5,150,105,0.28)] transition active:scale-[0.98]"
          >
            <Compass className="w-4 h-4" />
            <span>{isPa ? 'ਸੁਰੱਖਿਅਤ ਰੂਟ' : 'Safe Route'}</span>
          </button>
        </div>
      </div>

      {/* 4-Square Bento Telemetry Grid */}
      <div className="space-y-2.5">
        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.08em] flex items-center gap-1.5 px-1">
          <Activity className="w-3.5 h-3.5 text-emerald-600" />
          <span>{isPa ? 'ਦਰਿਆਈ ਟੈਲੀਮੈਟਰੀ (CWC / BBMB)' : 'Hydrological Telemetry Grid'}</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Tile 1: Phillaur River Level */}
          <div className="pillowy-card p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Phillaur Gauge</span>
              <div className="w-6 h-6 rounded-lg bg-[#F4F6FA] flex items-center justify-center">
                <Gauge className="w-3.5 h-3.5 text-slate-600" />
              </div>
            </div>
            <div className="mt-2.5">
              <div className={`text-2xl font-bold font-mono tracking-tight leading-none ${currentStep.phillaurGaugeMeters > 234.6 ? 'text-rose-600' : 'text-slate-900'}`}>
                {currentStep.phillaurGaugeMeters} <span className="text-xs font-normal text-slate-500 font-sans">m</span>
              </div>
              <div className="text-[10px] text-amber-700 font-semibold mt-1">Danger: 234.6m</div>
            </div>
          </div>

          {/* Tile 2: Bhakra Dam Spillway */}
          <div className="pillowy-card p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Bhakra Release</span>
              <div className="w-6 h-6 rounded-lg bg-[#ECFDF5] flex items-center justify-center">
                <Waves className="w-3.5 h-3.5 text-emerald-600" />
              </div>
            </div>
            <div className="mt-2.5">
              <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 leading-none">
                {(currentStep.bhakraDamDischargeCusecs / 1000).toFixed(0)}k <span className="text-xs font-normal text-slate-500 font-sans">cusecs</span>
              </div>
              <div className="text-[10px] text-emerald-700 font-semibold mt-1">26h Transit Lag</div>
            </div>
          </div>

          {/* Tile 3: IMD Rainfall */}
          <div className="pillowy-card p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Rain Forecast</span>
              <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center">
                <CloudRain className="w-3.5 h-3.5 text-blue-600" />
              </div>
            </div>
            <div className="mt-2.5">
              <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 leading-none">
                {currentStep.catchmentRainfall24hMm} <span className="text-xs font-normal text-slate-500 font-sans">mm</span>
              </div>
              <div className="text-[10px] text-blue-700 font-semibold mt-1">48h Cumulative</div>
            </div>
          </div>

          {/* Tile 4: Embankment Clearance */}
          <div className="pillowy-card p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Bundh Clearance</span>
              <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center">
                <Layers className="w-3.5 h-3.5 text-slate-600" />
              </div>
            </div>
            <div className="mt-2.5">
              <div
                className={`text-2xl font-bold font-mono tracking-tight leading-none ${
                  currentForecast.embankmentClearance <= 0 ? 'text-rose-600' : 'text-emerald-700'
                }`}
              >
                {currentForecast.embankmentClearance <= 0
                  ? `${Math.abs(currentForecast.embankmentClearance)}m Over`
                  : `+${currentForecast.embankmentClearance}m Safe`}
              </div>
              <div className="text-[10px] text-slate-500 font-semibold mt-1">Elev: {activeVillage.elevation}m</div>
            </div>
          </div>
        </div>
      </div>

      {/* Farmer Specific Advisory Card */}
      <div className="pillowy-card p-4 space-y-2.5">
        <div className="flex items-center gap-2.5 text-emerald-800">
          <div className="w-8 h-8 rounded-xl bg-[#ECFDF5] border border-emerald-200/90 flex items-center justify-center">
            <Tractor className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="font-bold text-xs text-slate-900">
            {isPa ? 'ਕਿਸਾਨ ਸਲਾਹ: ਪਸ਼ੂ ਅਤੇ ਟਰੈਕਟਰ' : 'Farmer Advisory: Livestock & Equipment'}
          </h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed font-normal">
          {isPa
            ? currentForecast.livestockAndTractorActionPa
            : currentForecast.livestockAndTractorActionEn}
        </p>
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="font-medium">{isPa ? 'ਉੱਚਾ ਡੇਰਾ: ਸ਼ਾਹਕੋਟ ਹਾਈਵੇ' : 'High Ground: SH-25 Corridor'}</span>
          <span className="text-emerald-800 font-bold bg-[#ECFDF5] px-2.5 py-0.5 rounded-full border border-emerald-200 text-[10px]">
            {isPa ? 'ਸੁਰੱਖਿਅਤ ਖੇਤਰ' : 'Dry Elevated Zone'}
          </span>
        </div>
      </div>
    </div>
  );
}
