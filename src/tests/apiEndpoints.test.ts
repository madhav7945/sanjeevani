// CTBF-AI-12: Full API Endpoints Integration Test Suite
import test from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

test('API Integration: GET /api/health', async () => {
  const res = await fetch(`${BASE_URL}/api/health`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, 'healthy');
  assert.ok(data.database.villagesCount >= 6);
  assert.ok(data.database.reliefCampsCount >= 6);
});

test('API Integration: GET & POST /api/telemetry', async () => {
  // GET
  const getRes = await fetch(`${BASE_URL}/api/telemetry?limit=5`);
  assert.equal(getRes.status, 200);
  const getData = await getRes.json();
  assert.equal(getData.success, true);
  assert.ok(getData.history.length > 0);

  // POST
  const postRes = await fetch(`${BASE_URL}/api/telemetry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bhakraDamDischargeCusecs: 145000,
      phillaurGaugeMeters: 234.8,
      catchmentRainfall24hMm: 210,
      headlineEn: 'Continuous test gauge observation',
    }),
  });
  assert.equal(postRes.status, 201);
  const postData = await postRes.json();
  assert.equal(postData.success, true);
  assert.equal(postData.record.bhakraDamDischargeCusecs, 145000);
});

test('API Integration: GET /api/villages', async () => {
  const res = await fetch(`${BASE_URL}/api/villages`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(data.villages.length >= 6);
  assert.ok(data.villages[0].forecast, 'Must contain calculated risk forecast');
});

test('API Integration: GET & PATCH /api/camps', async () => {
  const getRes = await fetch(`${BASE_URL}/api/camps`);
  assert.equal(getRes.status, 200);
  const getData = await getRes.json();
  assert.equal(getData.success, true);
  assert.ok(getData.camps.length >= 6);

  const targetCamp = getData.camps[0];
  const initialBeds = targetCamp.availableBeds;

  const patchRes = await fetch(`${BASE_URL}/api/camps`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: targetCamp.id,
      bedDelta: -5,
    }),
  });
  assert.equal(patchRes.status, 200);
  const patchData = await patchRes.json();
  assert.equal(patchData.camp.availableBeds, initialBeds - 5);

  // Restore
  await fetch(`${BASE_URL}/api/camps`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: targetCamp.id, bedDelta: 5 }),
  });
});

test('API Integration: POST & DELETE /api/camps (Deploy & Decommission Shelter)', async () => {
  // 1. Deploy new relief shelter
  const deployRes = await fetch(`${BASE_URL}/api/camps`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Automated Test High-Ground Shelter',
      punjabiName: 'ਆਟੋਮੇਟਿਡ ਟੈਸਟ ਰਾਹਤ ਕੈਂਪ',
      type: 'school',
      coords: [31.1255, 75.2588],
      elevation: 226,
      capacity: 650,
      availableBeds: 500,
      contactNumber: '+91 181 9998877',
      hasMedical: true,
      hasLangar: true,
    }),
  });
  assert.equal(deployRes.status, 201);
  const deployData = await deployRes.json();
  assert.equal(deployData.success, true);
  assert.ok(deployData.camp.id);
  assert.equal(deployData.camp.name, 'Automated Test High-Ground Shelter');
  const deployedCampId = deployData.camp.id;

  // 2. Verify camp is indexed in GET /api/camps
  const getCampsRes = await fetch(`${BASE_URL}/api/camps`);
  const getCampsData = await getCampsRes.json();
  const existsInList = getCampsData.camps.some((c: { id: string }) => c.id === deployedCampId);
  assert.ok(existsInList, 'Deployed camp must appear in GET /api/camps');

  // 3. Verify camp is pushed to offline bundle
  const syncRes = await fetch(`${BASE_URL}/api/offline-sync`);
  const syncData = await syncRes.json();
  const existsInBundle = syncData.offlineBundle.camps.some((c: { id: string }) => c.id === deployedCampId);
  assert.ok(existsInBundle, 'Deployed camp must sync to citizen offline bundle');

  // 4. Decommission / Delete camp
  const deleteRes = await fetch(`${BASE_URL}/api/camps?id=${encodeURIComponent(deployedCampId)}`, {
    method: 'DELETE',
  });
  assert.equal(deleteRes.status, 200);
  const deleteData = await deleteRes.json();
  assert.equal(deleteData.success, true);
  assert.equal(deleteData.deletedId, deployedCampId);

  // 5. Verify camp is removed from active list
  const postDeleteRes = await fetch(`${BASE_URL}/api/camps`);
  const postDeleteData = await postDeleteRes.json();
  const stillExists = postDeleteData.camps.some((c: { id: string }) => c.id === deployedCampId);
  assert.equal(stillExists, false, 'Decommissioned camp must no longer exist in network');
});

test('API Integration: GET, POST & DELETE /api/obstacles', async () => {
  const testRoad = 'road_integration_test_channa';

  // POST obstacle
  const postRes = await fetch(`${BASE_URL}/api/obstacles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      roadId: testRoad,
      roadName: 'Integration Test Causeway',
      reason: 'Automated test roadblock',
      severity: 'WARNING',
    }),
  });
  assert.equal(postRes.status, 201);
  const postData = await postRes.json();
  assert.ok(postData.activeBlockedRoadIds.includes(testRoad));

  // DELETE obstacle
  const delRes = await fetch(`${BASE_URL}/api/obstacles?roadId=${testRoad}`, {
    method: 'DELETE',
  });
  assert.equal(delRes.status, 200);
  const delData = await delRes.json();
  assert.ok(!delData.activeBlockedRoadIds.includes(testRoad));
});

test('API Integration: GET /api/offline-sync', async () => {
  const res = await fetch(`${BASE_URL}/api/offline-sync`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(data.offlineBundle.gisNetwork.nodes);
  assert.ok(data.offlineBundle.gisNetwork.edges);
  assert.ok(data.offlineBundle.camps.length >= 6);
  assert.ok(data.offlineBundle.villages.length >= 6);
});

test('API Integration: POST /api/verify-breach demo scenarios', async () => {
  // Test fake spam photo
  const fakeRes = await fetch(`${BASE_URL}/api/verify-breach`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sampleType: 'fake_spam' }),
  });
  assert.equal(fakeRes.status, 200);
  const fakeData = await fakeRes.json();
  assert.equal(fakeData.verifiedHazard, false);
  assert.equal(fakeData.classification, 'NON_HAZARD_SPAM');

  // Test real breach photo
  const realRes = await fetch(`${BASE_URL}/api/verify-breach`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sampleType: 'real_breach',
      villageId: 'lohian_khas',
      roadId: 'road_mandala_channa_bundh',
    }),
  });
  assert.equal(realRes.status, 200);
  const realData = await realRes.json();
  assert.equal(realData.verifiedHazard, true);
  assert.equal(realData.classification, 'CRITICAL_BUNDH_BREACH');
  assert.equal(realData.blockedRoadId, 'road_mandala_channa_bundh');
});

test('API Integration: GET & POST /api/reports', async () => {
  // GET all reports
  const getRes = await fetch(`${BASE_URL}/api/reports`);
  assert.equal(getRes.status, 200);
  const getData = await getRes.json();
  assert.equal(getData.success, true);
  assert.ok(getData.reports.length > 0);

  // POST new citizen report
  const testRoad = 'road_test_citizen_report_edge';
  const postRes = await fetch(`${BASE_URL}/api/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      villageId: 'lohian_khas',
      roadId: testRoad,
      landmark: 'Test Citizen Observation Point',
      verifiedHazard: true,
      confidenceScore: 91,
      notes: 'Water depth reaching 0.6m over pavement',
    }),
  });
  assert.equal(postRes.status, 201);
  const postData = await postRes.json();
  assert.equal(postData.success, true);
  assert.equal(postData.report.roadId, testRoad);

  // Clean up obstacle created by report
  await fetch(`${BASE_URL}/api/obstacles?roadId=${testRoad}`, { method: 'DELETE' });
});

test('API Integration: Validation Error Handling (400 & 404 responses)', async () => {
  // Missing roadId on POST /api/obstacles
  const badObsRes = await fetch(`${BASE_URL}/api/obstacles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason: 'No road provided' }),
  });
  assert.equal(badObsRes.status, 400);

  // Missing required telemetry fields on POST /api/telemetry
  const badTelRes = await fetch(`${BASE_URL}/api/telemetry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ headlineEn: 'Incomplete reading' }),
  });
  assert.equal(badTelRes.status, 400);

  // Missing required fields on PATCH /api/camps
  const badCampRes = await fetch(`${BASE_URL}/api/camps`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: 'camp_invalid' }),
  });
  assert.equal(badCampRes.status, 400);

  // Non-existent village on GET /api/villages?id=xyz
  const notFoundVillageRes = await fetch(`${BASE_URL}/api/villages?id=non_existent_village_id`);
  assert.equal(notFoundVillageRes.status, 404);
});

test('API Integration: POST /api/generate-alert', async () => {
  const res = await fetch(`${BASE_URL}/api/generate-alert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      villageName: 'Lohian Khas',
      punjabiName: 'ਲੋਹੀਆਂ ਖਾਸ',
      hoursLeft: 24,
      riskLevel: 'EVACUATE_24H',
      safeRoadName: 'State Highway 25',
      reliefCampName: 'Govt Sr. Sec. School, Shahkot',
    }),
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(data.gurmukhiScript.length > 20);
  assert.ok(data.smsText.length > 10);
});

test('API Integration: POST /api/tts (Google Native Punjabi Female Voice)', async () => {
  const res = await fetch(`${BASE_URL}/api/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: 'ਸਾਵਧਾਨ! ਸਤਲੁਜ ਦਰਿਆ ਵਿੱਚ ਪਾਣੀ ਵੱਧ ਰਿਹਾ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਸੁਰੱਖਿਅਤ ਉੱਚੀ ਥਾਂ ਤੇ ਪਹੁੰਚੋ।',
      language: 'pa',
    }),
  });
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('content-type'), 'audio/mpeg');
  const buf = await res.arrayBuffer();
  assert.ok(buf.byteLength > 1000);
});

test('API Integration: POST /api/send-mesh-sms (Zero-Internet BLE Mesh SMS Gateway)', async () => {
  const res = await fetch(`${BASE_URL}/api/send-mesh-sms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      targetPhone: '+91 98140 12345',
      senderName: 'Gurpreet Singh',
      senderPhone: '+91 98765 43210',
      villageName: 'Lohian Khas',
      coords: [31.1189, 75.2512],
      familyMembers: 5,
      cattleCount: 4,
      hops: 3,
    }),
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.targetPhone, '+91 98140 12345');
  assert.equal(data.hops, 3);
  assert.ok(data.packetHash.startsWith('MESH-'));
  assert.ok(data.smsBody.includes('SANJEEVANI OFFLINE MESH SOS'));
  assert.ok(data.smsBody.includes('Gurpreet Singh'));
});


