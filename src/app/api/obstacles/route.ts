// CTBF-AI-12: Dynamic Route Obstacles & Embankment Breaches API
import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/serverDb';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get('all') === 'true';

    const obstacles = serverDb.getObstacles(!all);
    const blockedRoadIds = obstacles.map((o) => o.roadId);

    return NextResponse.json({
      success: true,
      count: obstacles.length,
      blockedRoadIds,
      obstacles,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      roadId,
      roadName = 'Field Road Segment',
      villageId,
      reportedBy = 'NDRF / District Emergency Center',
      reason = 'Submerged or embankment collapsed',
      severity = 'CRITICAL',
    } = body;

    if (!roadId) {
      return NextResponse.json({ success: false, error: 'roadId is required' }, { status: 400 });
    }

    const obstacle = serverDb.addObstacle({
      roadId,
      roadName,
      villageId,
      reportedBy,
      reason,
      severity: severity as 'CRITICAL' | 'WARNING' | 'SUBMERGED',
      active: true,
    });

    return NextResponse.json({
      success: true,
      obstacle,
      activeBlockedRoadIds: serverDb.getObstacles().map((o) => o.roadId),
    }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const roadId = searchParams.get('roadId');

    if (!roadId) {
      return NextResponse.json({ success: false, error: 'roadId is required' }, { status: 400 });
    }

    const removed = serverDb.removeObstacle(roadId);
    if (!removed) {
      return NextResponse.json({ success: false, error: 'Obstacle not found or already inactive' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Road ${roadId} cleared and reopened.`,
      activeBlockedRoadIds: serverDb.getObstacles().map((o) => o.roadId),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
