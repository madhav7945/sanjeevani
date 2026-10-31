// CTBF-AI-12: Citizen Breach Reports & Field Verification API
import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/serverDb';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const villageId = searchParams.get('villageId') || undefined;

    const reports = serverDb.getReports(villageId);
    return NextResponse.json({
      success: true,
      count: reports.length,
      reports,
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
      villageId = 'lohian_khas',
      roadId = '',
      landmark = 'General Field Hazard',
      verifiedHazard = true,
      confidenceScore = 85,
      photoUrl = '/samples/breach.jpg',
      notes = '',
      classification = 'CITIZEN_SUBMISSION',
    } = body;

    const record = serverDb.addReport({
      villageId,
      roadId,
      landmark,
      verifiedHazard: Boolean(verifiedHazard),
      confidenceScore: Number(confidenceScore),
      photoUrl,
      notes,
      classification,
      source: 'api',
    });

    return NextResponse.json({
      success: true,
      report: record,
    }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, action } = body; // action: 'approve' | 'dismiss'

    if (!id || !action) {
      return NextResponse.json({ success: false, error: 'id and action (approve/dismiss) are required' }, { status: 400 });
    }

    if (action === 'approve') {
      const approved = serverDb.approveReport(id);
      if (!approved) {
        return NextResponse.json({ success: false, error: 'Report not found' }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        report: approved,
        activeBlockedRoadIds: serverDb.getObstacles().map((o) => o.roadId),
      });
    }

    if (action === 'dismiss') {
      const dismissed = serverDb.dismissReport(id);
      if (!dismissed) {
        return NextResponse.json({ success: false, error: 'Report not found' }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        activeBlockedRoadIds: serverDb.getObstacles().map((o) => o.roadId),
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action. Must be approve or dismiss.' }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

