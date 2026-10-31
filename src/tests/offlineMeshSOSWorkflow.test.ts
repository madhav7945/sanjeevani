// CTBF-AI-12: End-to-End Offline Mesh SOS & Peer Relay Verification Test
import test from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const USER_PHONE = '+91 7986405288';

test('Offline Mesh SOS: End-to-End Device-to-Device Peer Transmission', async () => {
  // 1. Citizen on flooded low-ground initiates zero-internet mesh distress broadcast
  const sosPayload = {
    targetPhone: USER_PHONE,
    senderName: 'Gurpreet Singh',
    senderPhone: '+91 98765 43210',
    villageName: 'Lohian Khas',
    coords: [31.1585, 75.2078],
    familyMembers: 5,
    cattleCount: 4,
    medicalNeeds: 'Elderly diabetic parent (requires dry tractor corridor)',
    hops: 3,
  };

  const broadcastRes = await fetch(`${BASE_URL}/api/send-mesh-sms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sosPayload),
  });

  assert.equal(broadcastRes.status, 200);
  const broadcastData = await broadcastRes.json();

  assert.equal(broadcastData.success, true);
  assert.equal(broadcastData.targetPhone, USER_PHONE);
  assert.ok(broadcastData.packetHash.startsWith('MESH-'));
  assert.ok(broadcastData.smsBody.includes(USER_PHONE) || broadcastData.smsBody.includes('Gurpreet Singh'));
  assert.ok(broadcastData.smsBody.includes('[SANJEEVANI OFFLINE MESH SOS]'));
  assert.equal(broadcastData.hops, 3);

  const activePacketHash = broadcastData.packetHash;

  // 2. Peer node / Rescuer device on the offline mesh checks for incoming broadcasts
  const syncRes = await fetch(`${BASE_URL}/api/offline-sync`);
  assert.equal(syncRes.status, 200);
  const syncData = await syncRes.json();

  assert.equal(syncData.success, true);
  const latestBeacon = syncData.offlineBundle.latestMeshBeacon;
  assert.ok(latestBeacon, 'Offline snapshot must include latestMeshBeacon');
  assert.equal(latestBeacon.packetHash, activePacketHash);
  assert.equal(latestBeacon.villageName, 'Lohian Khas');
  assert.equal(latestBeacon.familyMembers, 5);
  assert.equal(latestBeacon.cattleCount, 4);

  // 3. Admin Command Center discovers beacon on radar and dispatches NDRF Rescue Boat
  const beaconsListRes = await fetch(`${BASE_URL}/api/send-mesh-sms`);
  const beaconsListData = await beaconsListRes.json();
  assert.equal(beaconsListData.success, true);
  assert.ok(beaconsListData.beacons.length > 0);

  const targetBeacon = beaconsListData.beacons.find((b: { packetHash: string }) => b.packetHash === activePacketHash);
  assert.ok(targetBeacon, 'Dispatched beacon must appear on Admin Mesh Radar');

  // Admin dispatches boat
  const dispatchRes = await fetch(`${BASE_URL}/api/send-mesh-sms`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ beaconId: targetBeacon.id }),
  });

  assert.equal(dispatchRes.status, 200);
  const dispatchData = await dispatchRes.json();
  assert.equal(dispatchData.success, true);
  assert.equal(dispatchData.beacon.ndrfDispatched, true);
  assert.ok(dispatchData.beacon.ndrfDispatchedAt);
});
