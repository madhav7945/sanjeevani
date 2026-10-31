// Generated with Antigravity / Gemini, reviewed and modified by the team
// CTBF-AI-12: Google Native Punjabi Female TTS API (pa-IN Gurmukhi Fluent Female Voice)

import { NextResponse } from 'next/server';

// Split long text into natural punctuation chunks (under 160 characters for Google TTS)
function splitIntoChunks(text: string, maxLen = 160): string[] {
  const sentences = text.split(/([।\.\!\?]+)/).filter(Boolean);
  const chunks: string[] = [];
  let current = '';

  for (let i = 0; i < sentences.length; i++) {
    const s = sentences[i];
    if ((current + s).length > maxLen) {
      if (current.trim()) chunks.push(current.trim());
      current = s;
    } else {
      current += s;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.length > 0 ? chunks : [text];
}

// Synthesize via Google Native Punjabi Female TTS Engine
async function synthesizeGoogleTts(text: string, lang = 'pa'): Promise<Buffer> {
  const chunks = splitIntoChunks(text);
  const buffers: Buffer[] = [];

  for (const chunk of chunks) {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(
      chunk
    )}`;

    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        Referer: 'https://translate.google.com/',
      },
    });

    if (!res.ok) {
      throw new Error(`Google TTS service returned HTTP status ${res.status}`);
    }

    const arrayBuf = await res.arrayBuffer();
    buffers.push(Buffer.from(arrayBuf));
  }

  return Buffer.concat(buffers);
}

// GET handler for native mobile streaming & zero-blob audio playback
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const text = searchParams.get('text');
    const language = searchParams.get('lang') || searchParams.get('language') || 'pa';

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text query parameter is required' }, { status: 400 });
    }

    const isPunjabi = language === 'pa' || /[\u0A00-\u0A7F]/.test(text);
    const targetLang = isPunjabi ? 'pa' : 'en';

    const audioBuffer = await synthesizeGoogleTts(text, targetLang);

    return new Response(new Uint8Array(audioBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error: unknown) {
    console.error('TTS GET streaming error:', error);
    return NextResponse.json(
      { error: 'TTS generation failed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, language } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text parameter is required' }, { status: 400 });
    }

    // Detect if text is Gurmukhi Punjabi (Unicode range 0x0A00 - 0x0A7F)
    const isPunjabi = language === 'pa' || /[\u0A00-\u0A7F]/.test(text);
    const targetLang = isPunjabi ? 'pa' : 'en';

    // Optional Google Cloud / Gemini API key support
    const googleApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_TTS_API_KEY;

    if (googleApiKey && isPunjabi) {
      try {
        const cloudUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleApiKey}`;
        const cloudRes = await fetch(cloudUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: { text },
            voice: {
              languageCode: 'pa-IN',
              name: 'pa-IN-Wavenet-A',
              ssmlGender: 'FEMALE',
            },
            audioConfig: { audioEncoding: 'MP3', speakingRate: 0.95 },
          }),
        });

        if (cloudRes.ok) {
          const cloudData = await cloudRes.json();
          if (cloudData.audioContent) {
            const audioBuf = Buffer.from(cloudData.audioContent, 'base64');
            return new Response(audioBuf, {
              status: 200,
              headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Length': audioBuf.length.toString(),
                'Cache-Control': 'public, max-age=3600',
              },
            });
          }
        }
      } catch (cloudErr) {
        console.warn('Google Cloud API failed, using native Google fallback:', cloudErr);
      }
    }

    // Native Google Punjabi Female Voice Synthesis (100% Free, Zero API key required, fluent native Gurmukhi)
    const audioBuffer = await synthesizeGoogleTts(text, targetLang);

    return new Response(new Uint8Array(audioBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error: unknown) {
    console.error('TTS generation error:', error);
    return NextResponse.json(
      { error: 'TTS generation failed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
