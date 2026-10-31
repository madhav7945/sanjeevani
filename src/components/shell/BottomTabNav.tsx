// Generated with Antigravity / Gemini, reviewed and modified by the team
// CTBF-AI-12: Floating Frosted Glass Capsule Tab Bar (Matches NurseBid FloatingTabBar)

'use client';

import React from 'react';
import { LayoutGrid, Compass, Volume2, Camera, User } from 'lucide-react';
import { useFloodApp, AppTab } from '../../context/FloodAppContext';

export default function BottomTabNav() {
  const {
    activeTab,
    setActiveTab,
    currentForecast,
    language,
    citizenReports,
    isNavigating,
    showEvacuationTakeover,
  } = useFloodApp();
  const isPa = language === 'pa';

  // Strictly suppress tab navigation when full-screen evacuation takeover is active or during navigation mode
  if (showEvacuationTakeover || (isNavigating && activeTab === 'map')) {
    return null;
  }

  const tabs: {
    id: AppTab;
    labelEn: string;
    labelPa: string;
    icon: (color: string, size: number) => React.ReactNode;
    badge?: string;
    badgeBg?: string;
    badgeText?: string;
  }[] = [
    {
      id: 'home',
      labelEn: 'Dashboard',
      labelPa: 'ਮੇਰਾ ਪਿੰਡ',
      icon: (color, size) => <LayoutGrid size={size} color={color} strokeWidth={2.2} />,
    },
    {
      id: 'map',
      labelEn: 'Safe Route',
      labelPa: 'ਨਕਸ਼ਾ',
      icon: (color, size) => <Compass size={size} color={color} strokeWidth={2.2} />,
      badge: currentForecast.riskLevel === 'EVACUATE_24H' ? 'EVAC' : undefined,
      badgeBg: '#FEE2E2',
      badgeText: '#DC2626',
    },
    {
      id: 'alerts',
      labelEn: 'Voice Alert',
      labelPa: 'ਆਵਾਜ਼',
      icon: (color, size) => <Volume2 size={size} color={color} strokeWidth={2.2} />,
      badge: 'LIVE',
      badgeBg: '#ECFDF5',
      badgeText: '#059669',
    },
    {
      id: 'report',
      labelEn: 'Breach Cam',
      labelPa: 'ਰਿਪੋਰਟ',
      icon: (color, size) => <Camera size={size} color={color} strokeWidth={2.2} />,
      badge: citizenReports.length > 0 ? `${citizenReports.length}` : undefined,
      badgeBg: '#EBF0F8',
      badgeText: '#4B5563',
    },
    {
      id: 'account',
      labelEn: 'Profile',
      labelPa: 'ਪ੍ਰੋਫਾਈਲ',
      icon: (color, size) => <User size={size} color={color} strokeWidth={2.2} />,
    },
  ];

  return (
    <div className="absolute bottom-4 left-3 right-3 flex items-center justify-center z-[999] pointer-events-none">
      {/* Frosted Glass Capsule Bar */}
      <nav className="floating-capsule w-full max-w-[400px] px-2 py-1.5 flex items-center justify-between pointer-events-auto shadow-2xl">
        {tabs.map((tab) => {
          const isFocused = activeTab === tab.id;
          const iconColor = isFocused ? '#FFFFFF' : '#64748B';

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
              }}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-[22px] transition-all relative cursor-pointer select-none touch-manipulation active:scale-95 ${
                isFocused
                  ? 'bg-[#059669] text-white shadow-[0_4px_14px_rgba(5,150,105,0.35)]'
                  : 'text-[#64748B] hover:text-[#111827] hover:bg-slate-100/60'
              }`}
            >
              {/* Badge */}
              {tab.badge && !isFocused && (
                <span
                  className="absolute -top-1.5 right-1 text-[8px] font-extrabold px-1.5 py-0.2 rounded-full border border-black/5 shadow-xs pointer-events-none"
                  style={{
                    backgroundColor: tab.badgeBg || '#ECFDF5',
                    color: tab.badgeText || '#059669',
                  }}
                >
                  {tab.badge}
                </span>
              )}

              {/* Icon */}
              <div className="h-5 flex items-center justify-center pointer-events-none">
                {tab.icon(iconColor, 18)}
              </div>

              {/* Label */}
              <span
                className={`text-[9px] mt-0.5 tracking-tight truncate max-w-full pointer-events-none ${
                  isFocused ? 'font-extrabold text-white' : 'font-semibold text-[#64748B]'
                }`}
              >
                {isPa ? tab.labelPa : tab.labelEn}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
