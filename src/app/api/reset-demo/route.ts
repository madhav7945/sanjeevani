// Generated with Antigravity / Gemini, reviewed and modified by the team
// CTBF-AI-12: Instant Demo Reset API — Restores pristine safe baseline for live judging demonstrations

import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/serverDb';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    serverDb.resetDatabase();
    return NextResponse.json({
      success: true,
      message: 'Demo state successfully reset to safe baseline (45,000 cusecs, zero roadblocks, evacuation stood down).',
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error('Error resetting demo database:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
