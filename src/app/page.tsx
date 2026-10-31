// Generated with Antigravity / Gemini, reviewed and modified by the team
// CTBF-AI-12: Sanjeevani Citizen Mobile App — Clean Minimal Shell

'use client';

import React from 'react';
import MobileAppShell from '../components/shell/MobileAppShell';
import TopVillageHeader from '../components/shell/TopVillageHeader';
import BottomTabNav from '../components/shell/BottomTabNav';
import HomeRiskTab from '../components/tabs/HomeRiskTab';
import SafeMapTab from '../components/tabs/SafeMapTab';
import PunjabiAlertsTab from '../components/tabs/PunjabiAlertsTab';
import ReportBreachTab from '../components/tabs/ReportBreachTab';
import AccountProfileTab from '../components/tabs/AccountProfileTab';
import { useFloodApp } from '../context/FloodAppContext';

function MainAppContent() {
  const { activeTab } = useFloodApp();

  return (
    <MobileAppShell>
      {/* Lean Single-Row Header */}
      <TopVillageHeader />

      {/* Main Tab Screen (Scrollable, Clean, No-Scrollbar) */}
      <main className="flex-1 overflow-hidden flex flex-col relative bg-[#F4F6FA]">
        {activeTab === 'home' && <HomeRiskTab />}
        {activeTab === 'map' && <SafeMapTab />}
        {activeTab === 'alerts' && <PunjabiAlertsTab />}
        {activeTab === 'report' && <ReportBreachTab />}
        {activeTab === 'account' && <AccountProfileTab />}
      </main>

      {/* Floating Capsule Bottom Navigation */}
      <BottomTabNav />
    </MobileAppShell>
  );
}

export default function Page() {
  return <MainAppContent />;
}
