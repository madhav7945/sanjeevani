import Groq from 'groq-sdk';

const apiKey = process.env.GROQ_API_KEY || '';
const groq = new Groq({ apiKey });

async function test() {
  try {
    const completion = await groq.chat.completions.create({
      model: 'qwen/qwen3.8-27b',
      messages: [
        {
          role: 'system',
          content: 'You are an emergency flood broadcast AI for Punjab. Respond strictly with a valid JSON object matching the requested schema with no markdown. Schema: {"gurmukhiScript": string, "smsText": string, "englishTranslation": string}',
        },
        {
          role: 'user',
          content: 'Generate an emergency broadcast for village Lohian Khas (ਲੋਹੀਆਂ ਖਾਸ), flood arriving in 24 hours. Safe road: State Highway 25. Camp: Govt School Shahkot.',
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 1000,
    });
    console.log('Result:', completion.choices[0]?.message?.content);
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
