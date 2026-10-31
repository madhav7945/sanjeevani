// CTBF-AI-12: Admin Command Center & Evacuation Takeover Integration Tests
import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateVillageRisk } from '../lib/hydrologyEngine';
import { PUNJAB_VILLAGES } from '../data/villagesAndCamps';
import { FLOOD_REPLAY_2023 } from '../data/floodReplay2023';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const lohianVillage = PUNJAB_VILLAGES.find((v) => v.id === 'lohian_khas')!;

test('Admin & Evacuation: Citizen Acknowledgement Registration and Retrieval', async () => {
  // Test POST /api/offline-sync with acknowledgement
  const postRes = await fetch(`${BASE_URL}/api/offline-sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      villageId: 'lohian_khas',
      villageName: 'Lohian Khas',
      citizenName: 'Gurpreet Singh',
      deviceFingerprint: 'test-device-123',
    }),
  });
  assert.equal(postRes.status, 201);
  const postData = await postRes.json();
  assert.equal(postData.success, true);
  assert.equal(postData.acknowledgement.villageId, 'lohian_khas');

  // Verify retrieved via offline-sync snapshot
  const getRes = await fetch(`${BASE_URL}/api/offline-sync`);
  const getData = await getRes.json();
  assert.equal(getData.success, true);
  assert.ok(Array.isArray(getData.offlineBundle.citizenAcknowledgements));
  assert.ok(
    getData.offlineBundle.citizenAcknowledgements.some(
      (a: { villageId: string }) => a.villageId === 'lohian_khas'
    )
  );
});

test('Admin & Evacuation: Evacuation Broadcast Flag in Telemetry API', async () => {
  const broadcastRes = await fetch(`${BASE_URL}/api/telemetry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bhakraDamDischargeCusecs: 195000,
      phillaurGaugeMeters: 235.2,
      evacuationBroadcast: true,
      headlineEn: 'TEST EVACUATION DIRECTIVE',
      headlinePa: 'ਟੈਸਟ ਨਿਕਾਸੀ ਹੁਕਮ',
    }),
  });
  assert.equal(broadcastRes.status, 201);
  const data = await broadcastRes.json();
  assert.equal(data.success, true);
  assert.equal(data.record.evacuationBroadcast, true);

  // Stand-down / reset to normal
  await fetch(`${BASE_URL}/api/telemetry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bhakraDamDischargeCusecs: 42000,
      phillaurGaugeMeters: 232.4,
      evacuationBroadcast: false,
    }),
  });
});

test('Admin & Evacuation: Citizen Report Approval & Rejection Matrix', async () => {
  const testRoadId = 'road_admin_test_approval';

  // Create test citizen report via HTTP API
  const createRes = await fetch(`${BASE_URL}/api/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      villageId: 'lohian_khas',
      roadId: testRoadId,
      landmark: 'Test Bundh Breach Spur',
      verifiedHazard: false,
      confidenceScore: 92,
      photoUrl: '/samples/breach.jpg',
      notes: 'Camera detected bundh erosion',
      classification: 'CRITICAL_BUNDH_BREACH',
    }),
  });
  assert.equal(createRes.status, 201);
  const createdData = await createRes.json();
  assert.ok(createdData.report.id);

  // Approve report via PATCH /api/reports
  const approveRes = await fetch(`${BASE_URL}/api/reports`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: createdData.report.id,
      action: 'approve',
    }),
  });
  assert.equal(approveRes.status, 200);
  const approveData = await approveRes.json();
  assert.equal(approveData.success, true);
  assert.equal(approveData.report.status, 'APPROVED');

  // Verify road obstacle was added
  const obsRes = await fetch(`${BASE_URL}/api/obstacles`);
  const obsData = await obsRes.json();
  assert.ok(obsData.blockedRoadIds.includes(testRoadId));

  // Dismiss report
  const dismissRes = await fetch(`${BASE_URL}/api/reports`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: createdData.report.id,
      action: 'dismiss',
    }),
  });
  assert.equal(dismissRes.status, 200);

  // Clean up road obstacle
  await fetch(`${BASE_URL}/api/obstacles?roadId=${testRoadId}`, { method: 'DELETE' });
});

test('Admin & Evacuation: NDRF Rescue Boat Dispatch on Mesh SOS Beacon', async () => {
  // Inject test mesh beacon via HTTP API
  const createRes = await fetch(`${BASE_URL}/api/send-mesh-sms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      senderName: 'Sukhdev Singh',
      senderPhone: '+91 98140 99999',
      villageName: 'Mandala Channa',
      coords: [31.1342, 75.2891],
      familyMembers: 6,
      cattleCount: 5,
      medicalNeeds: 'Elderly patient needing dry evacuation',
      hops: 2,
    }),
  });
  assert.equal(createRes.status, 200);
  const beaconData = await createRes.json();
  assert.ok(beaconData.packetHash);

  // Dispatch boat via PATCH /api/send-mesh-sms
  const patchRes = await fetch(`${BASE_URL}/api/send-mesh-sms`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      beaconId: beaconData.packetHash,
    }),
  });
  assert.equal(patchRes.status, 200);
  const patchData = await patchRes.json();
  assert.equal(patchData.success, true);
  assert.equal(patchData.beacon.ndrfDispatched, true);
  assert.ok(patchData.beacon.ndrfDispatchedAt);
});

test('Admin & Evacuation: Hydrology Engine Evacuation Trigger on Dam Surge or Broadcast', () => {
  // Baseline Safe: Below safe carrying capacity (40k) and normal rain (20mm)
  const safeStep = {
    ...FLOOD_REPLAY_2023[0],
    bhakraDamDischargeCusecs: 32000,
    phillaurGaugeMeters: 232.0,
    catchmentRainfall24hMm: 20,
    evacuationBroadcast: false,
  };
  const safeForecast = calculateVillageRisk(lohianVillage, safeStep);
  assert.equal(safeForecast.riskLevel, 'SAFE');
  assert.equal(safeForecast.statusColor, '#10B981');

  // Explicit Evacuation Broadcast by DC overrides condition
  const broadcastStep = {
    ...safeStep,
    evacuationBroadcast: true,
  };
  const broadcastForecast = calculateVillageRisk(lohianVillage, broadcastStep);
  assert.equal(broadcastForecast.riskLevel, 'EVACUATE_24H');
  assert.equal(broadcastForecast.statusColor, '#EF4444');

  // Peak discharge surge >= 195,000 cusecs
  const peakSurgeStep = {
    ...FLOOD_REPLAY_2023[2],
    bhakraDamDischargeCusecs: 195000,
    phillaurGaugeMeters: 235.2,
  };
  const peakForecast = calculateVillageRisk(lohianVillage, peakSurgeStep);
  assert.equal(peakForecast.riskLevel, 'EVACUATE_24H');
});

test('Admin & Evacuation: Pre-recorded Offline Emergency Audio Verification', async () => {
  const fs = await import('node:fs');
  const path = await import('node:path');

  const audioFiles = ['evacuation_pa.mp3', 'evacuation_en.mp3', 'prepare_pa.mp3', 'prepare_en.mp3'];
  for (const fileName of audioFiles) {
    const filePath = path.join(process.cwd(), 'public', 'audio', fileName);
    assert.ok(fs.existsSync(filePath), `Audio file ${fileName} must exist in public/audio/`);
    const stats = fs.statSync(filePath);
    assert.ok(stats.size > 10000, `Audio file ${fileName} must be valid audio (> 10KB), got ${stats.size} bytes`);
  }
});

test('Admin & Evacuation: Network Host Binding for Mobile Hotspot Testing', async () => {
  const fs = await import('node:fs');
  const path = await import('node:path');

  const pkgPath = path.join(process.cwd(), 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  assert.ok(
    pkg.scripts.dev.includes('0.0.0.0'),
    'package.json dev script must bind to 0.0.0.0 so phone on hotspot can connect'
  );
});
