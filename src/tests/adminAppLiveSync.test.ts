// CTBF-AI-12: Full Admin & Citizen App End-to-End Live Synchronization Test Suite
// Verifies complete bilateral sync loops between Government Command Panel (/admin) and Citizen Mobile App (/)

import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSafeEvacuationRoute } from '../lib/dijkstraRouter';
import { calculateVillageRisk } from '../lib/hydrologyEngine';
import { PUNJAB_VILLAGES } from '../data/villagesAndCamps';
import { FLOOD_REPLAY_2023 } from '../data/floodReplay2023';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

test('Live Sync Loop 1: Admin Telemetry & Evacuation Broadcast -> Citizen App Risk Forecast & Siren', async () => {
  // 1. Admin updates telemetry slider to 220,000 cusecs and triggers mandatory evacuation order
  const adminPostRes = await fetch(`${BASE_URL}/api/telemetry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bhakraDamDischargeCusecs: 220000,
      phillaurGaugeMeters: 235.8,
      catchmentRainfall24hMm: 240,
      evacuationBroadcast: true,
      headlineEn: 'EMERGENCY: Peak Flood Inflow — Evacuate to High Ground',
      headlinePa: 'ਖ਼ਤਰਾ: ਪਾਣੀ ਦਾ ਵੱਡਾ ਵਹਾਅ — ਉੱਚੇ ਰਾਹਤ ਕੈਂਪਾਂ ਵੱਲ ਨਿਕਲੋ',
    }),
  });
  assert.equal(adminPostRes.status, 201);
  const adminPostData = await adminPostRes.json();
  assert.equal(adminPostData.success, true);

  // 2. Citizen phone polls /api/offline-sync (simulating 2-second background poll)
  const citizenSyncRes = await fetch(`${BASE_URL}/api/offline-sync`);
  assert.equal(citizenSyncRes.status, 200);
  const citizenSyncData = await citizenSyncRes.json();
  assert.equal(citizenSyncData.success, true);

  // 3. Verify citizen received the exact government broadcast
  const citizenTelemetry = citizenSyncData.offlineBundle.telemetry;
  assert.equal(citizenTelemetry.bhakraDamDischargeCusecs, 220000);
  assert.equal(citizenTelemetry.evacuationBroadcast, true);
  assert.equal(citizenTelemetry.headlineEn, 'EMERGENCY: Peak Flood Inflow — Evacuate to High Ground');

  // 4. Verify citizen Hydrology Engine evaluates Mandatory Evacuation (triggering phone takeover & siren)
  const lohianVillage = PUNJAB_VILLAGES[0];
  const simulationStep = {
    ...FLOOD_REPLAY_2023[1],
    bhakraDamDischargeCusecs: citizenTelemetry.bhakraDamDischargeCusecs,
    evacuationBroadcast: citizenTelemetry.evacuationBroadcast,
  };
  const forecast = calculateVillageRisk(lohianVillage, simulationStep);
  assert.equal(forecast.riskLevel, 'EVACUATE_24H', 'Citizen app must trigger EVACUATE_24H state when government broadcasts');
  assert.ok(forecast.statusLabelEn.includes('Evacuate') || forecast.riskScore >= 75);
});

test('Live Sync Loop 2: Admin Deploys Shelter -> Citizen Map & Evacuation Routing Targets It', async () => {
  const dynamicShelterName = 'Punjab SDMA Model Relief Camp, High Ridge';
  const dynamicShelterCoords: [number, number] = [31.128, 75.259];

  // 1. Admin deploys a new shelter from the admin map
  const deployRes = await fetch(`${BASE_URL}/api/camps`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: dynamicShelterName,
      punjabiName: 'ਪੰਜਾਬ ਐਸ.ਡੀ.ਐਮ.ਏ. ਮਾਡਲ ਰਾਹਤ ਕੈਂਪ',
      type: 'school',
      coords: dynamicShelterCoords,
      elevation: 228,
      capacity: 750,
      availableBeds: 600,
      contactNumber: '+91 181 2223399',
      hasMedical: true,
      hasLangar: true,
    }),
  });
  assert.equal(deployRes.status, 201);
  const deployData = await deployRes.json();
  assert.equal(deployData.success, true);
  const newCampId = deployData.camp.id;

  // 2. Citizen app syncs state from backend
  const citizenSyncRes = await fetch(`${BASE_URL}/api/offline-sync`);
  const citizenSyncData = await citizenSyncRes.json();
  const citizenCamps = citizenSyncData.offlineBundle.camps;

  // Verify the new shelter is present in citizen app's bundle
  const foundCamp = citizenCamps.find((c: { id: string }) => c.id === newCampId);
  assert.ok(foundCamp, 'Newly deployed shelter must be present in citizen app camps list');
  assert.equal(foundCamp.availableBeds, 600);

  // 3. Citizen selects this new shelter as target destination for evacuation route
  const lohianVillage = PUNJAB_VILLAGES[0];
  const route = calculateSafeEvacuationRoute(lohianVillage, [], citizenCamps, newCampId);
  assert.equal(route.camp.id, newCampId, 'Dijkstra route destination must match admin-deployed shelter');
  assert.ok(route.fullCoordinates.length > 2, 'Route coordinates must be generated to the new shelter');
  assert.ok(route.totalDistanceKm > 0);

  // 4. Admin decommissions the shelter
  const deleteRes = await fetch(`${BASE_URL}/api/camps?id=${encodeURIComponent(newCampId)}`, {
    method: 'DELETE',
  });
  assert.equal(deleteRes.status, 200);

  // 5. Citizen app syncs again; verify the deleted shelter is gone and router auto-reroutes
  const postDeleteSync = await fetch(`${BASE_URL}/api/offline-sync`);
  const postDeleteData = await postDeleteSync.json();
  const remainingCamps = postDeleteData.offlineBundle.camps;
  const stillExists = remainingCamps.some((c: { id: string }) => c.id === newCampId);
  assert.equal(stillExists, false, 'Decommissioned shelter must vanish from citizen app');

  // Verify router gracefully targets the next nearest high-ground camp
  const fallbackRoute = calculateSafeEvacuationRoute(lohianVillage, [], remainingCamps, newCampId);
  assert.notEqual(fallbackRoute.camp.id, newCampId, 'Router must gracefully re-target alternative camp');
  assert.ok(fallbackRoute.totalDistanceKm > 0);
});

test('Live Sync Loop 3: Admin Blocks Submerged Road -> Citizen Dijkstra Auto-Reroutes', async () => {
  const targetRoad = 'road_lohian_makhu_low';
  const lohianVillage = PUNJAB_VILLAGES[0];

  // 1. Initial route with all roads clear
  const baselineRoute = calculateSafeEvacuationRoute(lohianVillage, []);
  const usesLowRoadInitially = baselineRoute.pathEdges.some((e) => e.id === targetRoad);
  assert.ok(usesLowRoadInitially || baselineRoute.totalDistanceKm > 0);

  // 2. Admin blocks the low road via obstacles API
  const blockRes = await fetch(`${BASE_URL}/api/obstacles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      roadId: targetRoad,
      roadName: 'Lohian–Makhu Low Link Road',
      reason: 'Breach overflow detected by field survey',
      severity: 'CRITICAL',
    }),
  });
  assert.equal(blockRes.status, 201);

  // 3. Citizen app polls backend and receives active blocked roads list
  const citizenSyncRes = await fetch(`${BASE_URL}/api/offline-sync`);
  const citizenSyncData = await citizenSyncRes.json();
  const activeBlockedRoads = citizenSyncData.offlineBundle.activeBlockedRoadIds;
  assert.ok(activeBlockedRoads.includes(targetRoad), 'Blocked road must be present in citizen blocked list');

  // 4. Citizen Dijkstra pathfinder calculates safe detour avoiding the blocked road
  const reroutedResult = calculateSafeEvacuationRoute(lohianVillage, activeBlockedRoads);
  const stillUsesBlockedRoad = reroutedResult.pathEdges.some((e) => e.id === targetRoad);
  assert.equal(stillUsesBlockedRoad, false, 'Rerouted evacuation path must completely avoid blocked road');
  assert.equal(reroutedResult.isReroutedDueToBreach, true);

  // Cleanup: Reopen road
  await fetch(`${BASE_URL}/api/obstacles?roadId=${targetRoad}`, { method: 'DELETE' });
});

test('Live Sync Loop 4: Citizen Sends P2P Mesh SOS -> Admin Radar Dispatches NDRF Boat', async () => {
  const citizenPhone = '+91 98888 12345';
  const citizenName = 'Harpreet Kaur';

  // 1. Citizen app broadcasts distress beacon via BLE mesh gateway
  const meshSendRes = await fetch(`${BASE_URL}/api/send-mesh-sms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      senderName: citizenName,
      senderPhone: citizenPhone,
      villageName: 'Gidderpindi',
      coords: [31.125, 75.201],
      familyMembers: 6,
      cattleCount: 5,
      medicalNeeds: 'Elderly patient needing dialysis evacuation',
      hops: 2,
    }),
  });
  assert.equal(meshSendRes.status, 200);
  const meshSendData = await meshSendRes.json();
  assert.equal(meshSendData.success, true);
  const packetHash = meshSendData.packetHash;
  assert.ok(packetHash);

  // 2. Admin dashboard polls /api/offline-sync and detects the distress beacon
  const adminSyncRes = await fetch(`${BASE_URL}/api/offline-sync`);
  const adminSyncData = await adminSyncRes.json();
  const latestBeacon = adminSyncData.offlineBundle.latestMeshBeacon;
  assert.ok(latestBeacon, 'Admin must receive latest mesh beacon');
  assert.equal(latestBeacon.senderPhone, citizenPhone);
  assert.equal(latestBeacon.familyMembers, 6);
  assert.equal(latestBeacon.cattleCount, 5);

  // 3. Admin acknowledges SOS and dispatches NDRF rescue boat
  const boatDispatchRes = await fetch(`${BASE_URL}/api/send-mesh-sms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      senderName: citizenName,
      senderPhone: citizenPhone,
      villageName: 'Gidderpindi',
      coords: [31.125, 75.201],
      familyMembers: 6,
      cattleCount: 5,
      hops: 1,
      gatewayNode: 'DEOC_ADMIN_NDRF_BOAT_01_DISPATCHED',
    }),
  });
  assert.equal(boatDispatchRes.status, 200);
  const boatDispatchData = await boatDispatchRes.json();
  assert.equal(boatDispatchData.success, true);
  assert.ok(boatDispatchData.packetHash);
});

test('Live Sync Loop 5: Citizen Evacuation Siren Acknowledgement -> Admin SITREP Feed', async () => {
  const citizenName = 'Tarlochan Singh';
  const villageName = 'Shahkot Bet';

  // 1. Citizen taps "Acknowledged / Got It" on their phone during siren takeover
  const ackRes = await fetch(`${BASE_URL}/api/offline-sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      villageId: 'shahkot_bet',
      villageName,
      citizenName,
      deviceFingerprint: 'dev_fingerprint_test_9921',
    }),
  });
  assert.equal(ackRes.status, 201);
  const ackData = await ackRes.json();
  assert.equal(ackData.success, true);
  assert.equal(ackData.acknowledgement.citizenName, citizenName);

  // 2. Admin fetches system state snapshot
  const adminSnapshotRes = await fetch(`${BASE_URL}/api/offline-sync`);
  const adminSnapshotData = await adminSnapshotRes.json();
  const acknowledgements = adminSnapshotData.offlineBundle.citizenAcknowledgements;
  
  const foundAck = acknowledgements.find(
    (a: { citizenName: string; villageName: string }) =>
      a.citizenName === citizenName && a.villageName === villageName
  );
  assert.ok(foundAck, 'Admin SITREP feed must contain the registered citizen acknowledgement');
});
