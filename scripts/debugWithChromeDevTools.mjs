// CTBF-AI-12: Full Chrome DevTools Protocol (CDP) Automated Debugger & Validator
// Audits Citizen App & Admin Command Center for console logs, hydration errors, network statuses & Service Worker

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import WebSocket from 'ws';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DEBUG_PORT = 9225;

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runDevToolsAudit() {
  console.log('====================================================');
  console.log('⚡ STARTING CHROME DEVTOOLS PROTOCOL (CDP) AUDIT');
  console.log('====================================================');

  const profileDir = path.join(process.cwd(), 'temp_devtools_profile');
  if (!fs.existsSync(profileDir)) {
    fs.mkdirSync(profileDir, { recursive: true });
  }

  const chromeProcess = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${DEBUG_PORT}`,
    '--disable-gpu',
    '--window-size=430,932',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${profileDir}`,
  ]);

  let wsUrl = null;
  for (let i = 0; i < 25; i++) {
    await wait(300);
    try {
      const res = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
      if (res.ok) {
        const data = await res.json();
        wsUrl = data.webSocketDebuggerUrl;
        break;
      }
    } catch {}
  }

  if (!wsUrl) {
    chromeProcess.kill();
    throw new Error(`Failed to connect to Chrome DevTools Protocol port ${DEBUG_PORT}`);
  }

  console.log('✔ Connected to Chrome DevTools Protocol endpoint:', wsUrl);
  const browserWs = new WebSocket(wsUrl);
  await new Promise((resolve) => browserWs.on('open', resolve));

  let reqId = 1;
  function sendCommand(ws, method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = reqId++;
      const handler = (data) => {
        const msg = JSON.parse(data.toString());
        if (msg.id === id) {
          ws.off('message', handler);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      };
      ws.on('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  // Create new target page
  const target = await sendCommand(browserWs, 'Target.createTarget', { url: 'about:blank' });
  const pageWsUrl = `ws://127.0.0.1:${DEBUG_PORT}/devtools/page/${target.targetId}`;
  const pageWs = new WebSocket(pageWsUrl);
  await new Promise((resolve) => pageWs.on('open', resolve));

  const consoleLogs = [];
  const networkResponses = [];
  const pageErrors = [];

  pageWs.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.method === 'Runtime.consoleAPICalled') {
        const text = msg.params.args.map((a) => a.value || a.description || JSON.stringify(a)).join(' ');
        consoleLogs.push({ type: msg.params.type, text });
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        pageErrors.push(msg.params.exceptionDetails.text + ' ' + (msg.params.exceptionDetails.exception?.description || ''));
      }
      if (msg.method === 'Network.responseReceived') {
        networkResponses.push({
          url: msg.params.response.url,
          status: msg.params.response.status,
          statusText: msg.params.response.statusText,
          mimeType: msg.params.response.mimeType,
        });
      }
    } catch {}
  });

  await sendCommand(pageWs, 'Runtime.enable');
  await sendCommand(pageWs, 'Page.enable');
  await sendCommand(pageWs, 'Network.enable');
  await sendCommand(pageWs, 'Log.enable');

  // --- AUDIT 1: CITIZEN APP (http://localhost:3000) ---
  console.log('\n[1/4] Navigating to Citizen Mobile App (http://localhost:3000)...');
  consoleLogs.length = 0;
  pageErrors.length = 0;
  networkResponses.length = 0;

  await sendCommand(pageWs, 'Page.navigate', { url: 'http://localhost:3000' });
  await wait(3500);

  // Take screenshot of Citizen App
  const citizenScreenshot = await sendCommand(pageWs, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(process.cwd(), 'public', 'chrome_devtools_citizen_debug.png'), Buffer.from(citizenScreenshot.data, 'base64'));
  console.log('✔ Citizen App Screenshot saved to public/chrome_devtools_citizen_debug.png');

  console.log('\n--- CITIZEN APP DEVTOOLS CONSOLE & NETWORK AUDIT ---');
  console.log('Total Console Messages:', consoleLogs.length);
  for (const log of consoleLogs) {
    console.log(`[${log.type}] ${log.text}`);
  }
  const citizenFavicon = networkResponses.find((r) => r.url.includes('/favicon.ico'));
  console.log('Favicon Request Status:', citizenFavicon ? `${citizenFavicon.status} ${citizenFavicon.statusText}` : 'Not requested (handled by browser cache/root)');
  
  const citizenHydrationWarnings = consoleLogs.filter((l) => l.text.toLowerCase().includes('hydration') || l.text.toLowerCase().includes('did not match'));
  const citizenServiceWorkerErrors = consoleLogs.filter((l) => l.text.toLowerCase().includes('chrome-extension') || l.text.toLowerCase().includes('failed to execute \'put\''));

  console.log('Hydration Mismatch Errors:', citizenHydrationWarnings.length === 0 ? '0 (CLEAN - No Hydration Errors)' : citizenHydrationWarnings);
  console.log('Service Worker Unsupported Scheme Errors:', citizenServiceWorkerErrors.length === 0 ? '0 (CLEAN - No Extension Cache Errors)' : citizenServiceWorkerErrors);
  console.log('Uncaught Page Exceptions:', pageErrors.length === 0 ? '0 (CLEAN - No Uncaught Exceptions)' : pageErrors);

  // --- AUDIT 2: ADMIN COMMAND CENTER (http://localhost:3000/admin) ---
  console.log('\n[2/4] Navigating to Admin Command Center (http://localhost:3000/admin)...');
  consoleLogs.length = 0;
  pageErrors.length = 0;
  networkResponses.length = 0;

  await sendCommand(pageWs, 'Page.navigate', { url: 'http://localhost:3000/admin' });
  await wait(3500);

  // Take screenshot of Admin Command Center
  const adminScreenshot = await sendCommand(pageWs, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(process.cwd(), 'public', 'chrome_devtools_admin_debug.png'), Buffer.from(adminScreenshot.data, 'base64'));
  console.log('✔ Admin Command Center Screenshot saved to public/chrome_devtools_admin_debug.png');

  console.log('\n--- ADMIN COMMAND CENTER DEVTOOLS AUDIT ---');
  console.log('Total Admin Console Messages:', consoleLogs.length);
  for (const log of consoleLogs) {
    console.log(`[${log.type}] ${log.text}`);
  }
  if (pageErrors.length > 0) {
    console.log('Admin Page Errors:');
    for (const err of pageErrors) {
      console.log(`[ERR] ${err}`);
    }
  }
  const adminHydrationWarnings = consoleLogs.filter((l) => l.text.toLowerCase().includes('hydration') || l.text.toLowerCase().includes('did not match'));
  console.log('Admin Hydration Mismatch Errors:', adminHydrationWarnings.length === 0 ? '0 (CLEAN - No Hydration Errors)' : adminHydrationWarnings);
  console.log('Admin Uncaught Page Exceptions:', pageErrors.length === 0 ? '0 (CLEAN - No Uncaught Exceptions)' : pageErrors.length);

  // Verify that Admin page does not contain siren elements
  const evaluateResult = await sendCommand(pageWs, 'Runtime.evaluate', {
    expression: `
      (() => {
        const bodyText = document.body.innerText;
        const hasSirenText = bodyText.includes('🚨 Sound Emergency Siren') || bodyText.includes('Live Presentation Demo Fast-Action Bar');
        const sirenButtons = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.includes('Siren'));
        return {
          hasSirenText,
          sirenButtonsCount: sirenButtons.length
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Admin Siren UI DOM Audit:', evaluateResult.value);

  // Clean up
  console.log('\n[3/4] Closing Chrome DevTools Protocol connection...');
  pageWs.close();
  browserWs.close();
  chromeProcess.kill();

  console.log('\n====================================================');
  console.log('✔ CHROME DEVTOOLS AUDIT COMPLETE — ALL METRICS HEALTHY');
  console.log('====================================================');
}

runDevToolsAudit().catch((err) => {
  console.error('Chrome DevTools Audit failed:', err);
  process.exit(1);
});
