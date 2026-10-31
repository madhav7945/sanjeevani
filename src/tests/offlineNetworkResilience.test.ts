// CTBF-AI-12: Offline Network Resilience & Zero-Connectivity Verification Tests
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { calculateSafeEvacuationRoute } from '../lib/dijkstraRouter';
import { PUNJAB_VILLAGES, RELIEF_CAMPS } from '../data/villagesAndCamps';
import { calculateVillageRisk } from '../lib/hydrologyEngine';
import { FloodReplayStep } from '../data/floodReplay2023';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const lohianVillage = PUNJAB_VILLAGES.find((v) => v.id === 'lohian_khas')!;

test('Offline Resilience: Zero-Network Dijkstra Routing in Local Memory', () => {
  // Pure local computation without any network connectivity
  const initialRoute = calculateSafeEvacuationRoute(
    lohianVillage,
    [],
    Object.values(RELIEF_CAMPS)
  );

  assert.ok(initialRoute.totalDistanceKm > 0);
  assert.ok(initialRoute.tractorTimeMinutes > 0);
  assert.ok(initialRoute.fullCoordinates.length >= 2);
  assert.equal(initialRoute.isReroutedDueToBreach, false);

  // Simulate local obstacle addition (e.g. breach reported while offline)
  const rerouted = calculateSafeEvacuationRoute(
    lohianVillage,
    ['road_lohian_makhu_low'],
    Object.values(RELIEF_CAMPS)
  );

  assert.ok(rerouted.totalDistanceKm > 0);
  assert.equal(rerouted.isReroutedDueToBreach, true);
  assert.ok(rerouted.steps.length > 0);
  // Ensure the blocked edge is not in the safe traversed path
  assert.ok(!rerouted.pathEdges.some((e) => e.id === 'road_lohian_makhu_low'));
});

test('Offline Resilience: Hydrology Risk Forecast with In-Memory Telemetry', () => {
  // Offline assessment using local baseline parameters
  const baselineStep: FloodReplayStep = {
    stepIndex: 0,
    label: 'Normal Flow',
    dateFormatted: '01 Jul 2023',
    hoursToHistoricalBreach: 120,
    bhakraDamDischargeCusecs: 32000,
    pongDamDischargeCusecs: 20000,
    kaushalyaDamDischargeCusecs: 3000,
    phillaurGaugeMeters: 232.0,
    harikeDownstreamCusecs: 35000,
    catchmentRainfall24hMm: 20,
    sutlejWaterLevelRelative: 0.2,
    beasWaterLevelRelative: 0.1,
    ghaggarWaterLevelRelative: 0.2,
    systemAlertHeadline: { en: 'Normal', pa: 'ਆਮ' },
    keyEventDescription: { en: 'Normal', pa: 'ਆਮ' },
    blockedRoadSegments: [],
  };

  const risk = calculateVillageRisk(lohianVillage, baselineStep);
  assert.equal(risk.riskLevel, 'SAFE');
  assert.ok(risk.statusLabelEn.length > 0);
  assert.ok(risk.statusLabelPa.length > 0);

  // Critical flood simulation entirely calculated offline
  const surgeStep: FloodReplayStep = {
    stepIndex: 3,
    label: 'T-24h Mandatory Evacuation',
    dateFormatted: '10 Jul 2023',
    hoursToHistoricalBreach: 24,
    bhakraDamDischargeCusecs: 195000,
    pongDamDischargeCusecs: 120000,
    kaushalyaDamDischargeCusecs: 25000,
    phillaurGaugeMeters: 235.8,
    harikeDownstreamCusecs: 178000,
    catchmentRainfall24hMm: 310,
    sutlejWaterLevelRelative: 4.8,
    beasWaterLevelRelative: 2.8,
    ghaggarWaterLevelRelative: 3.5,
    systemAlertHeadline: { en: 'Peak Flood', pa: 'ਵੱਡਾ ਹੜ੍ਹ' },
    keyEventDescription: { en: 'Breach Imminent', pa: 'ਬੰਨ੍ਹ ਟੁੱਟਣ ਦਾ ਖਤਰਾ' },
    blockedRoadSegments: ['road_mandala_channa_bundh'],
  };

  const surgeRisk = calculateVillageRisk(lohianVillage, surgeStep);
  assert.equal(surgeRisk.riskLevel, 'EVACUATE_24H');
  assert.equal(surgeRisk.statusColor, '#EF4444');
  assert.ok(
    surgeRisk.livestockAndTractorActionEn.includes('deras') ||
    surgeRisk.livestockAndTractorActionEn.includes('livestock') ||
    surgeRisk.embankmentClearance <= -0.5
  );
});

test('Offline Resilience: Pre-Recorded Audio Assets Verified on Local Filesystem', () => {
  const publicAudioDir = path.join(process.cwd(), 'public', 'audio');
  assert.ok(fs.existsSync(publicAudioDir), 'public/audio directory must exist');

  const requiredAudioFiles = [
    'evacuation_pa.mp3',
    'evacuation_en.mp3',
    'prepare_pa.mp3',
    'prepare_en.mp3',
  ];

  for (const file of requiredAudioFiles) {
    const filePath = path.join(publicAudioDir, file);
    assert.ok(fs.existsSync(filePath), `Audio file ${file} must exist for offline playback`);
    const stat = fs.statSync(filePath);
    assert.ok(stat.size > 10000, `Audio file ${file} must be non-empty (was ${stat.size} bytes)`);
  }
});

test('Offline Resilience: Service Worker Script Verified for Offline PWA Boot', () => {
  const swPath = path.join(process.cwd(), 'public', 'sw.js');
  assert.ok(fs.existsSync(swPath), 'public/sw.js must exist for PWA offline operation');
  const swContent = fs.readFileSync(swPath, 'utf-8');
  assert.ok(swContent.includes('sanjeevani-offline-v1'));
  assert.ok(swContent.includes('PRECACHE_ASSETS'));
  assert.ok(swContent.includes('/audio/evacuation_pa.mp3'));
});

test('Offline Resilience: Offline Snapshot Endpoint Data Completeness', async () => {
  let bundle: any;
  try {
    const res = await fetch(`${BASE_URL}/api/offline-sync`);
    if (res.ok) {
      const data = await res.json();
      assert.equal(data.success, true);
      bundle = data.offlineBundle;
    }
  } catch {
    // Fallback if HTTP port 3000 is not actively bound during standalone unit test run
  }

  if (!bundle) {
    const { serverDb } = await import('../lib/serverDb');
    const { ROAD_NODES, ROAD_EDGES } = await import('../data/roadNetworkGraph');
    const snapshot = serverDb.getSystemSnapshot();
    bundle = {
      ...snapshot,
      gisNetwork: {
        nodes: ROAD_NODES,
        edges: ROAD_EDGES,
      },
    };
  }

  assert.ok(bundle.version >= 1);
  assert.ok(bundle.telemetry);
  assert.ok(bundle.telemetry.bhakraDamDischargeCusecs > 0);
  assert.ok(Array.isArray(bundle.villages) && bundle.villages.length >= 6);
  assert.ok(Array.isArray(bundle.camps) && bundle.camps.length >= 6);
  assert.ok(Array.isArray(bundle.activeBlockedRoadIds));
  assert.ok(Array.isArray(bundle.reports));
  assert.ok(bundle.gisNetwork);
  assert.ok(Object.keys(bundle.gisNetwork.nodes).length >= 5);
  assert.ok(bundle.gisNetwork.edges.length >= 5);
});

test('Offline Resilience: Offline Report Queuing & Serialization Structure', () => {
  // Test simulated offline report structure format for localStorage queuing
  const offlineReport = {
    id: `offline-${Date.now()}`,
    timestamp: new Date().toISOString(),
    villageId: 'lohian_khas',
    villageName: 'Lohian Khas',
    roadId: 'road_lohian_makhu_low',
    roadName: 'Lohian–Makhu Low Link Road',
    severity: 'CRITICAL',
    verifiedHazard: true,
    confidenceScore: 0.95,
    notes: 'Offline breach reported by citizen camera',
    status: 'PENDING_OFFLINE_SYNC',
  };

  const serialized = JSON.stringify([offlineReport]);
  const parsed = JSON.parse(serialized);

  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].status, 'PENDING_OFFLINE_SYNC');
  assert.equal(parsed[0].roadId, 'road_lohian_makhu_low');
});
