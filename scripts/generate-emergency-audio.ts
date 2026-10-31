import fs from 'fs';
import path from 'path';

const AUDIO_DIR = path.join(process.cwd(), 'public', 'audio');

async function synthesizeGoogleTts(text: string, lang = 'pa'): Promise<Buffer> {
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(text)}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
      Referer: 'https://translate.google.com/',
    },
  });

  if (!res.ok) {
    throw new Error(`Google TTS returned HTTP status ${res.status}`);
  }

  const arrayBuf = await res.arrayBuffer();
  return Buffer.from(arrayBuf);
}

async function main() {
  if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
  }

  const files = [
    {
      name: 'evacuation_pa.mp3',
      text: 'ਸਾਵਧਾਨ! ਪਿੰਡ ਲਈ ਹੜ੍ਹ ਦੀ ਲਾਲ ਚੇਤਾਵਨੀ ਹੈ। ਡਿਪਟੀ ਕਮਿਸ਼ਨਰ ਵੱਲੋਂ ਤੁਰੰਤ ਨਿਕਾਸੀ ਦਾ ਹੁਕਮ ਦਿੱਤਾ ਗਿਆ ਹੈ। ਸਾਰੇ ਪਿੰਡ ਵਾਸੀ ਤੁਰੰਤ ਸੁਰੱਖਿਅਤ ਰੂਟ ਸਟੇਟ ਹਾਈਵੇ 25 ਰਾਹੀਂ ਰਾਹਤ ਕੈਂਪ ਪਹੁੰਚੋ।',
      lang: 'pa',
    },
    {
      name: 'evacuation_en.mp3',
      text: 'Emergency flood alert. Mandatory evacuation order issued by District Administration. Evacuate immediately via State Highway 25.',
      lang: 'en',
    },
    {
      name: 'prepare_pa.mp3',
      text: 'ਸੂਚਨਾ: ਪਿੰਡ ਲਈ ਹੜ੍ਹ ਚੌਕਸੀ ਜਾਰੀ ਕੀਤੀ ਗਈ ਹੈ। ਪਸ਼ੂਆਂ ਨੂੰ ਉੱਚੇ ਡੇਰਿਆਂ ਵੱਲ ਲੈ ਜਾਓ।',
      lang: 'pa',
    },
    {
      name: 'prepare_en.mp3',
      text: 'Flood preparation watch. High river surge expected. Please secure livestock and move to high ground.',
      lang: 'en',
    },
  ];

  for (const item of files) {
    const dest = path.join(AUDIO_DIR, item.name);
    console.log(`Generating ${item.name}...`);
    try {
      const buf = await synthesizeGoogleTts(item.text, item.lang);
      fs.writeFileSync(dest, buf);
      console.log(`Saved ${item.name} (${buf.length} bytes)`);
    } catch (err) {
      console.error(`Failed to generate ${item.name}:`, err);
    }
  }
}

main();
