// CTBF-AI-12: Red Full-Screen Evacuation Takeover Modal
// Triggered on DC Evacuation Broadcast / Dam Surge Transition
// Integrates Web Audio Siren control & District Command Center Acknowledgement

'use client';

import React from 'react';
import { AlertOctagon, Volume2, VolumeX, ShieldCheck, ArrowRight, Navigation, MapPin } from 'lucide-react';
import { useFloodApp } from '../../context/FloodAppContext';
import { emergencySound } from '../../lib/emergencyAudio';
import { stopSpeech } from '../../lib/punjabiSpeech';

export default function EvacuationTakeoverModal() {
  const {
    showEvacuationTakeover,
    setShowEvacuationTakeover,
    activeVillage,
    language,
    acknowledgeEvacuation,
    setActiveTab,
    isSirenActive,
    toggleSiren,
  } = useFloodApp();

  const isPa = language === 'pa';

  if (!showEvacuationTakeover) return null;

  const handleAcknowledge = async (e: React.MouseEvent) => {
    e.stopPropagation();
    emergencySound.stopSiren();
    stopSpeech();
    await acknowledgeEvacuation();
    setShowEvacuationTakeover(false);
    setActiveTab('map');
  };

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label="Mandatory Evacuation Order"
      className="fixed inset-0 z-[9999] bg-[#991B1B] text-white flex flex-col justify-between p-4 sm:p-6 md:p-8 overflow-y-auto animate-in fade-in duration-200"
    >
      {/* Background Ambience Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#B91C1C] via-[#991B1B] to-[#7F1D1D] opacity-98 pointer-events-none" />

      {/* Content Container (Constrained for mobile viewport containment) */}
      <div className="relative z-10 max-w-md mx-auto w-full flex-1 flex flex-col justify-between py-2">
        {/* Top Operational Status Bar */}
        <div className="flex items-center justify-between pb-3.5 border-b border-red-500/40">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span className="text-[11px] font-mono tracking-wider uppercase font-bold text-red-100">
              SDMA / DEOC Jalandhar Directive
            </span>
          </div>

          {/* Siren Mute / Toggle Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleSiren();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 hover:bg-black/50 text-xs text-white border border-white/20 active:scale-95 transition cursor-pointer"
            aria-label={isSirenActive ? 'Silence siren' : 'Start siren'}
          >
            {isSirenActive ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span className="font-mono text-[11px] font-semibold text-amber-200">Siren ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-300" />
                <span className="font-mono text-[11px] text-slate-200">Muted</span>
              </>
            )}
          </button>
        </div>

        {/* Hero Urgency Section */}
        <div className="py-4 space-y-3.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-black/40 border border-amber-400/30 text-[11px] font-bold tracking-wide text-amber-300">
            <AlertOctagon className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>MANDATORY EVACUATION • ਤੁਰੰਤ ਨਿਕਾਸੀ ਹੁਕਮ</span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              {activeVillage.punjabiName} ({activeVillage.name})
            </h1>
            <p className="mt-1 text-xs text-red-200 font-mono">
              Sutlej River Surge Level: &gt;250,000 Cusecs
            </p>
          </div>

          <div className="bg-black/25 border border-white/15 rounded-xl p-3.5">
            <p className="text-sm text-red-50 font-medium leading-relaxed">
              {isPa
                ? `ਸਾਵਧਾਨ! ਪਿੰਡ ${activeVillage.punjabiName} ਲਈ ਤੁਰੰਤ ਨਿਕਾਸੀ ਦਾ ਹੁਕਮ ਜਾਰੀ ਕੀਤਾ ਗਿਆ ਹੈ। ਸਤਲੁਜ ਦਰਿਆ ਵਿੱਚ ਪਾਣੀ ਖ਼ਤਰੇ ਦੇ ਨਿਸ਼ਾਨ ਤੋਂ ਪਾਰ ਹੋ ਚੁੱਕਾ ਹੈ। ਸਾਰੇ ਪਿੰਡ ਵਾਸੀ ਤੁਰੰਤ ਸਟੇਟ ਹਾਈਵੇ 25 ਰਾਹੀਂ ਰਾਹਤ ਕੈਂਪ ਪਹੁੰਚੋ।`
                : `Emergency evacuation order for ${activeVillage.name}. The Sutlej river has crossed the danger mark. Evacuate immediately via State Highway 25 to designated relief camp.`}
            </p>
          </div>

          {/* Action Checklist Box */}
          <div className="bg-black/35 border border-white/10 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-start gap-2.5">
              <Navigation className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-red-200 uppercase font-mono font-semibold">Safe Route / ਸੁਰੱਖਿਅਤ ਰੂਟ</p>
                <p className="text-xs font-bold text-white">State Highway 25 (Elevated Corridor via Lohian)</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 border-t border-white/10 pt-2">
              <MapPin className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-red-200 uppercase font-mono font-semibold">Designated Relief Camp / ਰਾਹਤ ਕੈਂਪ</p>
                <p className="text-xs font-bold text-white">Khalsa Senior Secondary School (Dry Zone)</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 border-t border-white/10 pt-2">
              <ShieldCheck className="w-4 h-4 text-cyan-300 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-red-200 uppercase font-mono font-semibold">Livestock & Assets / ਪਸ਼ੂ ਅਤੇ ਸੰਦ</p>
                <p className="text-xs font-medium text-slate-100">
                  ਪਸ਼ੂਆਂ ਨੂੰ ਉੱਚੇ ਡੇਰਿਆਂ ਵੱਲ ਲੈ ਜਾਓ। ਟਰੈਕਟਰ ਸਟੇਟ ਹਾਈਵੇ ਤੇ ਖੜ੍ਹੇ ਕਰੋ।
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Confirmation Button & Siren Control */}
        <div className="pt-2 space-y-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleSiren();
            }}
            className="w-full py-2 px-3 rounded-xl bg-black/30 hover:bg-black/50 border border-white/20 text-white text-[11px] font-mono font-semibold flex items-center justify-center gap-2 active:scale-98 transition cursor-pointer"
          >
            {isSirenActive ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>Emergency Siren Wailing (Tap to Mute)</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-300" />
                <span>Siren Silenced (Tap to Sound Siren / ਸਾਇਰਨ ਚਲਾਓ)</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleAcknowledge}
            className="w-full bg-white text-[#991B1B] hover:bg-slate-100 font-black text-base py-3.5 px-5 rounded-xl shadow-xl flex items-center justify-center gap-2.5 active:scale-98 transition transform cursor-pointer border border-white"
          >
            <span>Got It / ਮੈਂ ਸੁਰੱਖਿਅਤ ਥਾਂ ਵੱਲ ਜਾ ਰਿਹਾ ਹਾਂ</span>
            <ArrowRight className="w-5 h-5 shrink-0" />
          </button>

          <p className="text-[10px] text-center text-red-200/80 font-mono">
            Tapping acknowledges receipt to DEOC & stops siren immediately.
          </p>
        </div>
      </div>
    </div>
  );
}
