// Generated with Antigravity / Gemini, reviewed and modified by the team
// CTBF-AI-12: Root Layout with Times New Roman / Classical Serif Typography

import type { Metadata, Viewport } from 'next';
import './globals.css';
import { FloodAppProvider } from '../context/FloodAppContext';
import ServiceWorkerRegister from '../components/shell/ServiceWorkerRegister';

export const metadata: Metadata = {
  title: 'Sanjeevani (ਸੰਜੀਵਨੀ) — Flood Early-Warning & Evacuation Advisor',
  description:
    'Autonomous flood early-warning, dynamic safe evacuation routing, and crowdsourced emergency response platform for Punjab river basins. CTBF-AI-12.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#059669',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-[#F4F6FA]" suppressHydrationWarning>
      <body className="h-full overflow-x-hidden antialiased bg-[#F4F6FA] text-[#0F172A]" suppressHydrationWarning>
        <ServiceWorkerRegister />
        <FloodAppProvider>{children}</FloodAppProvider>
      </body>
    </html>
  );
}
