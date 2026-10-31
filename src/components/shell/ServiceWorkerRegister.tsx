'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[Sanjeevani SW] Registered with scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('[Sanjeevani SW] Registration failed:', err);
        });
    } else if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // In development, clear any stale service workers to prevent HTML cache hydration mismatches
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const reg of registrations) {
          reg.unregister();
        }
      });
    }
  }, []);

  return null;
}
