// Generated with Antigravity / Gemini, reviewed and modified by the team
// CTBF-AI-12: Live Incoming P2P Bluetooth Mesh SOS Receiver Modal
// Clean Enterprise Soft-Neumorphic Light Theme (No Dark Mode)

'use client';

import React from 'react';
import { Radio, MapPin, CheckCircle2, X, Phone, Users, ShieldAlert, Cpu } from 'lucide-react';
import { useFloodApp } from '../../context/FloodAppContext';
import { PUNJAB_VILLAGES } from '../../data/villagesAndCamps';

export default function IncomingMeshSosModal() {
  const { incomingMeshBeacon, dismissMeshBeacon, setActiveTab, setActiveVillage, language } = useFloodApp();

  if (!incomingMeshBeacon) return null;

  const isPa = language === 'pa';

  const handlePlotOnMap = () => {
    const targetVillage = PUNJAB_VILLAGES.find(
      (v) =>
        v.name.toLowerCase() === incomingMeshBeacon.villageName.toLowerCase() ||
        v.punjabiName === incomingMeshBeacon.villageName
    );
    if (targetVillage) {
      setActiveVillage(targetVillage);
    }
    setActiveTab('map');
    dismissMeshBeacon();
  };

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label="Bluetooth Mesh SOS Alert"
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3.5 z-[9999] animate-in fade-in zoom-in-95 duration-200"
    >
      <div className="bg-white border border-rose-200 rounded-3xl p-5 max-w-sm w-full shadow-[0_24px_60px_-15px_rgba(225,29,72,0.22)] text-slate-900 relative">
        {/* Dismiss X Button */}
        <button
          type="button"
          onClick={dismissMeshBeacon}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition active:scale-95 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Radar Header */}
        <div className="flex items-center gap-3 mb-3.5 pr-8">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-600 animate-pulse shrink-0 shadow-xs">
            <Radio className="w-5 h-5 text-rose-600" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping shrink-0" />
              <h3 className="font-black text-sm text-rose-700 tracking-tight leading-snug truncate">
                {isPa ? 'ਬਲੂਟੁੱਥ ਮੈਸ਼ SOS ਪ੍ਰਾਪਤ ਹੋਇਆ!' : 'P2P Mesh SOS Received!'}
              </h3>
            </div>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
              BLE Radio Hop 3/3 · 0% Cellular Network Needed
            </p>
          </div>
        </div>

        {/* Distress Payload Card (Clean White Surface with subtle border) */}
        <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-3.5 space-y-2.5 mb-3.5 shadow-xs">
          {/* Sender Identity */}
          <div className="flex items-start justify-between border-b border-slate-200/70 pb-2.5">
            <div>
              <div className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">
                {isPa ? 'ਸੰਕਟ ਵਿੱਚ ਘਿਰੇ ਨਾਗਰਿਕ' : 'Survivor in Distress:'}
              </div>
              <div className="font-black text-base text-slate-900 leading-tight mt-0.5">
                {incomingMeshBeacon.senderName}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-600 font-mono font-medium mt-0.5">
                <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>{incomingMeshBeacon.senderPhone}</span>
              </div>
            </div>
            <span className="text-[9px] font-mono bg-rose-100 text-rose-800 border border-rose-200 px-2 py-0.5 rounded-full font-bold shrink-0">
              {incomingMeshBeacon.packetHash}
            </span>
          </div>

          {/* Location & GPS + Evacuee Counts */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Location Box */}
            <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
              <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                {isPa ? 'ਸਥਾਨ' : 'Location'}
              </div>
              <div className="font-bold text-slate-900 text-xs mt-0.5 truncate">
                {incomingMeshBeacon.villageName}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                {incomingMeshBeacon.coords[0].toFixed(3)}°N, {incomingMeshBeacon.coords[1].toFixed(3)}°E
              </div>
            </div>

            {/* Evacuee Counts Box */}
            <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
              <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                {isPa ? 'ਜੀਅ & ਪਸ਼ੂ' : 'Evacuees'}
              </div>
              <div className="font-bold text-amber-700 text-xs mt-0.5 flex items-center gap-1">
                <Users className="w-3 h-3 text-amber-600 shrink-0" />
                <span>Family: {incomingMeshBeacon.familyMembers}</span>
              </div>
              <div className="text-[10px] text-slate-600 font-medium">
                Cattle: {incomingMeshBeacon.cattleCount} head
              </div>
            </div>
          </div>

          {/* Medical Priority Needs */}
          {incomingMeshBeacon.medicalNeeds && (
            <div className="p-2.5 rounded-xl bg-rose-50/80 border border-rose-200/80 text-[11px] text-rose-950 flex items-start gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-rose-800">
                  {isPa ? 'ਵਿਸ਼ੇਸ਼ ਲੋੜ:' : 'Priority Needs:'}{' '}
                </span>
                <span>{incomingMeshBeacon.medicalNeeds}</span>
              </div>
            </div>
          )}

          {/* Relay Gateway Footer Tag */}
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
            <span className="flex items-center gap-1">
              <Cpu className="w-3 h-3 text-blue-600" />
              <span>Gateway Relay:</span>
            </span>
            <span className="font-semibold text-slate-700 truncate max-w-[170px]">
              {incomingMeshBeacon.gatewayNode || 'Highway-SH25-Relay-Cellular-04'}
            </span>
          </div>
        </div>

        {/* Action Buttons (Clean Neumorphic Dual Buttons) */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handlePlotOnMap}
            className="py-3 px-3 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-xs shadow-[0_4px_12px_rgba(37,99,235,0.22)] transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span>{isPa ? 'ਨਕਸ਼ੇ ਤੇ ਵੇਖੋ' : 'Plot on Map'}</span>
          </button>

          <button
            type="button"
            onClick={dismissMeshBeacon}
            className="py-3 px-3 rounded-2xl bg-[#059669] hover:bg-[#047857] text-white font-extrabold text-xs shadow-[0_4px_12px_rgba(5,150,105,0.22)] transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>{isPa ? 'ਕਬੂਲ ਕਰੋ (ACK)' : 'Acknowledge'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
