// Generated with Antigravity / Gemini, reviewed and modified by the team
// CTBF-AI-12: Full Web Shell — Clean Times New Roman Layout (Zero Fake Phone Simulator Bezel)

'use client';

import React from 'react';
import { WifiOff } from 'lucide-react';
import { useFloodApp } from '../../context/FloodAppContext';
import IncomingMeshSosModal from '../modals/IncomingMeshSosModal';
import EvacuationTakeoverModal from '../modals/EvacuationTakeoverModal';

interface MobileAppShellProps {
  children: React.ReactNode;
}

export default function MobileAppShell({ children }: MobileAppShellProps) {
  const { isOffline } = useFloodApp();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#F4F6FA] text-[#0F172A] flex flex-col items-center justify-start select-none">
      {/* Clean Full-Height Viewport Container */}
      <div className="w-full max-w-xl min-h-screen h-[100dvh] bg-[#F4F6FA] flex flex-col overflow-hidden relative shadow-md border-x border-slate-200/80">
        {/* Offline Notification */}
        {mounted && isOffline && (
          <div className="bg-amber-600 text-white text-xs px-4 py-2 flex items-center justify-between z-50 shadow-sm font-bold">
            <div className="flex items-center gap-1.5">
              <WifiOff className="w-3.5 h-3.5 text-amber-200 animate-pulse shrink-0" />
              <span>2G Offline Mode — Pre-cached Evacuation Active</span>
            </div>
            <span className="text-[10px] bg-black/25 px-2 py-0.5 rounded-full font-mono uppercase tracking-wider">Offline</span>
          </div>
        )}

        {/* Content Shell */}
        <div className="flex-1 flex flex-col overflow-hidden relative bg-[#F4F6FA]">
          {children}
        </div>

        {/* Global P2P Bluetooth Mesh Receiver Modal */}
        <IncomingMeshSosModal />

        {/* Red Full-Screen Evacuation Takeover Modal */}
        <EvacuationTakeoverModal />
      </div>
    </div>
  );
}
