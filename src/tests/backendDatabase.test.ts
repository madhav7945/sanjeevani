// CTBF-AI-12: Backend Database Repository Test Suite
import test from 'node:test';
import assert from 'node:assert/strict';
import { serverDb } from '../lib/serverDb';

test('ServerDb: Seeding and Retrieval', () => {
  const villages = serverDb.getVillages();
  assert.ok(villages.length >= 6, 'Should seed all 6 monitored villages');

  const camps = serverDb.getCamps();
  assert.ok(camps.length >= 6, 'Should seed all 6 relief shelters');

  const telemetry = serverDb.getLatestTelemetry();
  assert.ok(telemetry.bhakraDamDischargeCusecs > 0, 'Telemetry discharge must be positive');
  assert.ok(telemetry.phillaurGaugeMeters > 200, 'Phillaur gauge must be valid elevation');
});

test('ServerDb: Dynamic Obstacles Lifecycle', () => {
  const testRoadId = 'test_road_dhussi_sector_9';

  // Add obstacle
  const added = serverDb.addObstacle({
    roadId: testRoadId,
    roadName: 'Dhussi Sector 9 Bundh',
    villageId: 'lohian_khas',
    reportedBy: 'Field Inspector',
    reason: 'Erosion along river toe',
    severity: 'CRITICAL',
    active: true,
  });
  assert.equal(added.roadId, testRoadId);

  // Verify in active obstacles
  const activeList = serverDb.getObstacles();
  assert.ok(activeList.some((o) => o.roadId === testRoadId), 'Added obstacle must be present');

  // Remove obstacle (cleared road)
  const removed = serverDb.removeObstacle(testRoadId);
  assert.equal(removed, true, 'Removal should succeed');

  // Verify no longer in active list
  const activeAfter = serverDb.getObstacles();
  assert.equal(activeAfter.some((o) => o.roadId === testRoadId), false, 'Removed road must not be active');
});

test('ServerDb: Citizen Report Injection & Obstacle Auto-Creation', () => {
  const breachRoadId = 'road_test_bundh_breach_auto';

  const report = serverDb.addReport({
    villageId: 'gidderpindi',
    roadId: breachRoadId,
    landmark: 'Gidderpindi Spur 2',
    verifiedHazard: true,
    confidenceScore: 94,
    photoUrl: '/samples/breach.jpg',
    notes: 'Severe earthen embankment collapse',
    classification: 'CRITICAL_BUNDH_BREACH',
  });

  assert.ok(report.id.startsWith('report_'), 'Report should have generated ID');
  assert.equal(report.verifiedHazard, true);

  // Verify obstacle auto-injected
  const obstacles = serverDb.getObstacles();
  assert.ok(
    obstacles.some((o) => o.roadId === breachRoadId),
    'Verified hazard report must auto-register dynamic obstacle'
  );

  // Clean up test obstacle
  serverDb.removeObstacle(breachRoadId);
});

test('ServerDb: Relief Camp Available Beds Update', () => {
  const camps = serverDb.getCamps();
  // Use last camp to isolate from concurrent apiEndpoints tests
  const camp = camps[camps.length - 1];
  const initialBeds = camp.availableBeds;

  // Occupy 15 beds
  const updated = serverDb.updateCampAvailableBeds(camp.id, -15);
  assert.ok(updated);
  assert.equal(updated.availableBeds, initialBeds - 15);

  // Restore beds
  serverDb.updateCampAvailableBeds(camp.id, 15);
});

test('ServerDb: System State Snapshot for Offline Sync', () => {
  const snapshot = serverDb.getSystemSnapshot();
  assert.ok(snapshot.version >= 1);
  assert.ok(snapshot.lastUpdated);
  assert.ok(snapshot.telemetry);
  assert.ok(Array.isArray(snapshot.villages));
  assert.ok(Array.isArray(snapshot.camps));
  assert.ok(Array.isArray(snapshot.activeBlockedRoadIds));
  assert.ok(Array.isArray(snapshot.reports));
});
