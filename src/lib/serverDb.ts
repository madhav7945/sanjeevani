// CTBF-AI-12: Persistent Backend Storage & Telemetry Repository for Sanjeevani
// Follows Clean Architecture & Ponytail Principles (Zero bloat, Atomic file persistence)

import fs from 'fs';
import path from 'path';
import { PUNJAB_VILLAGES, RELIEF_CAMPS, VillageData, ReliefCamp } from '../data/villagesAndCamps';
import { FLOOD_REPLAY_2023, FloodReplayStep } from '../data/floodReplay2023';

export interface TelemetryRecord {
  id: string;
  timestamp: string;
  bhakraDamDischargeCusecs: number;
  pongDamDischargeCusecs: number;
  kaushalyaDamDischargeCusecs: number;
  phillaurGaugeMeters: number;
  harikeDownstreamCusecs: number;
  catchmentRainfall24hMm: number;
  sutlejWaterLevelRelative: number;
  beasWaterLevelRelative: number;
  ghaggarWaterLevelRelative: number;
  headlineEn: string;
  headlinePa: string;
  evacuationBroadcast?: boolean;
  evacuationTargetVillageId?: string;
  broadcastApprovedBy?: string;
}

export interface CitizenReportRecord {
  id: string;
  villageId: string;
  roadId: string;
  landmark: string;
  timestamp: string;
  verifiedHazard: boolean;
  confidenceScore: number;
  photoUrl: string;
  notes: string;
  classification?: string;
  source?: string;
  status?: 'PENDING' | 'APPROVED' | 'DISMISSED';
}

export interface DynamicObstacleRecord {
  id: string;
  roadId: string;
  roadName: string;
  villageId?: string;
  reportedBy: string;
  reason: string;
  severity: 'CRITICAL' | 'WARNING' | 'SUBMERGED';
  timestamp: string;
  active: boolean;
}

export interface MeshBeaconRecord {
  id: string;
  timestamp: string;
  senderName: string;
  senderPhone: string;
  villageName: string;
  coords: [number, number];
  familyMembers: number;
  cattleCount: number;
  medicalNeeds: string;
  hops: number;
  packetHash: string;
  smsBody: string;
  gatewayNode?: string;
  ndrfDispatched?: boolean;
  ndrfDispatchedAt?: string;
}

export interface CitizenAcknowledgementRecord {
  id: string;
  villageId: string;
  villageName: string;
  timestamp: string;
  citizenName?: string;
  deviceFingerprint?: string;
}

export interface DatabaseSchema {
  version: number;
  lastUpdated: string;
  telemetry: TelemetryRecord[];
  villages: VillageData[];
  camps: Record<string, ReliefCamp>;
  reports: CitizenReportRecord[];
  obstacles: DynamicObstacleRecord[];
  replaySteps: FloodReplayStep[];
  meshBeacons?: MeshBeaconRecord[];
  citizenAcknowledgements?: CitizenAcknowledgementRecord[];
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'sanjeevani_store.json');

// In-memory cache
let inMemoryDb: DatabaseSchema | null = null;
let lastLoadedMtime = 0;

function getInitialDatabase(): DatabaseSchema {
  const initialTelemetry: TelemetryRecord[] = FLOOD_REPLAY_2023.map((step) => ({
    id: `tel_${step.stepIndex}`,
    timestamp: step.dateFormatted,
    bhakraDamDischargeCusecs: step.bhakraDamDischargeCusecs,
    pongDamDischargeCusecs: step.pongDamDischargeCusecs,
    kaushalyaDamDischargeCusecs: step.kaushalyaDamDischargeCusecs,
    phillaurGaugeMeters: step.phillaurGaugeMeters,
    harikeDownstreamCusecs: step.harikeDownstreamCusecs,
    catchmentRainfall24hMm: step.catchmentRainfall24hMm,
    sutlejWaterLevelRelative: step.sutlejWaterLevelRelative,
    beasWaterLevelRelative: step.beasWaterLevelRelative,
    ghaggarWaterLevelRelative: step.ghaggarWaterLevelRelative,
    headlineEn: step.systemAlertHeadline.en,
    headlinePa: step.systemAlertHeadline.pa,
  }));

  // Append pristine safe baseline as the latest active telemetry
  initialTelemetry.push({
    id: 'tel_safe_baseline',
    timestamp: new Date().toISOString(),
    bhakraDamDischargeCusecs: 45000,
    pongDamDischargeCusecs: 28000,
    kaushalyaDamDischargeCusecs: 4500,
    phillaurGaugeMeters: 232.4,
    harikeDownstreamCusecs: 42000,
    catchmentRainfall24hMm: 45,
    sutlejWaterLevelRelative: 0.6,
    beasWaterLevelRelative: 0.4,
    ghaggarWaterLevelRelative: 0.8,
    headlineEn: 'GREEN MONITORING: Sutlej river flow within normal reservoir threshold',
    headlinePa: 'ਹਰਾ ਅਲਰਟ: ਸਤਲੁਜ ਦਰਿਆ ਵਿੱਚ ਪਾਣੀ ਦਾ ਵਹਾਅ ਆਮ ਸੀਮਾ ਅੰਦਰ ਹੈ',
    evacuationBroadcast: false,
  });

  const initialObstacles: DynamicObstacleRecord[] = [
    {
      id: 'obs_lohian_makhu',
      roadId: 'road_lohian_makhu_low',
      roadName: 'Lohian–Makhu Low Link Road',
      villageId: 'lohian_khas',
      reportedBy: 'Flood Telemetry Engine (Water Level > 1.2m)',
      reason: 'Standing floodwater over asphalt; depth approx 0.85m',
      severity: 'SUBMERGED',
      timestamp: new Date().toISOString(),
      active: true,
    },
  ];

  const initialReports: CitizenReportRecord[] = [
    {
      id: 'report_initial_1',
      villageId: 'lohian_khas',
      roadId: 'road_lohian_makhu_low',
      landmark: 'Lohian Link Culvert Km 2.4',
      timestamp: '2 hours ago',
      verifiedHazard: true,
      confidenceScore: 92,
      photoUrl: '/samples/breach.jpg',
      notes: 'Submerged low causeway near bridge',
      classification: 'ROAD_SUBMERGED',
      source: 'citizen-app',
    },
  ];

  return {
    version: 1,
    lastUpdated: new Date().toISOString(),
    telemetry: initialTelemetry,
    villages: [...PUNJAB_VILLAGES],
    camps: { ...RELIEF_CAMPS },
    reports: initialReports,
    obstacles: initialObstacles,
    replaySteps: [...FLOOD_REPLAY_2023],
    meshBeacons: [],
  };
}

function loadDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      const stat = fs.statSync(DB_FILE);
      if (inMemoryDb && stat.mtimeMs <= lastLoadedMtime) {
        return inMemoryDb;
      }
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && parsed.version) {
        inMemoryDb = parsed;
        lastLoadedMtime = stat.mtimeMs;
        return inMemoryDb!;
      }
    }
  } catch (err) {
    console.error('Error loading database file, falling back to seed data:', err);
  }

  // Initialize and persist
  const fresh = getInitialDatabase();
  saveDatabase(fresh);
  inMemoryDb = fresh;
  return fresh;
}

function saveDatabase(db: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    db.lastUpdated = new Date().toISOString();
    inMemoryDb = db;

    // Atomic write with Windows EPERM copy-fallback
    const tempFile = `${DB_FILE}.${process.pid}.${Date.now()}.${Math.random().toString(36).substring(2, 8)}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), 'utf-8');
    try {
      fs.renameSync(tempFile, DB_FILE);
    } catch {
      // Windows-specific file lock fallback: copyFileSync overwrites open file handles gracefully
      fs.copyFileSync(tempFile, DB_FILE);
      try {
        fs.unlinkSync(tempFile);
      } catch {
        // ignore temp cleanup error
      }
    }
  } catch (err) {
    console.error('Error writing atomic database file:', err);
  }
}

export const serverDb = {
  // Telemetry
  getTelemetry(limit = 10): TelemetryRecord[] {
    const db = loadDatabase();
    return db.telemetry.slice(-limit);
  },

  getLatestTelemetry(): TelemetryRecord {
    const db = loadDatabase();
    return db.telemetry[db.telemetry.length - 1] || db.telemetry[0];
  },

  addTelemetry(reading: Omit<TelemetryRecord, 'id' | 'timestamp'> & { timestamp?: string }): TelemetryRecord {
    const db = loadDatabase();
    const record: TelemetryRecord = {
      ...reading,
      id: `tel_${Date.now()}`,
      timestamp: reading.timestamp || new Date().toISOString(),
    };
    db.telemetry.push(record);
    saveDatabase(db);
    return record;
  },

  // Villages
  getVillages(): VillageData[] {
    const db = loadDatabase();
    return db.villages;
  },

  getVillageById(id: string): VillageData | undefined {
    const db = loadDatabase();
    return db.villages.find((v) => v.id === id);
  },

  updateVillage(id: string, partial: Partial<VillageData>): VillageData | null {
    const db = loadDatabase();
    const idx = db.villages.findIndex((v) => v.id === id);
    if (idx === -1) return null;
    db.villages[idx] = { ...db.villages[idx], ...partial };
    saveDatabase(db);
    return db.villages[idx];
  },

  // Relief Camps
  getCamps(): ReliefCamp[] {
    const db = loadDatabase();
    return Object.values(db.camps);
  },

  getCampById(id: string): ReliefCamp | undefined {
    const db = loadDatabase();
    return db.camps[id];
  },

  updateCampAvailableBeds(id: string, delta: number): ReliefCamp | null {
    const db = loadDatabase();
    const camp = db.camps[id];
    if (!camp) return null;
    camp.availableBeds = Math.max(0, Math.min(camp.capacity, camp.availableBeds + delta));
    saveDatabase(db);
    return camp;
  },

  addCamp(camp: Omit<ReliefCamp, 'id'> & { id?: string }): ReliefCamp {
    const db = loadDatabase();
    const cleanId = camp.id || `camp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newCamp: ReliefCamp = {
      ...camp,
      id: cleanId,
      name: camp.name.trim(),
      punjabiName: camp.punjabiName?.trim() || camp.name.trim(),
      type: camp.type || 'school',
      coords: camp.coords || [31.18, 75.25],
      elevation: Number(camp.elevation) || 218,
      capacity: Number(camp.capacity) || 300,
      availableBeds: Number(camp.availableBeds ?? camp.capacity ?? 300),
      contactNumber: camp.contactNumber?.trim() || '+91 181 2224455',
      hasMedical: Boolean(camp.hasMedical),
      hasLangar: Boolean(camp.hasLangar ?? true),
    };

    db.camps[cleanId] = newCamp;
    saveDatabase(db);
    return newCamp;
  },

  deleteCamp(id: string): boolean {
    const db = loadDatabase();
    if (!db.camps[id]) return false;
    delete db.camps[id];
    saveDatabase(db);
    return true;
  },

  // Citizen Reports
  getReports(villageId?: string): CitizenReportRecord[] {
    const db = loadDatabase();
    if (villageId) {
      return db.reports.filter((r) => r.villageId === villageId);
    }
    return db.reports;
  },

  addReport(report: Omit<CitizenReportRecord, 'id' | 'timestamp'> & { id?: string; timestamp?: string }): CitizenReportRecord {
    const db = loadDatabase();
    const newReport: CitizenReportRecord = {
      ...report,
      id: report.id || `report_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: report.timestamp || 'Just now',
    };
    db.reports.unshift(newReport);

    // If verified hazard with a roadId, automatically register a dynamic obstacle
    if (newReport.verifiedHazard && newReport.roadId) {
      this.addObstacle({
        roadId: newReport.roadId,
        roadName: newReport.landmark || 'Citizen Reported Obstacle',
        villageId: newReport.villageId,
        reportedBy: `Citizen Report (${newReport.confidenceScore}% confidence)`,
        reason: newReport.notes || 'Breach or deep water reported by field camera',
        severity: 'CRITICAL',
        active: true,
      });
    }

    saveDatabase(db);
    return newReport;
  },

  // Dynamic Obstacles
  getObstacles(onlyActive = true): DynamicObstacleRecord[] {
    const db = loadDatabase();
    return onlyActive ? db.obstacles.filter((o) => o.active) : db.obstacles;
  },

  addObstacle(obstacle: Omit<DynamicObstacleRecord, 'id' | 'timestamp'> & { id?: string; timestamp?: string }): DynamicObstacleRecord {
    const db = loadDatabase();
    // Check if obstacle for this road already exists
    const existing = db.obstacles.find((o) => o.roadId === obstacle.roadId);
    if (existing) {
      existing.active = true;
      existing.reason = obstacle.reason;
      existing.severity = obstacle.severity;
      existing.timestamp = obstacle.timestamp || new Date().toISOString();
      saveDatabase(db);
      return existing;
    }

    const newObs: DynamicObstacleRecord = {
      ...obstacle,
      id: obstacle.id || `obs_${Date.now()}`,
      timestamp: obstacle.timestamp || new Date().toISOString(),
      active: true,
    };
    db.obstacles.push(newObs);
    saveDatabase(db);
    return newObs;
  },

  removeObstacle(roadId: string): boolean {
    const db = loadDatabase();
    const target = db.obstacles.find((o) => o.roadId === roadId);
    if (target) {
      target.active = false;
      saveDatabase(db);
      return true;
    }
    return false;
  },

  // Flood Replay
  getReplaySteps(): FloodReplayStep[] {
    const db = loadDatabase();
    return db.replaySteps;
  },

  // Mesh SOS Beacons (P2P Radio Gossiping)
  addMeshBeacon(beacon: Omit<MeshBeaconRecord, 'id' | 'timestamp'>): MeshBeaconRecord {
    const db = loadDatabase();
    if (!db.meshBeacons) db.meshBeacons = [];
    const newRecord: MeshBeaconRecord = {
      ...beacon,
      id: `beacon_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    db.meshBeacons.unshift(newRecord);
    if (db.meshBeacons.length > 50) db.meshBeacons = db.meshBeacons.slice(0, 50);
    saveDatabase(db);
    return newRecord;
  },

  approveReport(id: string): CitizenReportRecord | null {
    const db = loadDatabase();
    const target = db.reports.find((r) => r.id === id);
    if (!target) return null;
    target.verifiedHazard = true;
    target.status = 'APPROVED';
    if (target.roadId) {
      this.addObstacle({
        roadId: target.roadId,
        roadName: target.landmark || 'Breach Hazard Roadblock',
        villageId: target.villageId,
        reportedBy: `DC Approved Citizen Report (${target.confidenceScore}% confidence)`,
        reason: target.notes || 'Breach verified by administration',
        severity: 'CRITICAL',
        active: true,
      });
    }
    saveDatabase(db);
    return target;
  },

  dismissReport(id: string): boolean {
    const db = loadDatabase();
    const target = db.reports.find((r) => r.id === id);
    if (!target) return false;
    target.status = 'DISMISSED';
    target.verifiedHazard = false;
    if (target.roadId) {
      this.removeObstacle(target.roadId);
    }
    saveDatabase(db);
    return true;
  },

  dispatchNdrfBoat(beaconId: string): MeshBeaconRecord | null {
    const db = loadDatabase();
    if (!db.meshBeacons) return null;
    const beacon = db.meshBeacons.find((b) => b.id === beaconId || b.packetHash === beaconId);
    if (!beacon) return null;
    beacon.ndrfDispatched = true;
    beacon.ndrfDispatchedAt = new Date().toISOString();
    saveDatabase(db);
    return beacon;
  },

  getAllMeshBeacons(): MeshBeaconRecord[] {
    const db = loadDatabase();
    return db.meshBeacons || [];
  },

  getLatestMeshBeacon(): MeshBeaconRecord | null {
    const db = loadDatabase();
    return db.meshBeacons && db.meshBeacons.length > 0 ? db.meshBeacons[0] : null;
  },

  // Citizen Acknowledgements
  addAcknowledgement(record: Omit<CitizenAcknowledgementRecord, 'id' | 'timestamp'>): CitizenAcknowledgementRecord {
    const db = loadDatabase();
    if (!db.citizenAcknowledgements) db.citizenAcknowledgements = [];
    const item: CitizenAcknowledgementRecord = {
      ...record,
      id: `ack_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    db.citizenAcknowledgements.unshift(item);
    if (db.citizenAcknowledgements.length > 50) {
      db.citizenAcknowledgements = db.citizenAcknowledgements.slice(0, 50);
    }
    saveDatabase(db);
    return item;
  },

  getAcknowledgements(): CitizenAcknowledgementRecord[] {
    const db = loadDatabase();
    return db.citizenAcknowledgements || [];
  },

  clearAcknowledgements(): void {
    const db = loadDatabase();
    db.citizenAcknowledgements = [];
    saveDatabase(db);
  },

  // Comprehensive System State for Offline Caching
  getSystemSnapshot() {
    const db = loadDatabase();
    const activeObstacles = db.obstacles.filter((o) => o.active).map((o) => o.roadId);
    return {
      version: db.version,
      lastUpdated: db.lastUpdated,
      telemetry: this.getLatestTelemetry(),
      villages: db.villages,
      camps: Object.values(db.camps),
      activeBlockedRoadIds: activeObstacles,
      allObstacles: db.obstacles,
      reports: db.reports.slice(0, 20),
      replaySteps: db.replaySteps,
      latestMeshBeacon: this.getLatestMeshBeacon(),
      allMeshBeacons: db.meshBeacons || [],
      citizenAcknowledgements: db.citizenAcknowledgements || [],
    };
  },

  // Test / Reset utility
  resetDatabase(): void {
    const fresh = getInitialDatabase();
    saveDatabase(fresh);
    inMemoryDb = fresh;
  },
};
