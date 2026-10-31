// Generated with Antigravity / Gemini, reviewed and modified by the team
// CTBF-AI-12: Groq Llama 3.3 70B Punjabi Gurmukhi Voice & 2G SMS Alert Generator

import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const apiKey = process.env.GROQ_API_KEY || '';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      villageName = 'Lohian Khas',
      punjabiName = 'ਲੋਹੀਆਂ ਖਾਸ',
      hoursLeft = 24,
      riskLevel = 'EVACUATE_24H',
      safeRoadName = 'State Highway 25',
      reliefCampName = 'Govt Sr. Sec. School, Shahkot',
      cattleAdvice = 'Move livestock to high deras and park tractors on elevated roads',
    } = body;

    // Deterministic fallback templates in case offline or API key missing
    const fallbackGurmukhi =
      riskLevel === 'EVACUATE_24H'
        ? `ਸਾਵਧਾਨ! ਪਿੰਡ ${punjabiName} ਲਈ ਹੜ੍ਹ ਦੀ ਲਾਲ ਚੇਤਾਵਨੀ ਹੈ। ਭਾਖੜਾ ਡੈਮ ਤੋਂ ਪਾਣੀ ਛੱਡਣ ਕਾਰਨ ਅਗਲੇ ${hoursLeft} ਘੰਟਿਆਂ ਵਿੱਚ ਪਾਣੀ ਖ਼ਤਰੇ ਦੇ ਨਿਸ਼ਾਨ ਤੋਂ ਪਾਰ ਹੋਣ ਦਾ ਖ਼ਦਸ਼ਾ ਹੈ। ਸਾਰੇ ਪਿੰਡ ਵਾਸੀ ਤੁਰੰਤ ਆਪਣੇ ਪਸ਼ੂਆਂ ਨੂੰ ਉੱਚੇ ਡੇਰਿਆਂ ਵੱਲ ਲੈ ਜਾਣ ਅਤੇ ਟਰੈਕਟਰ ਸਟੇਟ ਹਾਈਵੇ ਤੇ ਪਾਰਕ ਕਰਨ। ਸੁਰੱਖਿਅਤ ਰਸਤਾ ${safeRoadName} ਰਾਹੀਂ ${reliefCampName} ਵੱਲ ਜਾਓ।`
        : `ਸੂਚਨਾ: ਪਿੰਡ ${punjabiName} ਲਈ 48 ਘੰਟਿਆਂ ਦੀ ਹੜ੍ਹ ਚੌਕਸੀ ਜਾਰੀ ਕੀਤੀ ਗਈ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਜ਼ਰੂਰੀ ਦਸਤਾਵੇਜ਼ ਅਤੇ ਰਾਸ਼ਨ ਬੰਨ੍ਹ ਕੇ ਤਿਆਰ ਰੱਖੋ। ਪਸ਼ੂਆਂ ਦੀਆਂ ਰੱਸੀਆਂ ਖੋਲ੍ਹ ਕੇ ਰੱਖੋ।`;

    const fallbackSms = `[ਸੰਜੀਵਨੀ ਐਮਰਜੈਂਸੀ] ਪਿੰਡ ${punjabiName}: ਅਗਲੇ ${hoursLeft}h ਚ ਹੜ੍ਹ ਖ਼ਤਰਾ! ਤੁਰੰਤ ${reliefCampName} ਪਹੁੰਚੋ। ਰੂਟ: ${safeRoadName}। ਹੈਲਪਲਾਈਨ: 112 / 1077`;

    if (!apiKey) {
      return NextResponse.json({
        success: true,
        source: 'local-fallback',
        gurmukhiScript: fallbackGurmukhi,
        smsText: fallbackSms,
        englishTranslation: `EMERGENCY ALERT for ${villageName}: Mandatory evacuation within ${hoursLeft} hours. Proceed via ${safeRoadName} to ${reliefCampName}. Move cattle to high ground.`,
      });
    }

    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      model: 'qwen/qwen3.8-27b',
      messages: [
        {
          role: 'system',
          content:
            'You are Sanjeevani (ਸੰਜੀਵਨੀ), an emergency flood evacuation broadcast AI for rural Punjab. You must respond strictly with a valid JSON object matching the requested schema, with no markdown code fences and no extraneous text. Keep instructions authentic in Punjabi Gurmukhi, concise (2 sentences max), direct, and actionable for rural farmers.',
        },
        {
          role: 'user',
          content: `Generate an emergency voice broadcast script in Punjabi Gurmukhi and a 140-character 2G SMS for:
Village: ${punjabiName} (${villageName})
Risk: ${riskLevel}
Hours until river surge arrives: ${hoursLeft} hours
Designated safe route: ${safeRoadName}
Target Relief Camp: ${reliefCampName}
Livestock instruction: ${cattleAdvice}

Return strictly a JSON object:
{
  "gurmukhiScript": "Concise 2-sentence Punjabi voice broadcast text",
  "smsText": "Under 140 character compressed Punjabi SMS text",
  "englishTranslation": "1-sentence English summary"
}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 1500,
    });

    const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}');

    return NextResponse.json({
      success: true,
      source: 'groq-qwen-27b',
      gurmukhiScript: parsed.gurmukhiScript || fallbackGurmukhi,
      smsText: parsed.smsText || fallbackSms,
      englishTranslation: parsed.englishTranslation || 'Evacuate safely.',
    });
  } catch (error: unknown) {
    console.error('Groq alert generation error, using fallback:', error);
    return NextResponse.json({
      success: true,
      source: 'offline-resilient-fallback',
      gurmukhiScript:
        'ਸਾਵਧਾਨ! ਪਿੰਡ ਵਾਸੀਆਂ ਨੂੰ ਸੂਚਿਤ ਕੀਤਾ ਜਾਂਦਾ ਹੈ ਕਿ ਸਤਲੁਜ ਵਿੱਚ ਪਾਣੀ ਦਾ ਪੱਧਰ ਤੇਜ਼ੀ ਨਾਲ ਵਧ ਰਿਹਾ ਹੈ। ਤੁਰੰਤ ਸੁਰੱਖਿਅਤ ਰੂਟ ਰਾਹੀਂ ਨੇੜਲੇ ਸਰਕਾਰੀ ਸਕੂਲ ਜਾਂ ਗੁਰਦੁਆਰਾ ਸਾਹਿਬ ਦੇ ਰਾਹਤ ਕੈਂਪ ਵਿੱਚ ਪਹੁੰਚੋ।',
      smsText: '[ਸੰਜੀਵਨੀ] ਤੁਰੰਤ ਉੱਚੇ ਸੁਰੱਖਿਅਤ ਸਥਾਨ ਤੇ ਪਹੁੰਚੋ। ਹੈਲਪਲਾਈਨ 112।',
      englishTranslation: 'Emergency evacuation notice. Proceed to safe ground.',
    });
  }
}
