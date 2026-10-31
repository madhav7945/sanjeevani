// CTBF-AI-12: Full System Snapshot for Offline PWA Sync & Edge Caching
import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/serverDb';
import { ROAD_NODES, ROAD_EDGES } from '@/data/roadNetworkGraph';

export async function GET() {
  try {
    const snapshot = serverDb.getSystemSnapshot();

    return NextResponse.json({
      success: true,
      syncedAt: new Date().toISOString(),
      offlineBundle: {
        ...snapshot,
        gisNetwork: {
          nodes: ROAD_NODES,
          edges: ROAD_EDGES,
        },
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { villageId = 'lohian_khas', villageName = 'Lohian Khas', citizenName = 'Gurpreet Singh', deviceFingerprint } = body;

    const acknowledgement = serverDb.addAcknowledgement({
      villageId,
      villageName,
      citizenName,
      deviceFingerprint,
    });

    return NextResponse.json({
      success: true,
      acknowledgement,
    }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

