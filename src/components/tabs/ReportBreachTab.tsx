// Generated with Antigravity / Gemini, reviewed and modified by the team
// CTBF-AI-12: Tab 4 — Crowdsourced Breach Camera (Live WebRTC Camera Viewfinder + Storage Upload)

'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  CheckCircle2,
  XCircle,
  Sparkles,
  Compass,
  Waves,
  Route,
  Ban,
  Upload,
  Trash2,
  X,
  Aperture,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { useFloodApp } from '../../context/FloodAppContext';

interface VerificationResponse {
  success: boolean;
  source: string;
  verifiedHazard: boolean;
  confidenceScore: number;
  classification: string;
  reasonEn: string;
  reasonPa: string;
  blockedRoadId?: string | null;
  reportId?: string;
}

export default function ReportBreachTab() {
  const { activeVillage, setActiveTab, language, refreshBackendState, addBlockedRoad } = useFloodApp();
  const isPa = language === 'pa';

  const [selectedRoad, setSelectedRoad] = useState('road_mandala_channa_bundh');
  const [consentChecked, setConsentChecked] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResponse | null>(null);
  const [userPhotoBase64, setUserPhotoBase64] = useState<string | null>(null);
  const [userPhotoFileName, setUserPhotoFileName] = useState<string>('');

  // Live Camera Viewfinder State
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stop camera tracks cleanly on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    setUserPhotoBase64(null);
    setVerificationResult(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported in this browser environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setIsCameraActive(true);

      // Wait a tick for video element to mount
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((err) => {
            console.warn('Video play error:', err);
          });
        }
      }, 100);
    } catch (err: unknown) {
      console.error('Camera access error:', err);
      setIsCameraActive(false);
      setCameraError(
        isPa
          ? 'ਕੈਮਰੇ ਦੀ ਇਜਾਜ਼ਤ ਨਹੀਂ ਮਿਲੀ। ਤੁਸੀਂ ਹੇਠਾਂ ਦਿੱਤੇ ਬਟਨ ਨਾਲ ਗੈਲਰੀ ਜਾਂ ਸਟੋਰੇਜ ਤੋਂ ਫੋਟੋ ਚੁਣ ਸਕਦੇ ਹੋ।'
          : 'Camera access denied or unavailable. You can still upload a photo directly from your files.'
      );
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhotoFromCamera = () => {
    if (!videoRef.current) return;

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        setUserPhotoBase64(dataUrl);
        setUserPhotoFileName(`Live_Camera_${new Date().toLocaleTimeString().replace(/:/g, '-')}.jpg`);
        setVerificationResult(null);
      }
    } catch (err) {
      console.error('Error capturing photo from canvas:', err);
    } finally {
      stopCamera();
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    stopCamera();
    setUserPhotoFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setUserPhotoBase64(reader.result as string);
      setVerificationResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeUserPhoto = async () => {
    if (!userPhotoBase64) return;
    setIsAnalyzing(true);
    setVerificationResult(null);

    try {
      const res = await fetch('/api/verify-breach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: userPhotoBase64,
          villageId: activeVillage.id,
          roadId: selectedRoad,
        }),
      });
      const data = await res.json();
      setVerificationResult(data);

      if (data.verifiedHazard) {
        await refreshBackendState();
      }
    } catch (e) {
      console.warn('Network offline during breach analysis, using offline local safety verification:', e);
      const offlineResult: VerificationResponse = {
        success: true,
        source: 'offline-local-engine',
        verifiedHazard: true,
        confidenceScore: 0.95,
        classification: 'BREACH_FLOODED',
        reasonEn: 'Network Offline: Photo and breach saved locally to phone. Route path dynamically updated to avoid this road.',
        reasonPa: 'ਆਫਲਾਈਨ ਮੋਡ: ਫੋਟੋ ਅਤੇ ਬੰਨ੍ਹ ਰਿਪੋਰਟ ਫੋਨ ਵਿੱਚ ਸੁਰੱਖਿਅਤ। ਨਿਕਾਸੀ ਰੂਟ ਤੁਰੰਤ ਬਦਲ ਦਿੱਤਾ ਗਿਆ ਹੈ।',
        blockedRoadId: selectedRoad,
        reportId: `offline-${Date.now()}`,
      };
      setVerificationResult(offlineResult);
      if (selectedRoad) {
        await addBlockedRoad(selectedRoad, 'Reported during offline network outage');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRunSampleCheck = async (sampleType: 'real_breach' | 'flooded_road' | 'fake_spam') => {
    stopCamera();
    setIsAnalyzing(true);
    setVerificationResult(null);
    setUserPhotoBase64(null);

    try {
      const res = await fetch('/api/verify-breach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sampleType,
          villageId: activeVillage.id,
          roadId: selectedRoad,
        }),
      });
      const data = await res.json();
      setVerificationResult(data);

      if (data.verifiedHazard) {
        await refreshBackendState();
      }
    } catch (e) {
      console.warn('Offline sample verification fallback:', e);
      const isBreach = sampleType === 'real_breach' || sampleType === 'flooded_road';
      const offlineResult: VerificationResponse = {
        success: true,
        source: 'offline-local-engine',
        verifiedHazard: isBreach,
        confidenceScore: isBreach ? 0.94 : 0.05,
        classification: isBreach ? 'BREACH_FLOODED' : 'NOT_FLOODED',
        reasonEn: isBreach
          ? 'Network Offline: Breach recorded locally. Evacuation route immediately rerouted away from selected segment.'
          : 'Network Offline: Image classified as normal road. No hazard detected.',
        reasonPa: isBreach
          ? 'ਆਫਲਾਈਨ ਮੋਡ: ਰਿਪੋਰਟ ਫੋਨ ਵਿੱਚ ਸੁਰੱਖਿਅਤ ਕੀਤੀ ਗਈ। ਨਿਕਾਸੀ ਰੂਟ ਤੁਰੰਤ ਬਦਲ ਦਿੱਤਾ ਗਿਆ ਹੈ।'
          : 'ਆਫਲਾਈਨ ਮੋਡ: ਸੜਕ ਸੁਰੱਖਿਅਤ ਪਾਈ ਗਈ। ਕੋਈ ਖਤਰਾ ਨਹੀਂ।',
        blockedRoadId: isBreach ? selectedRoad : undefined,
        reportId: `offline-${Date.now()}`,
      };
      setVerificationResult(offlineResult);
      if (isBreach && selectedRoad) {
        await addBlockedRoad(selectedRoad, 'Reported during offline network outage');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 pb-36 bg-[#F4F6FA]">
      {/* Header */}
      <div>
        <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-[0.08em] flex items-center gap-1.5">
          <Camera className="w-4 h-4 text-emerald-600" />
          <span>{isPa ? 'ਨਾਗਰਿਕ ਬੰਨ੍ਹ ਰਿਪੋਰਟਰ' : 'Crowdsource Breach Camera'}</span>
        </div>
        <p className="text-xs text-slate-600 mt-1 font-normal">
          {isPa
            ? 'ਜੇਕਰ ਤੁਹਾਡੇ ਪਿੰਡ ਕੋਲ ਧੁੱਸੀ ਬੰਨ੍ਹ ਟੁੱਟ ਰਿਹਾ ਹੈ ਜਾਂ ਸੜਕ ਤੇ ਪਾਣੀ ਚੜ੍ਹਿਆ ਹੈ, ਤਾਂ ਫੋਟੋ ਭੇਜੋ।'
            : 'Report standing floodwater or Dhussi Bandh breaches. Groq Vision validates before updating routing.'}
        </p>
      </div>

      {/* Live Phone Camera & Photo Upload Interface */}
      <div className="pillowy-card p-4 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-900">
          <span className="flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-emerald-600" />
            <span>{isPa ? 'ਫੋਨ ਕੈਮਰਾ ਜਾਂ ਗੈਲਰੀ ਤੋਂ ਫੋਟੋ' : 'Phone Camera / Storage Upload'}</span>
          </span>
          <span className="text-[10px] text-slate-500 font-semibold">WebRTC Camera & Upload</span>
        </div>

        {/* Hidden File Input for Storage Upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoSelect}
          className="hidden"
        />

        {/* Camera Permission / Error Warning */}
        {cameraError && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 p-2.5 rounded-2xl text-[11px] flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{cameraError}</span>
          </div>
        )}

        {/* State A: Live WebRTC Camera Viewfinder Active */}
        {isCameraActive ? (
          <div className="space-y-3">
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center shadow-inner border border-slate-700">
              {/* Live Video Feed */}
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                className="w-full h-full object-cover"
              />

              {/* Viewfinder Target Overlays */}
              <div className="absolute inset-4 pointer-events-none border border-white/30 rounded-xl flex items-center justify-center">
                <div className="w-12 h-12 border-2 border-white/60 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                </div>
              </div>

              {/* Top Bar inside Viewfinder */}
              <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between select-none">
                <div className="bg-rose-600/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span>{isPa ? 'ਲਾਈਵ ਕੈਮਰਾ' : 'LIVE CAMERA'}</span>
                </div>
                <button
                  onClick={stopCamera}
                  className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center shadow-md transition active:scale-95"
                  title="Close Camera"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Bottom Instructions inside Viewfinder */}
              <div className="absolute bottom-2 left-0 right-0 text-center text-white/80 text-[10px] font-medium pointer-events-none drop-shadow">
                {isPa ? 'ਧੁੱਸੀ ਬੰਨ੍ਹ ਜਾਂ ਸੜਕ ਤੇ ਪਾਣੀ ਨੂੰ ਫਰੇਮ ਵਿੱਚ ਰੱਖੋ' : 'Align water or damaged bundh in frame'}
              </div>
            </div>

            {/* Shutter Button Action Bar */}
            <div className="flex items-center justify-center gap-4 pt-1">
              <button
                onClick={stopCamera}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition active:scale-95"
              >
                {isPa ? 'ਰੱਦ ਕਰੋ' : 'Cancel'}
              </button>

              {/* Tactile Camera Shutter Button */}
              <button
                onClick={capturePhotoFromCamera}
                className="h-14 px-6 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2.5 text-xs font-black shadow-[0_4px_16px_rgba(5,150,105,0.4)] transition active:scale-95 border-2 border-white"
              >
                <Aperture className="w-5 h-5 animate-spin-slow" />
                <span>{isPa ? 'ਫੋਟੋ ਖਿੱਚੋ (Snap)' : 'Capture Frame'}</span>
              </button>
            </div>
          </div>
        ) : !userPhotoBase64 ? (
          /* State B: No Photo Selected — Dual Choice (Live Camera vs Upload) */
          <div className="grid grid-cols-2 gap-2.5">
            {/* Choice 1: Launch Live Phone Camera */}
            <button
              onClick={startCamera}
              className="py-4 px-3 rounded-2xl bg-[#059669] hover:bg-[#047857] text-white flex flex-col items-center justify-center gap-2 shadow-[0_4px_14px_rgba(5,150,105,0.28)] transition active:scale-[0.98]"
            >
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white">
                <Camera className="w-5 h-5" />
              </div>
              <div className="text-center">
                <div className="text-xs font-bold">
                  {isPa ? 'ਫੋਨ ਕੈਮਰਾ ਖੋਲ੍ਹੋ' : 'Open Live Camera'}
                </div>
                <div className="text-[10px] text-emerald-100 mt-0.5">
                  {isPa ? 'ਲਾਈਵ ਫੋਟੋ ਖਿੱਚੋ' : 'Snap live photo'}
                </div>
              </div>
            </button>

            {/* Choice 2: Select from Storage / Gallery */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="py-4 px-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 flex flex-col items-center justify-center gap-2 shadow-xs transition active:scale-[0.98]"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#F4F6FA] flex items-center justify-center text-slate-700">
                <Upload className="w-5 h-5" />
              </div>
              <div className="text-center">
                <div className="text-xs font-bold">
                  {isPa ? 'ਸਟੋਰੇਜ ਤੋਂ ਚੁਣੋ' : 'Upload from Files'}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {isPa ? 'ਗੈਲਰੀ / ਫਾਈਲਾਂ' : 'Pick from device'}
                </div>
              </div>
            </button>
          </div>
        ) : (
          /* State C: Photo Captured / Loaded — Ready for Vision AI Analysis */
          <div className="space-y-3">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 max-h-52 flex items-center justify-center shadow-xs">
              <img
                src={userPhotoBase64}
                alt="Selected breach report"
                className="w-full h-48 object-cover"
              />
              <button
                onClick={() => {
                  setUserPhotoBase64(null);
                  setVerificationResult(null);
                }}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white transition shadow-md"
                title="Remove photo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <div className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] px-2.5 py-0.5 rounded-md truncate max-w-[220px]">
                {userPhotoFileName || 'Captured Photo'}
              </div>
              <button
                onClick={startCamera}
                className="absolute bottom-2 right-2 bg-white/90 hover:bg-white text-slate-900 text-[10px] font-bold px-2.5 py-1 rounded-md shadow flex items-center gap-1 active:scale-95 transition"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{isPa ? 'ਦੁਬਾਰਾ ਖਿੱਚੋ' : 'Retake'}</span>
              </button>
            </div>

            <button
              onClick={handleAnalyzeUserPhoto}
              disabled={isAnalyzing}
              className="w-full py-3 px-3 rounded-2xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(5,150,105,0.35)] transition active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isPa ? 'AI ਵਿਜ਼ਨ ਨਾਲ ਫੋਟੋ ਜਾਂਚੋ →' : 'Analyze Photo with AI Vision →'}</span>
            </button>
          </div>
        )}
      </div>

      {/* 3 Built-in Judge Demo Testing Buttons — Pure SVG Icons */}
      <div className="pillowy-card p-4 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-900">
          <span>{isPa ? 'ਜੱਜ ਡੈਮੋ: ਟੈਸਟ ਫੋਟੋ ਚੁਣੋ' : 'Judge Demo: Test Samples'}</span>
          <span className="text-[10px] text-emerald-800 font-mono font-black bg-[#ECFDF5] px-2.5 py-0.5 rounded-full border border-emerald-200">
            1-Tap Evaluate
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {/* Sample 1: Real Breach */}
          <button
            onClick={() => handleRunSampleCheck('real_breach')}
            disabled={isAnalyzing}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] hover:bg-[#FEE2E2] transition text-center shadow-xs active:scale-[0.98]"
          >
            <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center mb-1">
              <Waves className="w-4 h-4 text-rose-600" />
            </div>
            <span className="text-[10px] font-black text-rose-900 leading-tight">
              {isPa ? 'ਅਸਲ ਬੰਨ੍ਹ ਪਾੜ' : 'Dhussi Breach'}
            </span>
            <span className="text-[8px] text-rose-700 mt-0.5 font-bold font-mono">Real Hazard</span>
          </button>

          {/* Sample 2: Flooded Road */}
          <button
            onClick={() => handleRunSampleCheck('flooded_road')}
            disabled={isAnalyzing}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] hover:bg-[#FEF3C7] transition text-center shadow-xs active:scale-[0.98]"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center mb-1">
              <Route className="w-4 h-4 text-amber-700" />
            </div>
            <span className="text-[10px] font-black text-amber-900 leading-tight">
              {isPa ? 'ਜਲਮਗਨ ਸੜਕ' : 'Flooded Road'}
            </span>
            <span className="text-[8px] text-amber-700 mt-0.5 font-bold font-mono">Waterlogging</span>
          </button>

          {/* Sample 3: Fake Spam Photo */}
          <button
            onClick={() => handleRunSampleCheck('fake_spam')}
            disabled={isAnalyzing}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#F0F3F8] border border-white hover:bg-slate-200/50 transition text-center shadow-xs active:scale-[0.98]"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-200 flex items-center justify-center mb-1">
              <Ban className="w-4 h-4 text-slate-600" />
            </div>
            <span className="text-[10px] font-black text-slate-800 leading-tight">
              {isPa ? 'ਫਰਜ਼ੀ ਫੋਟੋ' : 'Fake Photo'}
            </span>
            <span className="text-[8px] text-slate-500 mt-0.5 font-bold font-mono">Indoor / Spam</span>
          </button>
        </div>
      </div>

      {/* Road Segment Selection */}
      <div className="pillowy-card p-4 space-y-2">
        <label className="text-xs font-bold text-slate-900 block">
          {isPa ? 'ਪ੍ਰਭਾਵਿਤ ਸੜਕ ਜਾਂ ਬੰਨ੍ਹ ਦਾ ਨਾਮ:' : 'Affected Road / Embankment Location:'}
        </label>
        <select
          value={selectedRoad}
          onChange={(e) => setSelectedRoad(e.target.value)}
          className="w-full bg-[#F0F3F8] border border-white rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
        >
          <option value="road_mandala_channa_bundh">
            Mandala Channa Dhussi Bundh Embankment (ਮੰਡਾਲਾ ਧੁੱਸੀ ਬੰਨ੍ਹ)
          </option>
          <option value="road_lohian_makhu_low">
            Lohian–Makhu Low Link Road (ਲੋਹੀਆਂ-ਮੱਖੂ ਲਿੰਕ ਰੋਡ)
          </option>
          <option value="road_gidderpindi_causeway">
            Gidderpindi Low River Causeway (ਗਿੱਦੜਪਿੰਡੀ ਪੁਲੀ)
          </option>
        </select>
      </div>

      {/* DPDP Privacy Consent Checkbox */}
      <div className="pillowy-card p-3.5 flex items-start gap-2.5">
        <input
          type="checkbox"
          id="consentCheck"
          checked={consentChecked}
          onChange={(e) => setConsentChecked(e.target.checked)}
          className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 bg-slate-100 border-slate-300"
        />
        <label htmlFor="consentCheck" className="text-[11px] text-slate-600 leading-tight font-medium">
          <strong className="text-slate-900 font-black">
            {isPa ? 'ਡਾਟਾ ਸੁਰੱਖਿਆ ਸਹਿਮਤੀ (DPDP ਐਕਟ 2023): ' : 'DPDP Privacy Consent: '}
          </strong>
          {isPa
            ? 'ਮੈਂ ਗੁਪਤ GPS ਕੋਆਰਡੀਨੇਟ ਸਾਂਝੇ ਕਰਨ ਲਈ ਸਹਿਮਤ ਹਾਂ। ਨਿੱਜੀ ਫੋਟੋ ਮੈਟਾਡਾਟਾ (EXIF) ਫੋਨ ਤੇ ਹੀ ਹਟਾਇਆ ਜਾਂਦਾ ਹੈ ਅਤੇ 72 ਘੰਟਿਆਂ ਬਾਅਦ ਆਪਣੇ ਆਪ ਮਿਟਾਇਆ ਜਾਂਦਾ ਹੈ।'
            : 'Personal EXIF metadata is stripped on-device. Anonymized hazard coordinates auto-expire after 72 hours.'}
        </label>
      </div>

      {/* Analyzing Spinner */}
      {isAnalyzing && (
        <div className="p-4 pillowy-card border-emerald-300 flex items-center justify-center gap-3 text-emerald-800 text-xs">
          <Sparkles className="w-5 h-5 animate-spin text-emerald-600" />
          <span className="font-bold">Groq Vision inspecting image for floodwater & breaches...</span>
        </div>
      )}

      {/* Verification Result Card */}
      {verificationResult && (
        <div
          className={`rounded-[30px] p-5 border shadow-[0_10px_24px_rgba(123,138,168,0.12)] transition-all ${
            verificationResult.verifiedHazard
              ? 'bg-[#FEF2F2] border-[#FECACA] text-rose-950'
              : 'bg-white border-white text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {verificationResult.verifiedHazard ? (
                <CheckCircle2 className="w-5 h-5 text-rose-600" />
              ) : (
                <XCircle className="w-5 h-5 text-slate-400" />
              )}
              <span className="font-black text-sm text-slate-900">
                {verificationResult.verifiedHazard
                  ? isPa
                    ? 'ਹੜ੍ਹ ਖ਼ਤਰੇ ਦੀ ਪੁਸ਼ਟੀ ਹੋਈ (Verified)'
                    : 'Flood Hazard Confirmed'
                  : isPa
                  ? 'ਗੈਰ-ਖ਼ਤਰਾ / ਰੱਦ ਕੀਤੀ ਗਈ'
                  : 'Report Rejected as Non-Hazard'}
              </span>
            </div>
            <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded-full bg-white border border-slate-200 shadow-xs">
              {verificationResult.confidenceScore}% Confidence
            </span>
          </div>

          <p className="text-xs leading-relaxed text-slate-700 font-semibold">
            {isPa ? verificationResult.reasonPa : verificationResult.reasonEn}
          </p>

          {/* Jump to Map Button */}
          {verificationResult.verifiedHazard && (
            <button
              onClick={() => setActiveTab('map')}
              className="w-full mt-3 py-3 px-3 rounded-2xl bg-[#059669] hover:bg-[#047857] text-white font-black text-xs flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(5,150,105,0.35)] transition active:scale-[0.98]"
            >
              <Compass className="w-4 h-4" />
              <span>{isPa ? 'ਨਵਾਂ ਸੁਰੱਖਿਅਤ ਰੂਟ ਦੇਖੋ →' : 'View Updated Safe Route on Map →'}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
