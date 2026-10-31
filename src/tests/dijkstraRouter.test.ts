// CTBF-AI-12: Dynamic Dijkstra Routing & Obstacle Reroute Test Suite
import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSafeEvacuationRoute } from '../lib/dijkstraRouter';
import { PUNJAB_VILLAGES } from '../data/villagesAndCamps';

const lohianVillage = PUNJAB_VILLAGES.find((v) => v.id === 'lohian_khas')!;
const gidderpindiVillage = PUNJAB_VILLAGES.find((v) => v.id === 'gidderpindi')!;

test('Dijkstra Router: Baseline clear road calculation for Lohian Khas', () => {
  const route = calculateSafeEvacuationRoute(lohianVillage, []);
  
  assert.ok(route.totalDistanceKm > 0, 'Route distance must be positive');
  assert.equal(route.camp.id, 'camp_shahkot_school', 'Target camp should be Shahkot School');
  assert.ok(route.pathEdges.length > 0, 'Should find path segments');
  assert.ok(route.tractorTimeMinutes > 0, 'Tractor time must be calculated');
  assert.ok(route.steps.length > 0, 'Turn-by-turn steps must exist');
  assert.equal(route.isReroutedDueToBreach, false, 'Should not be marked as rerouted on clear network');
});

test('Dijkstra Router: Dynamic Rerouting when low road is blocked by breach', () => {
  // Block the direct link road
  const blockedRoads = ['road_lohian_makhu_low'];
  const route = calculateSafeEvacuationRoute(lohianVillage, blockedRoads);

  // The route should still find a safe way (via Elevated SH25 or alternate high corridors)
  assert.ok(route.totalDistanceKm > 0, 'Should find alternative path');
  // Confirm the blocked edge is NOT in the pathEdges
  const hasBlockedEdgeInPath = route.pathEdges.some((edge) => blockedRoads.includes(edge.id));
  assert.equal(hasBlockedEdgeInPath, false, 'Rerouted path must not use any blocked road segment');
  assert.equal(route.isReroutedDueToBreach, true, 'Flag isReroutedDueToBreach must be true');
});

test('Dijkstra Router: Avoids Dhussi Bandh breach segment', () => {
  const blockedRoads = ['road_mandala_channa_bundh'];
  const route = calculateSafeEvacuationRoute(gidderpindiVillage, blockedRoads);

  const usedBreachRoad = route.pathEdges.some((e) => e.id === 'road_mandala_channa_bundh');
  assert.equal(usedBreachRoad, false, 'Must avoid broken Dhussi Bandh segment');
});

test('Dijkstra Router: Tractor vs Vehicle vs Walking speed physics', () => {
  const route = calculateSafeEvacuationRoute(lohianVillage, []);
  // Tractor speed ~25 km/h, Vehicle ~45 km/h, Walking ~4 km/h
  assert.ok(route.carTimeMinutes < route.tractorTimeMinutes, 'Car must be faster than tractor');
  assert.ok(route.tractorTimeMinutes < route.walkingTimeMinutes, 'Tractor must be faster than walking');
});
