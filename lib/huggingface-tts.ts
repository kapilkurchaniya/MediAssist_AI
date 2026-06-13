import * as googleTTS from 'google-tts-api';

export async function generateSpeechFromText(text: string, language: "en" | "hi" = "en"): Promise<ArrayBuffer> {
  try {
    // google-tts-api handles chunking for long texts automatically and is a reliable free fallback
    const urls = googleTTS.getAllAudioUrls(text, {
      lang: language,
      slow: false,
      host: 'https://translate.google.com',
      splitPunct: ',.?',
    });
    
    const fetchPromises = urls.map(async ({ url }, index) => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch audio part ${index}: ${response.statusText}`);
      const buffer = await response.arrayBuffer();
      return buffer;
    });

    const arrayBuffers = await Promise.all(fetchPromises);
    const totalLength = arrayBuffers.reduce((sum, buf) => sum + buf.byteLength, 0);
    
    const combined = new Uint8Array(totalLength);
    let offset = 0;
    for (const buf of arrayBuffers) {
      combined.set(new Uint8Array(buf), offset);
      offset += buf.byteLength;
    }
    
    return combined.buffer;
  } catch (error) {
    console.error("Google TTS error:", error);
    throw new Error("Failed to generate speech from text");
  }
}
