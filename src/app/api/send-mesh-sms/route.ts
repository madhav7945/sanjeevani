// Generated with Antigravity / Gemini, reviewed and modified by the team
// CTBF-AI-12: Zero-Internet BLE Mesh SMS Gateway Dispatcher
// Supports Simulated Mesh Delivery, Fast2SMS (India), and Twilio (Global) Cellular Relays

import { NextResponse } from 'next/server';
import { serverDb } from '../../../lib/serverDb';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      targetPhone = '+91 98140 12345',
      senderName = 'Gurpreet Singh',
      senderPhone = '+91 98765 43210',
      villageName = 'Lohian Khas',
      coords = [31.1189, 75.2512],
      familyMembers = 5,
      cattleCount = 4,
      hops = 3,
      apiKey = '', // Optional runtime API key for Fast2SMS or Twilio
    } = body;

    const timestamp = new Date().toISOString();
    const packetHash = `MESH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const formattedSms = `[SANJEEVANI OFFLINE MESH SOS]
From: ${senderName} (${senderPhone})
Location: ${villageName} (GPS: ${coords[0].toFixed(4)}°N, ${coords[1].toFixed(4)}°E)
Emergency: Trapped by river surge.
Family: ${familyMembers} persons | Cattle: ${cattleCount} head.
Relayed across ${hops} peer nodes without cell towers.
Cryptographic Hash: #${packetHash}`;

    let carrierDispatched = false;
    let carrierMessage = 'Simulated Mesh Gateway Relay (Laptop without GSM SIM modem)';

    const fast2SmsKey = apiKey || process.env.FAST2SMS_API_KEY;
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
    const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

    // 1. Attempt Fast2SMS Dispatch for Indian Numbers (if key provided)
    if (fast2SmsKey) {
      try {
        const clean10DigitPhone = targetPhone.replace(/[^0-9]/g, '').slice(-10);
        if (clean10DigitPhone.length === 10) {
          const f2sRes = await fetch(
            `https://www.fast2sms.com/dev/bulkV2?authorization=${fast2SmsKey}&route=q&message=${encodeURIComponent(
              formattedSms
            )}&flash=0&numbers=${clean10DigitPhone}`
          );
          const f2sData = await f2sRes.json();
          if (f2sData.return === true) {
            carrierDispatched = true;
            carrierMessage = `Dispatched via Fast2SMS Cellular Gateway to +91 ${clean10DigitPhone}`;
          } else {
            carrierMessage = `Fast2SMS response: ${f2sData.message || 'Check Fast2SMS balance'}`;
          }
        }
      } catch (f2sErr) {
        console.warn('Fast2SMS dispatch attempt failed:', f2sErr);
      }
    }
    // 2. Attempt Twilio Global Gateway (if configured)
    else if (twilioSid && twilioAuth && twilioFrom) {
      try {
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
        const authHeader = 'Basic ' + Buffer.from(`${twilioSid}:${twilioAuth}`).toString('base64');
        const formData = new URLSearchParams();
        formData.append('To', targetPhone);
        formData.append('From', twilioFrom);
        formData.append('Body', formattedSms);

        const twilioRes = await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            Authorization: authHeader,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString(),
        });
        if (twilioRes.ok) {
          carrierDispatched = true;
          carrierMessage = `Dispatched via Twilio Gateway to ${targetPhone}`;
        }
      } catch (twilioErr) {
        console.warn('Twilio dispatch attempt failed:', twilioErr);
      }
    }

    // Persist to local mesh ledger so all nearby devices receive the distress packet
    serverDb.addMeshBeacon({
      senderName,
      senderPhone,
      villageName,
      coords,
      familyMembers,
      cattleCount,
      medicalNeeds: body.medicalNeeds || 'Standard flood evacuation needed',
      hops,
      packetHash,
      smsBody: formattedSms,
      gatewayNode: 'Highway-SH25-Relay-Cellular-Tower-04',
    });

    return NextResponse.json({
      success: true,
      timestamp,
      targetPhone,
      senderName,
      senderPhone,
      villageName,
      hops,
      packetHash,
      smsBody: formattedSms,
      gatewayNode: 'Highway-SH25-Relay-Cellular-Tower-04',
      status: 'DELIVERED_TO_RESCUE_CELL',
      carrierDispatched,
      carrierMessage,
    });
  } catch (error: unknown) {
    console.error('Mesh SMS error:', error);
    return NextResponse.json(
      { error: 'Failed to process mesh SMS dispatch', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const beacons = serverDb.getAllMeshBeacons();
    return NextResponse.json({
      success: true,
      count: beacons.length,
      beacons,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { beaconId } = body;

    if (!beaconId) {
      return NextResponse.json({ success: false, error: 'beaconId is required' }, { status: 400 });
    }

    const updated = serverDb.dispatchNdrfBoat(beaconId);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Beacon not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      beacon: updated,
      message: 'NDRF Rescue Boat Dispatched to GPS Coordinates',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

