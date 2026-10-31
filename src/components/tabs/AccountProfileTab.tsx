// Generated with Antigravity / Gemini, reviewed and modified by the team
// CTBF-AI-12: Tab 5 — Citizen Disaster Profile & Family Account Page
// Clean Enterprise Soft-Neumorphic Light Theme (Zero Dark Mode)

'use client';

import React, { useState } from 'react';
import {
  User,
  Phone,
  Users,
  ShieldCheck,
  MapPin,
  HeartPulse,
  Save,
  Check,
  AlertTriangle,
  Building2,
  Lock,
  Plus,
  Minus,
} from 'lucide-react';
import { useFloodApp } from '../../context/FloodAppContext';

export default function AccountProfileTab() {
  const {
    citizenProfile,
    updateCitizenProfile,
    activeVillage,
    reliefCamps,
    preferredCampId,
    setPreferredCampId,
    language,
    setActiveTab,
  } = useFloodApp();

  const isPa = language === 'pa';

  const [form, setForm] = useState({
    name: citizenProfile.name,
    phone: citizenProfile.phone,
    familyMembers: citizenProfile.familyMembers,
    cattleCount: citizenProfile.cattleCount,
    medicalNeeds: citizenProfile.medicalNeeds,
  });

  const [savedFeedback, setSavedFeedback] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCitizenProfile(form);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  const currentCamp = reliefCamps.find((c) => c.id === preferredCampId) || reliefCamps[0];

  return (
    <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-4 pb-28 text-slate-900 select-none animate-in fade-in duration-200">
      {/* Top Identity Header */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-black text-lg shrink-0 shadow-2xs">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-black text-slate-900 leading-tight">
                {form.name || 'Citizen Survivor'}
              </h1>
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[9px] font-bold border border-emerald-200 font-mono">
                <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                <span>SDMA VERIFIED</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-1">
              <Phone className="w-3 h-3 text-slate-400" />
              <span>{form.phone}</span>
              <span>·</span>
              <span className="font-semibold text-slate-700">
                {isPa ? activeVillage.punjabiName : activeVillage.name}
              </span>
            </p>
          </div>
        </div>

        <div className="hidden sm:flex flex-col items-end text-right">
          <span className="text-[10px] font-mono text-slate-400">Offline Ledger</span>
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <Lock className="w-3 h-3 text-emerald-600" />
            <span>P2P Ready</span>
          </span>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-3.5">
        {/* Personal Details Card */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <User className="w-4 h-4 text-blue-600" />
              <span>{isPa ? 'ਨਾਗਰਿਕ ਵੇਰਵਾ' : 'Primary Contact Information'}</span>
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">Required for Mesh SOS</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                {isPa ? 'ਪੂਰਾ ਨਾਮ' : 'Full Legal Name'}
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Gurpreet Singh"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-[#F8FAFC] focus:bg-white focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-medium"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                {isPa ? 'ਮੋਬਾਈਲ ਨੰਬਰ' : 'Emergency Mobile Phone'}
              </label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-[#F8FAFC] focus:bg-white focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-mono font-medium"
              />
            </div>
          </div>
        </div>

        {/* Household & Livestock Counters */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>{isPa ? 'ਪਰਿਵਾਰ ਅਤੇ ਪਸ਼ੂ ਧਨ' : 'Household & Livestock Census'}</span>
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">Disaster Evacuation Load</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Family Members Counter */}
            <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-slate-200/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  {isPa ? 'ਪਰਿਵਾਰ ਦੇ ਜੀਅ' : 'Family Members'}
                </span>
                <Users className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, familyMembers: Math.max(1, form.familyMembers - 1) })}
                  className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs hover:bg-slate-50 active:scale-95 cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <div className="text-center">
                  <span className="font-mono font-black text-lg text-slate-900">{form.familyMembers}</span>
                  <span className="block text-[9px] text-slate-500 font-medium">Persons</span>
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, familyMembers: form.familyMembers + 1 })}
                  className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs hover:bg-slate-50 active:scale-95 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Livestock Counter */}
            <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-slate-200/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  {isPa ? 'ਪਸ਼ੂ ਧਨ (ਮੱਝਾਂ/ਗਾਵਾਂ)' : 'Livestock Head'}
                </span>
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, cattleCount: Math.max(0, form.cattleCount - 1) })}
                  className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs hover:bg-slate-50 active:scale-95 cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <div className="text-center">
                  <span className="font-mono font-black text-lg text-amber-800">{form.cattleCount}</span>
                  <span className="block text-[9px] text-slate-500 font-medium">Head</span>
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, cattleCount: form.cattleCount + 1 })}
                  className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs hover:bg-slate-50 active:scale-95 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-snug">
            {isPa
              ? 'ਪਸ਼ੂਆਂ ਦੀ ਗਿਣਤੀ ਅਨੁਸਾਰ ਸਰਕਾਰ ਵੱਲੋਂ ਰਾਹਤ ਕੈਂਪ ਵਿੱਚ ਚਾਰਾ ਅਤੇ ਪਸ਼ੂ ਡਾਕਟਰ ਦਾ ਪ੍ਰਬੰਧ ਕੀਤਾ ਜਾਵੇਗਾ।'
              : 'Livestock counts are routed directly to SDMA veterinary teams to allocate cattle fodder at designated relief camps.'}
          </p>
        </div>

        {/* Priority Medical & Special Needs Card */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-rose-600" />
              <span>{isPa ? 'ਵਿਸ਼ੇਸ਼ ਡਾਕਟਰੀ / ਬਚਾਅ ਲੋੜਾਂ' : 'Special Medical & Mobility Needs'}</span>
            </h2>
            <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              NDRF Triage Priority
            </span>
          </div>

          <div>
            <textarea
              rows={2}
              value={form.medicalNeeds}
              onChange={(e) => setForm({ ...form, medicalNeeds: e.target.value })}
              placeholder="e.g. Elderly diabetic parent requiring insulin, pregnant woman, wheelchair required"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-[#F8FAFC] focus:bg-white focus:outline-hidden focus:border-rose-500 focus:ring-1 focus:ring-rose-500 font-medium leading-relaxed"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              {isPa
                ? 'ਇਹ ਜਾਣਕਾਰੀ ਬਲੂਟੁੱਥ ਮੈਸ਼ SOS ਰਾਹੀਂ NDRF ਬੋਟ ਟੀਮ ਨੂੰ ਤੁਰੰਤ ਮਿਲਦੀ ਹੈ।'
                : 'Broadcasted automatically in offline BLE mesh packets for boat dispatch priority.'}
            </span>
          </div>
        </div>

        {/* Target Village & Preferred Shelter Selection */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-cyan-600" />
              <span>{isPa ? 'ਮਨਪਸੰਦ ਰਾਹਤ ਕੈਂਪ & ਰੂਟ' : 'Designated Relief Camp Target'}</span>
            </h2>
            <span className="text-[10px] font-mono text-emerald-700 font-bold">
              {currentCamp.bedsAvailable} Beds Free
            </span>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              {isPa ? 'ਸੁਰੱਖਿਅਤ ਸ਼ੈਲਟਰ ਚੁਣੋ' : 'Select Target Shelter'}
            </label>
            <select
              value={preferredCampId}
              onChange={(e) => setPreferredCampId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-[#F8FAFC] focus:bg-white focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-semibold text-slate-900 cursor-pointer"
            >
              {reliefCamps.map((camp) => (
                <option key={camp.id} value={camp.id}>
                  {camp.name} ({camp.bedsAvailable} beds available · {camp.hasVeterinary ? '🐄 Vet Care' : 'No Vet'})
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <div className="font-bold text-slate-900 text-xs">
                  {isPa ? activeVillage.punjabiName : activeVillage.name}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {activeVillage.coords[0].toFixed(4)}°N, {activeVillage.coords[1].toFixed(4)}°E
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('map')}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] shadow-2xs transition active:scale-95 cursor-pointer"
            >
              {isPa ? 'ਨਕਸ਼ਾ ਵੇਖੋ' : 'View on Map'}
            </button>
          </div>
        </div>

        {/* Save Changes Button */}
        <button
          type="submit"
          className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-[0_4px_14px_rgba(37,99,235,0.25)] transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
        >
          {savedFeedback ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>{isPa ? 'ਵੇਰਵਾ ਫ਼ੋਨ ਵਿੱਚ ਸੁਰੱਖਿਅਤ ਹੋ ਗਿਆ!' : 'Profile Saved Successfully!'}</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isPa ? 'ਪ੍ਰੋਫਾਈਲ ਸੇਵ ਕਰੋ (Save Profile)' : 'Save Emergency Profile'}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
