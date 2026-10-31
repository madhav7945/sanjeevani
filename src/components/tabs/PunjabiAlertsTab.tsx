// Generated with Antigravity / Gemini, reviewed and modified by the team
// CTBF-AI-12: Tab 3 — Groq Llama 3.3 Vernacular Voice & 2G SMS — NurseBid Pillowy Style

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Volume2,
  VolumeX,
  Radio,
  Share2,
  Copy,
  Sparkles,
  Check,
  MessageSquare,
  RefreshCw,
} from 'lucide-react';
import { useFloodApp } from '../../context/FloodAppContext';
import { playPunjabiVoiceAlert, stopSpeech } from '../../lib/punjabiSpeech';

export default function PunjabiAlertsTab() {
  const { activeVillage, currentStep, currentForecast, language, evacuationRoute } =
    useFloodApp();

  const isPa = language === 'pa';
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoadingGroq, setIsLoadingGroq] = useState(false);
  const lastFetchedKeyRef = useRef<string>('');

  const [alertData, setAlertData] = useState<{
    gurmukhiScript: string;
    smsText: string;
    englishTranslation: string;
    source: string;
  }>({
    gurmukhiScript: `ਸਾਵਧਾਨ! ਪਿੰਡ ਵਾਸੀਆਂ ਨੂੰ ਸੂਚਿਤ ਕੀਤਾ ਜਾਂਦਾ ਹੈ ਕਿ ਸਤਲੁਜ ਵਿੱਚ ਪਾਣੀ ਦਾ ਪੱਧਰ ਤੇਜ਼ੀ ਨਾਲ ਵਧ ਰਿਹਾ ਹੈ। ਤੁਰੰਤ ਸੁਰੱਖਿਅਤ ਰੂਟ ਰਾਹੀਂ ਨੇੜਲੇ ਸਰਕਾਰੀ ਸਕੂਲ ਜਾਂ ਗੁਰਦੁਆਰਾ ਸਾਹਿਬ ਦੇ ਰਾਹਤ ਕੈਂਪ ਵਿੱਚ ਪਹੁੰਚੋ।`,
    smsText: `[ਸੰਜੀਵਨੀ ਐਮਰਜੈਂਸੀ] ਸਤਲੁਜ ਚ ਪਾਣੀ ਦਾ ਪੱਧਰ ਤੇਜ਼ੀ ਨਾਲ ਵਧ ਰਿਹਾ ਹੈ। ਤੁਰੰਤ ਸੁਰੱਖਿਅਤ ਰੂਟ ਰਾਹੀਂ ਨੇੜਲੇ ਰਾਹਤ ਕੈਂਪ ਪਹੁੰਚੋ। ਹੈਲਪਲਾਈਨ: 112 / 1077`,
    englishTranslation: `EMERGENCY ALERT: Water levels in Sutlej river rising rapidly. Evacuate immediately via designated safe route to nearest relief camp.`,
    source: 'groq-verified-bulletin',
  });

  const generateGroqAlert = useCallback(
    async (force = false) => {
      const cacheKey = `${activeVillage.id}_${currentForecast.riskLevel}_${currentStep.hoursToHistoricalBreach}_${evacuationRoute.camp.id}`;
      if (!force && lastFetchedKeyRef.current === cacheKey) {
        return;
      }
      lastFetchedKeyRef.current = cacheKey;

      setIsLoadingGroq(true);
      try {
        const res = await fetch('/api/generate-alert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            villageName: activeVillage.name,
            punjabiName: activeVillage.punjabiName,
            hoursLeft: currentStep.hoursToHistoricalBreach,
            riskLevel: currentForecast.riskLevel,
            safeRoadName: 'Elevated State Highway 25',
            reliefCampName: evacuationRoute.camp.punjabiName,
            cattleAdvice: currentForecast.livestockAndTractorActionPa,
          }),
        });
        const data = await res.json();
        if (data.success && data.gurmukhiScript) {
          setAlertData({
            gurmukhiScript: data.gurmukhiScript,
            smsText: data.smsText,
            englishTranslation: data.englishTranslation,
            source: data.source,
          });
        }
      } catch (e) {
        console.warn('Using local fallback alert', e);
      } finally {
        setIsLoadingGroq(false);
      }
    },
    [
      activeVillage.id,
      activeVillage.name,
      activeVillage.punjabiName,
      currentStep.hoursToHistoricalBreach,
      currentForecast.riskLevel,
      currentForecast.livestockAndTractorActionPa,
      evacuationRoute.camp.id,
      evacuationRoute.camp.punjabiName,
    ]
  );

  // Only stop speech when user leaves the alerts tab completely
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  const handleToggleVoice = () => {
    if (isPlaying) {
      stopSpeech();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      playPunjabiVoiceAlert(
        alertData.gurmukhiScript,
        () => setIsPlaying(true),
        () => setIsPlaying(false),
        () => setIsPlaying(false)
      );
    }
  };

  const handleCopySms = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(alertData.smsText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `*ਸੰਜੀਵਨੀ ਹੜ੍ਹ ਅਲਰਟ (Sanjeevani AI)*\n\n${alertData.smsText}\n\nਸੁਰੱਖਿਅਤ ਕੈਂਪ: ${evacuationRoute.camp.punjabiName}\nਹੈਲਪਲਾਈਨ: 112 / 1077`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 pb-36 bg-[#F4F6FA]">
      {/* Groq AI Badge Header */}
      <div className="flex items-center justify-between text-xs px-1">
        <div className="flex items-center gap-1.5 text-emerald-800 font-semibold uppercase tracking-[0.08em] text-[11px]">
          <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span>{isPa ? 'ਪੰਜਾਬੀ ਆਵਾਜ਼ੀ ਚੇਤਾਵਨੀ ਪ੍ਰਣਾਲੀ' : 'Vernacular Audio Engine'}</span>
        </div>
        <span className="text-[10px] bg-white text-slate-800 px-3 py-1 rounded-full font-mono font-bold border border-slate-200/80 shadow-xs flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-emerald-600" />
          <span>Groq Llama 3.3 70B</span>
        </span>
      </div>

      {/* Main Punjabi Voice Card — Pillowy Elevation */}
      <div className="pillowy-card p-5 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">
            {isPa ? 'ਸਥਾਨਕ ਐਮਰਜੈਂਸੀ ਬੁਲੇਟਿਨ' : 'Village Emergency Broadcast'}
          </div>
          <button
            onClick={() => generateGroqAlert(true)}
            disabled={isLoadingGroq}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-semibold border border-emerald-200 transition active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Generate fresh Groq AI bulletin"
          >
            <RefreshCw className={`w-3 h-3 ${isLoadingGroq ? 'animate-spin' : ''}`} />
            <span>{isLoadingGroq ? (isPa ? 'Groq ਤਿਆਰ ਕਰ ਰਿਹਾ ਹੈ...' : 'Groq generating...') : (isPa ? 'ਨਵਾਂ ਬੁਲੇਟਿਨ ਬਣਾਓ' : 'Regenerate')}</span>
          </button>
        </div>

        {/* Gurmukhi Text Area in Inset Well */}
        <div className="pillowy-inset p-4 text-slate-900 text-sm leading-relaxed font-semibold">
          {alertData.gurmukhiScript}
        </div>

        {/* Animated Waveform when playing */}
        {isPlaying && (
          <div className="flex items-center justify-center gap-1.5 py-2">
            {[10, 22, 16, 28, 18, 26, 12, 28, 20, 14, 24].map((h, i) => (
              <span
                key={i}
                className="w-1.5 bg-[#059669] rounded-full animate-bounce"
                style={{
                  height: `${h}px`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Big Tactile Play Voice Button */}
        <button
          onClick={handleToggleVoice}
          className={`w-full py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2.5 font-bold text-xs shadow-md transition-all active:scale-[0.98] ${
            isPlaying
              ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-[0_4px_14px_rgba(225,29,72,0.3)]'
              : 'bg-[#059669] hover:bg-[#047857] text-white shadow-[0_4px_14px_rgba(5,150,105,0.3)]'
          }`}
        >
          {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          <span>
            {isPlaying
              ? isPa
                ? 'ਆਵਾਜ਼ ਬੰਦ ਕਰੋ (Stop Broadcast)'
                : 'Stop Voice Playback'
              : isPa
                ? 'ਪੰਜਾਬੀ ਵਿੱਚ ਸੁਣੋ (Play Neural Voice)'
                : 'Listen Neural Voice Alert'}
          </span>
        </button>

        <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Google Punjabi Female Voice (pa-IN) · Fluent Native Gurmukhi Audio</span>
        </div>
      </div>

      {/* 2G Offline SMS Preview Card */}
      <div className="pillowy-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <span>{isPa ? '2G ਸੈਲੂਲਰ SMS ਸੁਨੇਹਾ (< 140 ਅੱਖਰ)' : '2G Cellular SMS (< 140 chars)'}</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono font-bold">
            {alertData.smsText.length}/140 chars
          </span>
        </div>

        {/* SMS Bubble */}
        <div className="pillowy-inset p-3.5 text-xs text-slate-900 font-semibold leading-relaxed">
          {alertData.smsText}
        </div>

        {/* Copy & WhatsApp Share Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleCopySms}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold border border-slate-200/80 transition shadow-xs active:scale-[0.98]"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
            <span>{copied ? 'Copied!' : isPa ? 'ਕਾਪੀ ਕਰੋ' : 'Copy SMS'}</span>
          </button>
          <button
            onClick={handleShareWhatsApp}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold shadow-[0_4px_10px_rgba(5,150,105,0.25)] transition active:scale-[0.98]"
          >
            <Share2 className="w-4 h-4" />
            <span>{isPa ? 'ਵਟਸਐਪ ਤੇ ਭੇਜੋ' : 'Share WhatsApp'}</span>
          </button>
        </div>
      </div>

      {/* English Translation Card */}
      <div className="pillowy-card p-4 text-xs text-slate-600 space-y-1">
        <div className="font-bold text-slate-900">English Translation:</div>
        <div className="font-normal text-slate-600">{alertData.englishTranslation}</div>
      </div>
    </div>
  );
}
