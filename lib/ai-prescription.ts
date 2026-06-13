/**
 * AI Prescription Analyzer — Triple Fallback System
 * 
 * 1. PRIMARY:   Groq (Llama 4 Vision) — Free, fast, generous limits
 * 2. FALLBACK:  Google Gemini (2.5-flash) — Free tier with daily limits
 * 3. LAST RESORT: OCR.space (text extraction) + basic JSON parsing
 */

import Groq from "groq-sdk";
import { GoogleGenAI } from "@google/genai";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ExtractedMedicine {
  name: string;
  dosage?: string;
  instructions?: string;
  duration_days?: number;
}

export interface MedicationSchedule {
  morning: ExtractedMedicine[];
  afternoon: ExtractedMedicine[];
  evening: ExtractedMedicine[];
  bedtime: ExtractedMedicine[];
}

export interface PrescriptionData {
  patient_details: {
    name: string | null;
    age: string | null;
    sex: string | null;
    date: string | null;
  };
  vitals: {
    weight_kg: number | null;
    bp: string | null;
    pulse_per_minute: number | null;
    spo2_percentage: number | null;
    temperature: string | null;
  };
  medication_schedule: MedicationSchedule;
  advised_tests: string[];
  provider: "groq" | "gemini" | "ocrspace";
}

// ─── Config ──────────────────────────────────────────────────────────────────

const GROQ_API_KEY = (process.env.GROQ_API_KEY || "").trim();
const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || "").trim();
const OCR_SPACE_API_KEY = (process.env.OCR_SPACE_API_KEY || "").trim();

const GROQ_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";
const GEMINI_MODEL = "gemini-2.5-flash";

const NEW_PROMPT_INSTRUCTIONS = `You are an expert Medical OCR and Information Extraction assistant specializing in analyzing handwritten doctor prescriptions. Your goal is to accurately transcribe the patient information, vitals, medications, and advised tests from the provided image into a strict, structured JSON format.

### Extraction Rules:
1. De-duplicate: Never repeat a medication entry. If a medication is written or signed across multiple lines, group it into a single entity with its correct total frequency.
2. Direct Transcription Only: Do not guess, hallucinate, or approximate medication names. If a handwritten word resembles a signature or an artifact (e.g., "Proo"), do not include it as a medication.
3. Cursive Normalization: Carefully analyze medical context to distinguish handwriting loops. (e.g., do not mistake "continue" for "active").
4. Frequency Expansion: Parse medical shorthand abbreviations accurately:
   - OD = Once a day
   - BD / b.i.d = Twice a day
   - TDS / t.i.d = Thrice a day
   - HS = At bedtime
   - BBF = Before Breakfast
5. Schedule Splitting: Do not bundle all medications into a single block. You must map medications into specific time slots based on their frequency shorthand. If a medicine is "BD", it must appear in BOTH the "morning" and "evening" arrays.

### JSON Output Schema:
Respond ONLY with a valid JSON object matching this structure (no markdown fences, no explanation):
{
  "patient_details": {
    "name": "String or null",
    "age": "String or null",
    "sex": "String or null",
    "date": "YYYY-MM-DD or null"
  },
  "vitals": {
    "weight_kg": "Float or null",
    "bp": "String or null",
    "pulse_per_minute": "Integer or null",
    "spo2_percentage": "Integer or null",
    "temperature": "String or null"
  },
  "medication_schedule": {
    "morning": [
      { "name": "String", "dosage": "String", "instructions": "String", "duration_days": "Integer" }
    ],
    "afternoon": [
      { "name": "String", "dosage": "String", "instructions": "String", "duration_days": "Integer" }
    ],
    "evening": [
      { "name": "String", "dosage": "String", "instructions": "String", "duration_days": "Integer" }
    ],
    "bedtime": [
      { "name": "String", "dosage": "String", "instructions": "String", "duration_days": "Integer" }
    ]
  },
  "advised_tests": ["String"]
}

Double-check your extraction against visual layout structures before generating the final JSON payload. Return only raw JSON data without conversational prose.`;

const EXTRACTION_PROMPT = NEW_PROMPT_INSTRUCTIONS;

const OCR_TEXT_ANALYSIS_PROMPT = `${NEW_PROMPT_INSTRUCTIONS}

OCR TEXT:
---
{OCR_TEXT}
---`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cleanJsonResponse(text: string): string {
  let clean = text.trim();
  // Strip markdown code fences
  if (clean.startsWith("```")) {
    clean = clean.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  }
  return clean.trim();
}

function validatePrescriptionData(data: any): PrescriptionData & { provider: string } {
  // Ensure patient_details exists
  if (!data.patient_details) {
    data.patient_details = { name: null, age: null, sex: null, date: null };
  }
  
  // Ensure vitals exists
  if (!data.vitals) {
    data.vitals = { weight_kg: null, bp: null, pulse_per_minute: null, spo2_percentage: null, temperature: null };
  }

  // Ensure medication_schedule exists
  if (!data.medication_schedule) {
    data.medication_schedule = { morning: [], afternoon: [], evening: [], bedtime: [] };
  }

  // Ensure arrays exist
  ['morning', 'afternoon', 'evening', 'bedtime'].forEach(slot => {
    if (!Array.isArray(data.medication_schedule[slot])) {
      data.medication_schedule[slot] = [];
    }
    // Clean items
    data.medication_schedule[slot] = data.medication_schedule[slot].filter(
      (m: any) => m && typeof m.name === "string" && m.name.trim().length > 0
    );
  });

  // Ensure advised_tests is an array
  if (!Array.isArray(data.advised_tests)) {
    data.advised_tests = [];
  }

  return data;
}

// ─── Provider 1: Groq (Llama 4 Vision) ──────────────────────────────────────

async function analyzeWithGroq(
  base64Image: string,
  mimeType: string
): Promise<PrescriptionData | null> {
  if (!GROQ_API_KEY) {
    console.log("[AI] Groq: No API key configured, skipping.");
    return null;
  }

  const groq = new Groq({ apiKey: GROQ_API_KEY });

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`[AI] Groq: Attempt ${attempt}/3`);

      const completion = await groq.chat.completions.create({
        model: GROQ_MODEL,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: EXTRACTION_PROMPT },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        temperature: 0.2,
        max_tokens: 2048,
      });

      const text = completion.choices[0]?.message?.content;
      if (!text) {
        console.warn("[AI] Groq: Empty response");
        continue;
      }

      const parsed = JSON.parse(cleanJsonResponse(text));
      const result = validatePrescriptionData(parsed);
      result.provider = "groq";

      const totalMeds = 
        result.medication_schedule.morning.length + 
        result.medication_schedule.afternoon.length + 
        result.medication_schedule.evening.length + 
        result.medication_schedule.bedtime.length;

      console.log(
        `[AI] Groq: Success! Found ${totalMeds} medicine entries.`
      );
      return result as PrescriptionData;
    } catch (error: any) {
      const status = error?.status || error?.statusCode;
      console.error(
        `[AI] Groq: Attempt ${attempt}/3 failed — status=${status}, message=${error.message}`
      );

      // Don't retry auth errors
      if (status === 401 || status === 403) return null;

      if (attempt < 3) {
        const backoff = Math.pow(2, attempt) * 1000;
        console.log(`[AI] Groq: Retrying in ${backoff}ms...`);
        await sleep(backoff);
      }
    }
  }

  return null;
}

// ─── Provider 2: Google Gemini ───────────────────────────────────────────────

async function analyzeWithGemini(
  base64Image: string,
  mimeType: string
): Promise<PrescriptionData | null> {
  if (!GEMINI_API_KEY) {
    console.log("[AI] Gemini: No API key configured, skipping.");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`[AI] Gemini: Attempt ${attempt}/3`);

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [
          {
            role: "user",
            parts: [
              { text: EXTRACTION_PROMPT },
              {
                inlineData: {
                  data: base64Image,
                  mimeType: mimeType,
                },
              },
            ],
          },
        ],
        config: {
          temperature: 0.2,
        },
      });

      const text = response.text;
      if (!text) {
        console.warn("[AI] Gemini: Empty response");
        continue;
      }

      const parsed = JSON.parse(cleanJsonResponse(text));
      const result = validatePrescriptionData(parsed);
      result.provider = "gemini";

      const totalMeds = 
        result.medication_schedule.morning.length + 
        result.medication_schedule.afternoon.length + 
        result.medication_schedule.evening.length + 
        result.medication_schedule.bedtime.length;

      console.log(
        `[AI] Gemini: Success! Found ${totalMeds} medicine entries.`
      );
      return result as PrescriptionData;
    } catch (error: any) {
      const status = error?.status;
      console.error(
        `[AI] Gemini: Attempt ${attempt}/3 failed — status=${status}, message=${error.message}`
      );

      // Don't retry auth errors
      if (status === 401 || status === 403) return null;

      if (attempt < 3) {
        // Gemini asks us to wait ~45s on quota errors; use longer backoff
        const backoff = status === 429 ? 15000 : Math.pow(2, attempt) * 1000;
        console.log(`[AI] Gemini: Retrying in ${backoff}ms...`);
        await sleep(backoff);
      }
    }
  }

  return null;
}

// ─── Provider 3: OCR.space (Text extraction + AI parsing) ───────────────────

async function extractTextWithOCRSpace(
  base64Image: string,
  mimeType: string
): Promise<string | null> {
  if (!OCR_SPACE_API_KEY) {
    console.log("[AI] OCR.space: No API key configured, skipping.");
    return null;
  }

  try {
    console.log("[AI] OCR.space: Extracting text...");

    const dataUri = `data:${mimeType};base64,${base64Image}`;

    const formData = new URLSearchParams();
    formData.append("base64Image", dataUri);
    formData.append("apikey", OCR_SPACE_API_KEY);
    formData.append("language", "eng");
    formData.append("isOverlayRequired", "false");
    formData.append("OCREngine", "2"); // Engine 2 is better for complex layouts

    const response = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const data = await response.json();

    if (data.IsErroredOnProcessing) {
      console.error("[AI] OCR.space: Processing error:", data.ErrorMessage);
      return null;
    }

    const extractedText = data.ParsedResults
      ?.map((r: any) => r.ParsedText)
      .join("\n")
      .trim();

    if (!extractedText) {
      console.warn("[AI] OCR.space: No text extracted.");
      return null;
    }

    console.log(
      `[AI] OCR.space: Extracted ${extractedText.length} chars of text.`
    );
    return extractedText;
  } catch (error: any) {
    console.error("[AI] OCR.space: Error:", error.message);
    return null;
  }
}

function hasMedicines(data: PrescriptionData): boolean {
  return data.medication_schedule.morning.length > 0 ||
         data.medication_schedule.afternoon.length > 0 ||
         data.medication_schedule.evening.length > 0 ||
         data.medication_schedule.bedtime.length > 0;
}

async function parseOCRTextWithAI(ocrText: string): Promise<PrescriptionData | null> {
  const prompt = OCR_TEXT_ANALYSIS_PROMPT.replace("{OCR_TEXT}", ocrText);

  // Try Groq first for text analysis
  if (GROQ_API_KEY) {
    try {
      const groq = new Groq({ apiKey: GROQ_API_KEY });
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: 2048,
      });

      const text = completion.choices[0]?.message?.content;
      if (text) {
        const parsed = JSON.parse(cleanJsonResponse(text));
        const result = validatePrescriptionData(parsed);
        result.provider = "ocrspace";
        return result as PrescriptionData;
      }
    } catch (error: any) {
      console.error("[AI] Groq text analysis failed:", error.message);
    }
  }

  // Try Gemini for text analysis
  if (GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: { temperature: 0.2 },
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(cleanJsonResponse(text));
        const result = validatePrescriptionData(parsed);
        result.provider = "ocrspace";
        return result as PrescriptionData;
      }
    } catch (error: any) {
      console.error("[AI] Gemini text analysis failed:", error.message);
    }
  }

  // Last resort: basic regex parsing of OCR text
  console.log("[AI] Falling back to basic text parsing...");
  return basicTextParsing(ocrText);
}

function basicTextParsing(text: string): PrescriptionData {
  // Very basic attempt to extract medicine names from OCR text
  const lines = text.split("\n").filter((l) => l.trim().length > 0);
  const morningMeds: ExtractedMedicine[] = [];

  // Common medicine patterns: "Tab. Paracetamol 500mg" or "1. Amoxicillin 250mg"
  const medPatterns = [
    /(?:tab\.?|cap\.?|syp\.?|inj\.?|oint\.?)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)\s*(\d+\s*(?:mg|ml|mcg|g))?/gi,
    /\d+\.\s*([A-Za-z]+(?:\s+[A-Za-z]+)?)\s*(\d+\s*(?:mg|ml|mcg|g))?/gi,
  ];

  for (const line of lines) {
    for (const pattern of medPatterns) {
      pattern.lastIndex = 0;
      const match = pattern.exec(line);
      if (match) {
        morningMeds.push({
          name: match[1].trim(),
          dosage: match[2]?.trim() || "",
        });
      }
    }
  }

  return {
    patient_details: { name: null, age: null, sex: null, date: null },
    vitals: { weight_kg: null, bp: null, pulse_per_minute: null, spo2_percentage: null, temperature: null },
    medication_schedule: { morning: morningMeds, afternoon: [], evening: [], bedtime: [] },
    advised_tests: [],
    provider: "ocrspace",
  };
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export async function analyzePrescriptionImage(
  base64Image: string,
  mimeType: string
): Promise<PrescriptionData> {
  console.log("[AI] ═══════════════════════════════════════════════");
  console.log("[AI] Starting prescription analysis...");
  console.log(
    `[AI] Available providers: Groq=${!!GROQ_API_KEY}, Gemini=${!!GEMINI_API_KEY}, OCR.space=${!!OCR_SPACE_API_KEY}`
  );

  // 1. Try Groq (Primary)
  const groqResult = await analyzeWithGroq(base64Image, mimeType);
  if (groqResult) return groqResult;

  // 2. Try Gemini (Fallback)
  const geminiResult = await analyzeWithGemini(base64Image, mimeType);
  if (geminiResult) return geminiResult;

  // 3. Try OCR.space + AI parsing (Last Resort)
  const ocrText = await extractTextWithOCRSpace(base64Image, mimeType);
  if (ocrText) {
    const ocrResult = await parseOCRTextWithAI(ocrText);
    if (ocrResult && hasMedicines(ocrResult)) return ocrResult;
  }

  console.error("[AI] ═══════════════════════════════════════════════");
  console.error("[AI] ALL PROVIDERS FAILED. No prescription data extracted.");
  throw new Error(
    "Failed to analyze prescription. Please try again or upload a clearer image."
  );
}
