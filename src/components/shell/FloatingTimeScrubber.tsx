// Generated with Antigravity / Gemini, reviewed and modified by the team
// CTBF-AI-12: July 2023 Flood Replay Scrubber — NurseBid Pillowy Style

'use client';

import React, { useState } from 'react';
import { History, ChevronUp, ChevronDown, Play, Pause } from 'lucide-react';
import { useFloodApp } from '../../context/FloodAppContext';
import { FLOOD_REPLAY_2023 } from '../../data/floodReplay2023';

export default function FloatingTimeScrubber() {
  const { selectedStepIndex, setSelectedStepIndex, currentStep, language } = useFloodApp();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const isPa = language === 'pa';

  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setSelectedStepIndex((prev: number) => (prev + 1) % FLOOD_REPLAY_2023.length);
      }, 3500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, setSelectedStepIndex]);

  return (
    <div className="bg-[#F0F3F8] px-4 py-1.5 z-30 select-none">
      {/* Header Bar */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-[#ECFDF5] border border-emerald-200/80 flex items-center justify-center">
            <History className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <span className="font-extrabold text-slate-900 tracking-tight text-[11px]">
            {isPa ? '2023 ਹੜ੍ਹ ਟਾਈਮਲਾਈਨ' : '2023 Flood Replay'}
          </span>
          <span className="font-mono text-emerald-800 bg-[#ECFDF5] px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-200">
            {currentStep.label}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="text-[11px] font-bold flex items-center gap-1 text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 px-2.5 py-1 rounded-xl border border-white/95 shadow-[0_2px_6px_rgba(123,138,168,0.08)] transition"
            title="Auto replay"
          >
            {isPlaying ? <Pause className="w-3 h-3 text-amber-600" /> : <Play className="w-3 h-3 text-emerald-600" />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Scrubber Steps as Tactile Pills */}
      <div className="mt-2 flex items-center justify-between gap-1.5">
        {FLOOD_REPLAY_2023.map((step, idx) => {
          const isSelected = selectedStepIndex === idx;
          const isDanger = idx >= 2;
          return (
            <button
              key={step.stepIndex}
              onClick={() => {
                setSelectedStepIndex(idx);
                setIsPlaying(false);
              }}
              className={`flex-1 py-1.5 px-0.5 rounded-2xl text-center transition flex flex-col items-center ${
                isSelected
                  ? isDanger
                    ? 'bg-[#EF4444] text-white font-extrabold shadow-[0_4px_12px_rgba(239,68,68,0.32)] border border-[#EF4444]'
                    : 'bg-[#059669] text-white font-extrabold shadow-[0_4px_12px_rgba(5,150,105,0.35)] border border-[#059669]'
                  : 'bg-white border border-white/95 text-slate-600 hover:bg-slate-50 shadow-[0_2px_6px_rgba(123,138,168,0.06)]'
              }`}
            >
              <span className="text-[10px] font-mono leading-tight font-black">
                {step.label.split(' ')[0]}
              </span>
              <span className={`text-[8px] mt-0.5 font-medium ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                {idx === 0 ? '8 Jul' : idx === 1 ? '9 Jul' : idx === 2 ? '10 Jul' : idx === 3 ? '10 PM' : '11 Jul'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Expanded Telemetry Preview */}
      {isExpanded && (
        <div className="mt-2.5 pt-2 border-t border-slate-200/80 grid grid-cols-3 gap-2 text-[10px]">
          <div className="bg-white border border-white/95 p-2 rounded-2xl shadow-xs">
            <div className="text-slate-500 font-bold">Bhakra Release</div>
            <div className="font-black text-slate-900 font-mono mt-0.5 text-xs">
              {(currentStep.bhakraDamDischargeCusecs / 1000).toFixed(0)}k cusecs
            </div>
          </div>
          <div className="bg-white border border-white/95 p-2 rounded-2xl shadow-xs">
            <div className="text-slate-500 font-bold">Phillaur Gauge</div>
            <div className={`font-black font-mono mt-0.5 text-xs ${currentStep.phillaurGaugeMeters > 234.6 ? 'text-rose-600' : 'text-emerald-700'}`}>
              {currentStep.phillaurGaugeMeters} m
            </div>
          </div>
          <div className="bg-white border border-white/95 p-2 rounded-2xl shadow-xs">
            <div className="text-slate-500 font-bold">Rain Forecast</div>
            <div className="font-black text-slate-900 font-mono mt-0.5 text-xs">
              {currentStep.catchmentRainfall24hMm} mm
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
