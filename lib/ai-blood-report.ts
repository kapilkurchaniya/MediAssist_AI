import Groq from "groq-sdk";
import { GoogleGenAI } from "@google/genai";

export interface BloodReportBiomarker {
  name: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: "normal" | "high" | "low" | "unknown";
  recommendation?: string;
}

export interface BloodReportAnalysis {
  biomarkers: BloodReportBiomarker[];
  summary: {
    possibleMeanings: string;
    recommendations: string;
    whenToConsult: string;
  };
  provider: "groq" | "gemini";
}

const GROQ_API_KEY = (process.env.GROQ_API_KEY || "").trim();
const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || "").trim();

const GROQ_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";
const GEMINI_MODEL = "gemini-2.5-flash";

const BLOOD_REPORT_PROMPT = `You are an expert Medical OCR and Information Extraction assistant specializing in analyzing blood test reports. Your goal is to accurately transcribe the biomarkers (like Hemoglobin, WBC, RBC, Platelets, Sugar, Cholesterol, Creatinine, etc.) and their values from the provided image/pdf into a strict, structured JSON format.

### Extraction Rules:
1. Extract every biomarker present in the report. For each, identify its name, the patient's value, the unit (e.g., g/dL, mg/dL), and the reference range.
2. Compare the patient's value with the reference range. Classify the status as exactly "normal", "high", "low", or "unknown" (if reference range is missing or unparseable).
3. For any biomarker classified as "high" or "low", generate a specific, brief, and actionable recommendation (e.g., dietary changes, lifestyle adjustments) to help improve that particular deficiency or abnormality. Provide an empty string for normal biomarkers.
4. Do not hallucinate values. Only extract what is clearly visible.
5. After extracting all biomarkers, generate a brief, patient-friendly summary based on the overall abnormal values (if any). If everything is normal, state that.
6. Provide a "possibleMeanings" string explaining what the overall high/low values might indicate generally.
7. Provide general "recommendations" for the summary (e.g., overall diet, exercise).
8. Provide a "whenToConsult" string advising when they should see a doctor based on these results.

### JSON Output Schema:
Respond ONLY with a valid JSON object matching this structure (no markdown fences, no explanation):
{
  "biomarkers": [
    {
      "name": "String",
      "value": "String",
      "unit": "String",
      "referenceRange": "String",
      "status": "normal" | "high" | "low" | "unknown",
      "recommendation": "String"
    }
  ],
  "summary": {
    "possibleMeanings": "String",
    "recommendations": "String",
    "whenToConsult": "String"
  }
}

Return ONLY the raw JSON.`;

function cleanJsonResponse(text: string): string {
  let clean = text.trim();
  if (clean.startsWith("```")) {
    clean = clean.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  }
  return clean.trim();
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function analyzeWithGroq(base64Data: string, mimeType: string): Promise<BloodReportAnalysis | null> {
  if (!GROQ_API_KEY) return null;

  const groq = new Groq({ apiKey: GROQ_API_KEY });

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`[AI-Blood] Groq: Attempt ${attempt}/3`);
      
      // Note: Groq Vision might only support images. If it's a PDF, we might need to skip to Gemini or it will fail.
      if (mimeType === "application/pdf") {
        console.log("[AI-Blood] Groq does not natively support PDF. Skipping to Gemini.");
        return null;
      }

      const completion = await groq.chat.completions.create({
        model: GROQ_MODEL,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: BLOOD_REPORT_PROMPT },
              { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Data}` } },
            ],
          },
        ],
        temperature: 0.2,
      });

      const text = completion.choices[0]?.message?.content;
      if (!text) continue;

      try {
        const parsed = JSON.parse(cleanJsonResponse(text));
        parsed.provider = "groq";
        return parsed as BloodReportAnalysis;
      } catch (parseError) {
        console.error("[AI-Blood] Groq JSON parse error:", parseError);
        console.error("[AI-Blood] Raw Groq text:", text);
        throw parseError;
      }
    } catch (error: any) {
      console.error(`[AI-Blood] Groq Attempt ${attempt} error:`, error);
      if (error?.status === 401 || error?.status === 403) return null;
      if (attempt < 3) await sleep(Math.pow(2, attempt) * 1000);
    }
  }
  return null;
}

async function analyzeWithGemini(base64Data: string, mimeType: string): Promise<BloodReportAnalysis | null> {
  if (!GEMINI_API_KEY) return null;

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`[AI-Blood] Gemini: Attempt ${attempt}/3`);

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [
          {
            role: "user",
            parts: [
              { text: BLOOD_REPORT_PROMPT },
              { inlineData: { data: base64Data, mimeType: mimeType } },
            ],
          },
        ],
        config: { temperature: 0.2 },
      });

      const text = response.text;
      if (!text) continue;

      try {
        const parsed = JSON.parse(cleanJsonResponse(text));
        parsed.provider = "gemini";
        return parsed as BloodReportAnalysis;
      } catch (parseError) {
        console.error("[AI-Blood] Gemini JSON parse error:", parseError);
        console.error("[AI-Blood] Raw Gemini text:", text);
        throw parseError;
      }
    } catch (error: any) {
      console.error(`[AI-Blood] Gemini Attempt ${attempt} error:`, error);
      if (error?.status === 401 || error?.status === 403) return null;
      const backoff = error?.status === 429 ? 15000 : Math.pow(2, attempt) * 1000;
      if (attempt < 3) await sleep(backoff);
    }
  }
  return null;
}

export async function analyzeBloodReport(base64Data: string, mimeType: string): Promise<BloodReportAnalysis> {
  console.log("[AI-Blood] Starting blood report analysis...");

  // Gemini (Primary)
  const geminiResult = await analyzeWithGemini(base64Data, mimeType);
  if (geminiResult && geminiResult.biomarkers?.length > 0) return geminiResult;

  // Groq (Alternate/Fallback)
  const groqResult = await analyzeWithGroq(base64Data, mimeType);
  if (groqResult && groqResult.biomarkers?.length > 0) return groqResult;

  throw new Error("Failed to analyze blood report. Please upload a clearer image or PDF.");
}
