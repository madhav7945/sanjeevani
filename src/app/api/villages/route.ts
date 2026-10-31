// CTBF-AI-12: Punjab Villages & Risk Forecasts API
import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/serverDb';
import { calculateVillageRisk } from '@/lib/hydrologyEngine';
import { FloodReplayStep } from '@/data/floodReplay2023';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    const villages = serverDb.getVillages();
    const latestTelemetry = serverDb.getLatestTelemetry();

    // Reconstruct step from latest telemetry
    const activeStep: FloodReplayStep = {
      stepIndex: 99,
      label: 'Live Telemetry',
      dateFormatted: latestTelemetry.timestamp,
      hoursToHistoricalBreach: 24,
      bhakraDamDischargeCusecs: latestTelemetry.bhakraDamDischargeCusecs,
      pongDamDischargeCusecs: latestTelemetry.pongDamDischargeCusecs,
      kaushalyaDamDischargeCusecs: latestTelemetry.kaushalyaDamDischargeCusecs,
      phillaurGaugeMeters: latestTelemetry.phillaurGaugeMeters,
      harikeDownstreamCusecs: latestTelemetry.harikeDownstreamCusecs,
      catchmentRainfall24hMm: latestTelemetry.catchmentRainfall24hMm,
      sutlejWaterLevelRelative: latestTelemetry.sutlejWaterLevelRelative,
      beasWaterLevelRelative: latestTelemetry.beasWaterLevelRelative,
      ghaggarWaterLevelRelative: latestTelemetry.ghaggarWaterLevelRelative,
      systemAlertHeadline: {
        en: latestTelemetry.headlineEn,
        pa: latestTelemetry.headlinePa,
      },
      keyEventDescription: {
        en: 'Live automated gauge reading across Sutlej basin.',
        pa: 'ਸਤਲੁਜ ਬੇਸਿਨ ਤੋਂ ਲਾਈਵ ਪਾਣੀ ਦੇ ਪੱਧਰ ਦਾ ਅੰਕੜਾ।',
      },
      blockedRoadSegments: [],
    };

    if (id) {
      const village = serverDb.getVillageById(id);
      if (!village) {
        return NextResponse.json({ success: false, error: 'Village not found' }, { status: 404 });
      }
      const forecast = calculateVillageRisk(village, activeStep);
      return NextResponse.json({ success: true, village, forecast });
    }

    const villagesWithForecast = villages.map((v) => ({
      ...v,
      forecast: calculateVillageRisk(v, activeStep),
    }));

    return NextResponse.json({
      success: true,
      count: villages.length,
      villages: villagesWithForecast,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, ...partial } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Village id is required' }, { status: 400 });
    }

    const updated = serverDb.updateVillage(id, partial);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Village not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, village: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
