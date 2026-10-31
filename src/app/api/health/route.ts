// CTBF-AI-12: System Health and Telemetry Diagnostic Endpoint
import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/serverDb';

export async function GET() {
  try {
    const telemetry = serverDb.getLatestTelemetry();
    const villages = serverDb.getVillages();
    const obstacles = serverDb.getObstacles();
    const reports = serverDb.getReports();
    const camps = serverDb.getCamps();

    return NextResponse.json({
      status: 'healthy',
      system: 'Sanjeevani (ਸੰਜੀਵਨੀ) Flood Advisory Core',
      problemStatement: 'CTBF-AI-12',
      timestamp: new Date().toISOString(),
      database: {
        status: 'connected',
        villagesCount: villages.length,
        reliefCampsCount: camps.length,
        activeObstaclesCount: obstacles.length,
        totalCitizenReports: reports.length,
      },
      latestTelemetry: {
        bhakraDamDischargeCusecs: telemetry.bhakraDamDischargeCusecs,
        phillaurGaugeMeters: telemetry.phillaurGaugeMeters,
        alertHeadline: telemetry.headlineEn,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { status: 'error', message },
      { status: 500 }
    );
  }
}
