// CTBF-AI-12: Relief Camps & Bed Capacity API
import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/serverDb';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      const camp = serverDb.getCampById(id);
      if (!camp) {
        return NextResponse.json({ success: false, error: 'Camp not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, camp });
    }

    const camps = serverDb.getCamps();
    return NextResponse.json({
      success: true,
      count: camps.length,
      camps,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, bedDelta } = body;

    if (!id || bedDelta === undefined) {
      return NextResponse.json({ success: false, error: 'id and bedDelta are required' }, { status: 400 });
    }

    const updated = serverDb.updateCampAvailableBeds(id, Number(bedDelta));
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Camp not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, camp: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, coords } = body;

    if (!name || !coords || !Array.isArray(coords) || coords.length !== 2) {
      return NextResponse.json(
        { success: false, error: 'name and coords: [lat, lng] are required to deploy a relief camp' },
        { status: 400 }
      );
    }

    const lat = Number(coords[0]);
    const lng = Number(coords[1]);
    if (isNaN(lat) || isNaN(lng) || lat < 28 || lat > 34 || lng < 73 || lng > 78) {
      return NextResponse.json(
        { success: false, error: 'coords must be valid geographic coordinates within Punjab bounds' },
        { status: 400 }
      );
    }

    const newCamp = serverDb.addCamp({
      id: body.id,
      name: body.name,
      punjabiName: body.punjabiName || body.name,
      type: body.type || 'school',
      coords: [lat, lng],
      elevation: Number(body.elevation) || 218,
      capacity: Number(body.capacity) || 300,
      availableBeds: Number(body.availableBeds ?? body.capacity ?? 300),
      contactNumber: body.contactNumber || '+91 181 2224455',
      hasMedical: Boolean(body.hasMedical),
      hasLangar: Boolean(body.hasLangar ?? true),
    });

    return NextResponse.json({ success: true, camp: newCamp }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get('id');

    if (!id) {
      try {
        const body = await req.json();
        id = body?.id;
      } catch {
        // Body optional if provided in query param
      }
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'Camp id is required to decommission shelter' }, { status: 400 });
    }

    const deleted = serverDb.deleteCamp(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Camp not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Relief camp decommissioned and removed from network',
      deletedId: id,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
