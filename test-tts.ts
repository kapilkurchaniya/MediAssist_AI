import { HfInference } from "@huggingface/inference";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

async function testModel(modelId: string) {
  try {
    console.log(`Testing model: ${modelId}...`);
    const response = await hf.textToSpeech({
      model: modelId,
      inputs: "Hello, this is a test.",
    });
    console.log(`Success with ${modelId}! Size: ${response.size}`);
    return true;
  } catch (err: any) {
    console.error(`Failed ${modelId}:`, err.message);
    return false;
  }
}

async function run() {
  const models = [
    "facebook/mms-tts-eng",
    "espnet/kan-bayashi_ljspeech_vits",
    "suno/bark-small",
    "facebook/fastspeech2-en-ljspeech",
    "microsoft/speecht5_tts",
    "coqui/XTTS-v2"
  ];
  
  for (const m of models) {
    const success = await testModel(m);
    if (success) {
      console.log(`\nFound working model: ${m}`);
      process.exit(0);
    }
  }
  console.log("\nNo working models found.");
}

run();
