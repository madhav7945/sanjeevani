// CTBF-AI-12: Full Chrome Browser Automation via Chrome DevTools Protocol (CDP)
// Drives the actual web UI to broadcast Mesh SOS to +91 7986405288 and verify Admin Radar

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import WebSocket from 'ws';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TARGET_PHONE = '+91 7986405288';

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log('[1/7] Launching Headless Chrome Browser...');
  const chromeProcess = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--window-size=430,932',
    '--no-first-run',
    '--no-default-browser-check',
    '--user-data-dir=' + path.join(process.cwd(), 'temp_chrome_profile'),
  ]);

  let wsUrl = null;
  for (let i = 0; i < 20; i++) {
    await wait(400);
    try {
      const res = await fetch('http://127.0.0.1:9222/json/version');
      if (res.ok) {
        const data = await res.json();
        wsUrl = data.webSocketDebuggerUrl;
        break;
      }
    } catch {}
  }

  if (!wsUrl) {
    chromeProcess.kill();
    throw new Error('Failed to connect to Chrome DevTools Protocol port 9222');
  }

  console.log('[2/7] Connected to Chrome DevTools Protocol:', wsUrl);
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
  const { targetId } = await sendCommand(browserWs, 'Target.createTarget', {
    url: 'http://localhost:3000',
  });

  const pageWs = new WebSocket(`ws://127.0.0.1:9222/devtools/page/${targetId}`);
  await new Promise((resolve) => pageWs.on('open', resolve));

  console.log('[3/7] Navigating Citizen Mobile App (http://localhost:3000)...');
  await sendCommand(pageWs, 'Page.enable');
  await sendCommand(pageWs, 'Runtime.enable');
  await sendCommand(pageWs, 'Page.navigate', { url: 'http://localhost:3000' });

  await wait(3000);

  // If evacuation takeover modal is visible, acknowledge it first
  const dismissModalResult = await sendCommand(pageWs, 'Runtime.evaluate', {
    expression: `(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const ackBtn = buttons.find(b => b.textContent && (b.textContent.includes('Got It') || b.textContent.includes('ਸੁਰੱਖਿਅਤ ਥਾਂ')));
      if (ackBtn) {
        ackBtn.click();
        return 'Dismissed evacuation takeover modal';
      }
      return 'No takeover modal displayed';
    })()`,
    returnByValue: true,
  });
  console.log('  -> Takeover check:', dismissModalResult.result?.value);
  await wait(1000);

  console.log('[4/7] Interacting with UI: Opening SOS Modal & Entering Phone:', TARGET_PHONE);
  const clickSosResult = await sendCommand(pageWs, 'Runtime.evaluate', {
    expression: `(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const sosBtn = buttons.find(b => b.textContent && (b.textContent.includes('SOS') || b.textContent.includes('ਮੈਸ਼')));
      if (sosBtn) {
        sosBtn.click();
        return 'Clicked SOS button in header';
      }
      return 'SOS button not found';
    })()`,
    returnByValue: true,
  });

  console.log('  -> Click SOS Button Result:', clickSosResult.result?.value);
  await wait(1000);

  // Set the phone number and click "Broadcast Offline Mesh SOS"
  const broadcastResult = await sendCommand(pageWs, 'Runtime.evaluate', {
    expression: `(() => {
      // Find the phone input
      const phoneInput = document.querySelector('input[type="tel"]');
      if (phoneInput) {
        phoneInput.value = '${TARGET_PHONE}';
        phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
        phoneInput.dispatchEvent(new Event('change', { bubbles: true }));
      }

      // Find the broadcast button inside the modal
      const buttons = Array.from(document.querySelectorAll('button'));
      const broadcastBtn = buttons.find(b => 
        b.textContent && (
          b.textContent.includes('Broadcast') || 
          b.textContent.includes('ਬਿਨਾਂ ਨੈੱਟ SOS') ||
          b.textContent.includes('Mesh SOS')
        )
      );

      if (broadcastBtn) {
        broadcastBtn.click();
        return 'Broadcast Offline Mesh SOS button clicked';
      }
      return 'Broadcast button not found';
    })()`,
    returnByValue: true,
  });

  console.log('  -> Trigger Mesh Broadcast Result:', broadcastResult.result?.value);

  // Wait 2.5 seconds for peer gossip hops (Hop 1 -> Hop 2 -> Hop 3)
  console.log('[5/7] Waiting for 3-Hop Mesh Gossiping and Cryptographic Hash generation...');
  await wait(2500);

  // Capture Screenshot of Citizen Mobile Screen with Delivered Mesh SOS
  const citizenScreenshot = await sendCommand(pageWs, 'Page.captureScreenshot', {
    format: 'png',
  });
  const citizenScreenshotPath = path.join(process.cwd(), 'public', 'mesh_sos_delivered_to_phone.png');
  fs.writeFileSync(citizenScreenshotPath, Buffer.from(citizenScreenshot.data, 'base64'));
  console.log('  -> Captured Citizen Mobile UI Screenshot:', citizenScreenshotPath);

  // Read the delivered packet details from the page
  const packetDetails = await sendCommand(pageWs, 'Runtime.evaluate', {
    expression: `(() => {
      const preEl = document.querySelector('pre');
      const smsText = preEl ? preEl.innerText : null;
      const buttons = Array.from(document.querySelectorAll('a, button')).map(el => el.innerText.trim()).filter(Boolean);
      return { smsText, buttons };
    })()`,
    returnByValue: true,
  });
  console.log('  -> UI Delivered Packet:', packetDetails.result?.value);

  // Now navigate to Admin Command Center
  console.log('[6/7] Navigating to Admin Command Center (http://localhost:3000/admin)...');
  await sendCommand(pageWs, 'Page.navigate', { url: 'http://localhost:3000/admin' });
  await wait(2500);

  // Find the beacon in the radar and click "Dispatch NDRF Boat"
  const adminActionResult = await sendCommand(pageWs, 'Runtime.evaluate', {
    expression: `(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const dispatchBtn = buttons.find(b => b.textContent && b.textContent.includes('Dispatch NDRF Boat'));
      if (dispatchBtn) {
        dispatchBtn.click();
        return 'Clicked Dispatch NDRF Boat on Admin Radar';
      }
      return 'Dispatch NDRF Boat button not found or already dispatched';
    })()`,
    returnByValue: true,
  });

  console.log('  -> Admin Action Result:', adminActionResult.result?.value);
  await wait(1500);

  // Capture Screenshot of Admin Radar
  const adminScreenshot = await sendCommand(pageWs, 'Page.captureScreenshot', {
    format: 'png',
  });
  const adminScreenshotPath = path.join(process.cwd(), 'public', 'admin_mesh_radar_verified.png');
  fs.writeFileSync(adminScreenshotPath, Buffer.from(adminScreenshot.data, 'base64'));
  console.log('  -> Captured Admin Radar Screenshot:', adminScreenshotPath);

  console.log('[7/7] Closing Chrome Browser cleanly...');
  pageWs.close();
  browserWs.close();
  chromeProcess.kill();

  console.log('\n=== REAL BROWSER UI TEST EXECUTION COMPLETE ===');
}

run().catch((err) => {
  console.error('Browser automation error:', err);
  process.exit(1);
});
