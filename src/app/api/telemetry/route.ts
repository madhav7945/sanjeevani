// CTBF-AI-12: Live River Gauges & Dam Discharge Telemetry API
import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/serverDb';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 10;

    const latest = serverDb.getLatestTelemetry();
    const history = serverDb.getTelemetry(limit);

    return NextResponse.json({
      success: true,
      latest,
      history,
      count: history.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.action === 'acknowledge') {
      const ack = serverDb.addAcknowledgement({
        villageId: body.villageId || 'lohian_khas',
        villageName: body.villageName || 'Lohian Khas',
        citizenName: body.citizenName || 'Gurpreet Singh',
        deviceFingerprint: body.deviceFingerprint,
      });
      return NextResponse.json({ success: true, acknowledgement: ack }, { status: 201 });
    }

    const {
      bhakraDamDischargeCusecs,
      pongDamDischargeCusecs = 30000,
      kaushalyaDamDischargeCusecs = 5000,
      phillaurGaugeMeters,
      harikeDownstreamCusecs = 45000,
      catchmentRainfall24hMm = 100,
      sutlejWaterLevelRelative = 1.0,
      beasWaterLevelRelative = 0.8,
      ghaggarWaterLevelRelative = 1.0,
      headlineEn = 'Updated telemetry reading recorded',
      headlinePa = 'ਨਵਾਂ ਦਰਿਆਈ ਪਾਣੀ ਦਾ ਅੰਕੜਾ ਦਰਜ ਕੀਤਾ ਗਿਆ',
      evacuationBroadcast = false,
      evacuationTargetVillageId = 'all',
      broadcastApprovedBy = 'Deputy Commissioner / SDMA Jalandhar',
    } = body;

    if (bhakraDamDischargeCusecs === undefined || phillaurGaugeMeters === undefined) {
      return NextResponse.json(
        { success: false, error: 'bhakraDamDischargeCusecs and phillaurGaugeMeters are required.' },
        { status: 400 }
      );
    }

    const record = serverDb.addTelemetry({
      bhakraDamDischargeCusecs: Number(bhakraDamDischargeCusecs),
      pongDamDischargeCusecs: Number(pongDamDischargeCusecs),
      kaushalyaDamDischargeCusecs: Number(kaushalyaDamDischargeCusecs),
      phillaurGaugeMeters: Number(phillaurGaugeMeters),
      harikeDownstreamCusecs: Number(harikeDownstreamCusecs),
      catchmentRainfall24hMm: Number(catchmentRainfall24hMm),
      sutlejWaterLevelRelative: Number(sutlejWaterLevelRelative),
      beasWaterLevelRelative: Number(beasWaterLevelRelative),
      ghaggarWaterLevelRelative: Number(ghaggarWaterLevelRelative),
      headlineEn,
      headlinePa,
      evacuationBroadcast: Boolean(evacuationBroadcast),
      evacuationTargetVillageId,
      broadcastApprovedBy,
    });

    return NextResponse.json({
      success: true,
      record,
    }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
