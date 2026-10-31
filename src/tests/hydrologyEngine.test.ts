// CTBF-AI-12: Hydrology Engine Test Suite
import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateVillageRisk } from '../lib/hydrologyEngine';
import { PUNJAB_VILLAGES } from '../data/villagesAndCamps';
import { FloodReplayStep } from '../data/floodReplay2023';

const lohianVillage = PUNJAB_VILLAGES.find((v) => v.id === 'lohian_khas')!;

test('Hydrology Engine: Safe Baseline Conditions', () => {
  const safeStep: FloodReplayStep = {
    stepIndex: 0,
    label: 'Normal Flow',
    dateFormatted: '01 Jul 2023',
    hoursToHistoricalBreach: 120,
    bhakraDamDischargeCusecs: 32000, // Below safe capacity (40k)
    pongDamDischargeCusecs: 20000,
    kaushalyaDamDischargeCusecs: 3000,
    phillaurGaugeMeters: 232.0, // Normal height
    harikeDownstreamCusecs: 35000,
    catchmentRainfall24hMm: 20, // Light rain
    sutlejWaterLevelRelative: 0.2,
    beasWaterLevelRelative: 0.1,
    ghaggarWaterLevelRelative: 0.2,
    systemAlertHeadline: { en: 'Normal', pa: 'ਆਮ' },
    keyEventDescription: { en: 'Normal', pa: 'ਆਮ' },
    blockedRoadSegments: [],
  };

  const forecast = calculateVillageRisk(lohianVillage, safeStep);
  assert.equal(forecast.riskLevel, 'SAFE');
  assert.equal(forecast.statusColor, '#10B981');
  assert.ok(forecast.embankmentClearance > 0.5, 'Clearance should be positive and safe');
});

test('Hydrology Engine: 48h Preparation Alert under moderate dam surge', () => {
  const prepStep: FloodReplayStep = {
    stepIndex: 1,
    label: 'T-48h',
    dateFormatted: '09 Jul 2023',
    hoursToHistoricalBreach: 48,
    bhakraDamDischargeCusecs: 112000,
    pongDamDischargeCusecs: 78000,
    kaushalyaDamDischargeCusecs: 12000,
    phillaurGaugeMeters: 233.8,
    harikeDownstreamCusecs: 115000,
    catchmentRainfall24hMm: 240,
    sutlejWaterLevelRelative: 1.8,
    beasWaterLevelRelative: 1.4,
    ghaggarWaterLevelRelative: 1.9,
    systemAlertHeadline: { en: 'Warning', pa: 'ਚੇਤਾਵਨੀ' },
    keyEventDescription: { en: 'Surge', pa: 'ਵਹਾਅ' },
    blockedRoadSegments: [],
  };

  const forecast = calculateVillageRisk(lohianVillage, prepStep);
  assert.ok(
    forecast.riskLevel === 'PREPARE_48H' || forecast.riskLevel === 'EVACUATE_24H',
    `Expected elevated risk tier, got: ${forecast.riskLevel}`
  );
  assert.ok(forecast.riskScore >= 70, 'Risk score should reflect high urgency');
});

test('Hydrology Engine: Critical 24h Mandatory Evacuation under peak breach discharge', () => {
  const peakStep: FloodReplayStep = {
    stepIndex: 2,
    label: 'T-24h Critical',
    dateFormatted: '10 Jul 2023',
    hoursToHistoricalBreach: 24,
    bhakraDamDischargeCusecs: 195000, // Peak flood discharge
    pongDamDischargeCusecs: 140000,
    kaushalyaDamDischargeCusecs: 26000,
    phillaurGaugeMeters: 235.4, // Substantially over danger mark (234.6m)
    harikeDownstreamCusecs: 260000,
    catchmentRainfall24hMm: 310,
    sutlejWaterLevelRelative: 3.4,
    beasWaterLevelRelative: 2.8,
    ghaggarWaterLevelRelative: 3.6,
    systemAlertHeadline: { en: 'Red Alert', pa: 'ਲਾਲ ਅਲਰਟ' },
    keyEventDescription: { en: 'Overtopping', pa: 'ਪਾਣੀ ਚੜ੍ਹਿਆ' },
    blockedRoadSegments: [],
  };

  const forecast = calculateVillageRisk(lohianVillage, peakStep);
  assert.equal(forecast.riskLevel, 'EVACUATE_24H');
  assert.equal(forecast.statusColor, '#EF4444');
  assert.ok(forecast.embankmentClearance <= -0.5, 'Embankment should be overtopped');
  assert.ok(forecast.livestockAndTractorActionEn.includes('elevated deras'), 'Directs farmers to save livestock');
});

test('Hydrology Engine: Monitored villages geographic coverage', () => {
  assert.ok(PUNJAB_VILLAGES.length >= 6, 'Must monitor at least 6 vulnerable villages');
  const basins = new Set(PUNJAB_VILLAGES.map((v) => v.basin));
  assert.ok(basins.has('Sutlej'), 'Must cover Sutlej basin');
  assert.ok(basins.has('Beas'), 'Must cover Beas basin');
  assert.ok(basins.has('Ghaggar'), 'Must cover Ghaggar basin');
});
