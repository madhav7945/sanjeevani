// Generated with Antigravity / Gemini, reviewed and modified by the team
// CTBF-AI-12: Dynamic Dijkstra Pathfinder Avoiding Submerged & Reported Roads

import { ROAD_NODES, ROAD_EDGES, RoadEdge } from '../data/roadNetworkGraph';
import { VillageData, RELIEF_CAMPS, ReliefCamp } from '../data/villagesAndCamps';

export interface RouteStep {
  instructionEn: string;
  instructionPa: string;
  distanceKm: number;
  isSafeHighway: boolean;
}

export interface EvacuationRouteResult {
  villageId: string;
  camp: ReliefCamp;
  pathEdges: RoadEdge[];
  fullCoordinates: [number, number][];
  totalDistanceKm: number;
  tractorTimeMinutes: number;
  walkingTimeMinutes: number;
  carTimeMinutes: number;
  steps: RouteStep[];
  blockedEdgesEncountered: string[];
  isReroutedDueToBreach: boolean;
}

export function calculateSafeEvacuationRoute(
  village: VillageData,
  blockedRoadIds: string[],
  availableCamps?: ReliefCamp[] | Record<string, ReliefCamp>,
  preferredCampId?: string
): EvacuationRouteResult {
  // Convert camps to array
  const campsList: ReliefCamp[] = availableCamps
    ? (Array.isArray(availableCamps) ? availableCamps : Object.values(availableCamps))
    : Object.values(RELIEF_CAMPS);

  // Determine target camp: preferred -> village default -> closest available -> hard fallback
  let camp: ReliefCamp | undefined;

  if (preferredCampId) {
    camp = campsList.find((c) => c.id === preferredCampId);
  }

  if (!camp && village.nearestCampId) {
    camp = campsList.find((c) => c.id === village.nearestCampId);
  }

  if (!camp && campsList.length > 0) {
    // Pick geographically closest active high ground shelter
    let minDistance = Infinity;
    for (const c of campsList) {
      const dist = Math.hypot(c.coords[0] - village.coords[0], c.coords[1] - village.coords[1]);
      if (dist < minDistance) {
        minDistance = dist;
        camp = c;
      }
    }
  }

  if (!camp) {
    camp = RELIEF_CAMPS['camp_shahkot_school'];
  }

  // Map village to closest node
  let startNodeId = 'node_lohian';
  if (village.id === 'gidderpindi') startNodeId = 'node_gidderpindi';
  if (village.id === 'shahkot_bet') startNodeId = 'node_sh25_junction';
  if (village.id === 'phillaur_bet') startNodeId = 'node_phillaur_center';

  // Target node mapped from relief camp
  let targetNodeId = 'node_shahkot_town';
  if (camp.id === 'camp_ber_sahib' || camp.id === 'camp_sultanpur_bdpo') {
    targetNodeId = 'node_sultanpur_center';
  } else if (camp.id === 'camp_phillaur_police') {
    targetNodeId = 'node_phillaur_center';
  } else {
    // Dynamically find closest road network vertex to this camp
    let closestDist = Infinity;
    for (const [nodeId, node] of Object.entries(ROAD_NODES)) {
      const dist = Math.hypot(node.coords[0] - camp.coords[0], node.coords[1] - camp.coords[1]);
      if (dist < closestDist) {
        closestDist = dist;
        targetNodeId = nodeId;
      }
    }
  }

  // Build Adjacency Graph with weights
  const graph: Record<string, { neighbor: string; weight: number; edge: RoadEdge }[]> = {};
  Object.keys(ROAD_NODES).forEach((nodeId) => {
    graph[nodeId] = [];
  });

  ROAD_EDGES.forEach((edge) => {
    const isBlocked = blockedRoadIds.includes(edge.id);
    // If road is submerged, weight is infinite (simulate obstacle avoidance)
    const weight = isBlocked ? 999999 : edge.distanceKm * (edge.isElevatedHighway ? 1.0 : 1.5);

    if (graph[edge.from]) {
      graph[edge.from].push({ neighbor: edge.to, weight, edge });
    }
    if (graph[edge.to]) {
      graph[edge.to].push({ neighbor: edge.from, weight, edge });
    }
  });

  // Dijkstra Algorithm
  const distances: Record<string, number> = {};
  const previousEdge: Record<string, RoadEdge | null> = {};
  const previousNode: Record<string, string | null> = {};
  const unvisited = new Set<string>();

  Object.keys(ROAD_NODES).forEach((nodeId) => {
    distances[nodeId] = Infinity;
    previousEdge[nodeId] = null;
    previousNode[nodeId] = null;
    unvisited.add(nodeId);
  });

  distances[startNodeId] = 0;

  while (unvisited.size > 0) {
    let closestNode: string | null = null;
    let smallestDist = Infinity;

    unvisited.forEach((nodeId) => {
      if (distances[nodeId] < smallestDist) {
        smallestDist = distances[nodeId];
        closestNode = nodeId;
      }
    });

    if (closestNode === null || smallestDist === Infinity) break;
    if (closestNode === targetNodeId) break;

    unvisited.delete(closestNode);

    const neighbors = graph[closestNode] || [];
    for (const { neighbor, weight, edge } of neighbors) {
      if (unvisited.has(neighbor)) {
        const alt = distances[closestNode] + weight;
        if (alt < distances[neighbor]) {
          distances[neighbor] = alt;
          previousNode[neighbor] = closestNode;
          previousEdge[neighbor] = edge;
        }
      }
    }
  }

  // Reconstruct path
  const pathEdges: RoadEdge[] = [];
  let curr: string | null = targetNodeId;
  while (curr && previousEdge[curr]) {
    const edge = previousEdge[curr]!;
    pathEdges.unshift(edge);
    curr = previousNode[curr];
  }

  // Fallback if graph is partitioned
  if (pathEdges.length === 0) {
    const safeBackup = ROAD_EDGES.find((e) => e.isElevatedHighway) || ROAD_EDGES[3];
    pathEdges.push(safeBackup);
  }

  // Flatten coordinates
  const fullCoordinates: [number, number][] = [village.coords];
  let totalDistanceKm = 0;
  const steps: RouteStep[] = [];

  pathEdges.forEach((edge) => {
    edge.path.forEach((pt) => fullCoordinates.push(pt));
    totalDistanceKm += edge.distanceKm;
    steps.push({
      instructionEn: `Proceed onto ${edge.name} (Elevation ${edge.baseElevation}m)`,
      instructionPa: `${edge.punjabiName} ਵੱਲ ਵਧੋ (ਉਚਾਈ ${edge.baseElevation} ਮੀਟਰ)`,
      distanceKm: edge.distanceKm,
      isSafeHighway: edge.isElevatedHighway,
    });
  });

  fullCoordinates.push(camp.coords);
  totalDistanceKm = Number(totalDistanceKm.toFixed(1));

  // Times in minutes: Tractor ~25 km/h, Walking ~5 km/h, Car ~40 km/h
  const tractorTimeMinutes = Math.round((totalDistanceKm / 25) * 60);
  const walkingTimeMinutes = Math.round((totalDistanceKm / 5) * 60);
  const carTimeMinutes = Math.round((totalDistanceKm / 40) * 60);

  const isReroutedDueToBreach = blockedRoadIds.length > 0;

  return {
    villageId: village.id,
    camp,
    pathEdges,
    fullCoordinates,
    totalDistanceKm,
    tractorTimeMinutes,
    walkingTimeMinutes,
    carTimeMinutes,
    steps,
    blockedEdgesEncountered: blockedRoadIds,
    isReroutedDueToBreach,
  };
}
