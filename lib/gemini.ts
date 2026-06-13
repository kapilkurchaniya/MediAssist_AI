import { GoogleGenAI } from "@google/genai";

// Ensure API key is trimmed (env files sometimes have leading spaces)
const apiKey = (process.env.GEMINI_API_KEY || "").trim();

const ai = new GoogleGenAI({ apiKey });

const MODEL = "gemini-2.0-flash";

// JSON Schema definition for Gemini Structured Output
const extractionSchema = {
  type: "OBJECT" as const,
  properties: {
    doctorName: {
      type: "STRING" as const,
      description: "Name of the doctor prescribing the medicines.",
    },
    clinicName: {
      type: "STRING" as const,
      description: "Name of the clinic or hospital.",
    },
    patientName: {
      type: "STRING" as const,
      description: "Name of the patient.",
    },
    date: {
      type: "STRING" as const,
      description: "Date of the prescription in YYYY-MM-DD format.",
    },
    medicines: {
      type: "ARRAY" as const,
      description: "List of prescribed medicines.",
      items: {
        type: "OBJECT" as const,
        properties: {
          name: {
            type: "STRING" as const,
            description:
              "Name of the medicine (e.g., Paracetamol, Amoxicillin).",
          },
          dose: {
            type: "STRING" as const,
            description: "Dosage amount (e.g., 500mg, 10ml).",
          },
          instructions: {
            type: "STRING" as const,
            description:
              "How to take it (e.g., Take with food, After meals).",
          },
          frequency: {
            type: "STRING" as const,
            description:
              "How often to take it (e.g., Twice a day, 1-0-1).",
          },
          duration: {
            type: "STRING" as const,
            description:
              "Duration of the course (e.g., 5 days, 2 weeks).",
          },
        },
        required: ["name"],
      },
    },
    safetyAlerts: {
      type: "ARRAY" as const,
      description:
        "Any potential drug interactions, contraindications, or severe side effects among the extracted medicines.",
      items: {
        type: "STRING" as const,
      },
    },
    riskLevel: {
      type: "STRING" as const,
      description: "Overall safety risk level of this prescription.",
      enum: ["low", "medium", "high"],
    },
  },
  required: ["medicines", "riskLevel"],
};

const PROMPT = `
Analyze this medical prescription carefully.
Extract the doctor's name, clinic name, patient name, and the date.
Extract the list of medicines, their dosages, instructions, frequency, and duration.

CRITICAL SAFETY CHECK:
As a medical safety AI, evaluate the list of extracted medicines.
Identify any potential drug-drug interactions, duplicate therapies, or major contraindications.
If there are issues, list them in the safetyAlerts array and elevate the riskLevel to 'medium' or 'high' accordingly.
If there are no apparent issues, set riskLevel to 'low'.
`;

const FALLBACK_PROMPT = `
Analyze this medical prescription image carefully. 
Return ONLY a valid JSON object (no markdown, no explanation) with this exact structure:
{
  "doctorName": "string or empty",
  "clinicName": "string or empty",
  "patientName": "string or empty",
  "date": "YYYY-MM-DD or empty",
  "medicines": [
    {
      "name": "medicine name",
      "dose": "dosage or empty",
      "instructions": "how to take or empty",
      "frequency": "how often or empty",
      "duration": "how long or empty"
    }
  ],
  "safetyAlerts": ["any drug interaction warnings"],
  "riskLevel": "low" or "medium" or "high"
}

Extract all medicines you can read. If you can't read something, use your best guess.
Check for drug interactions and set the risk level accordingly.
`;

/** Sleep helper for retry backoff */
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Attempt structured output with Gemini. Falls back to unstructured JSON if
 * the responseSchema config causes issues.
 */
export async function analyzePrescriptionImage(
  base64Image: string,
  mimeType: string
) {
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not defined or empty in environment variables."
    );
  }

  console.log(
    `[Gemini] Starting analysis with model=${MODEL}, mimeType=${mimeType}, imageSize=${base64Image.length} chars`
  );

  const imageContent = {
    inlineData: {
      data: base64Image,
      mimeType: mimeType,
    },
  };

  // --- Attempt 1: Structured output with schema ---
  const structuredResult = await callGeminiWithRetry(
    PROMPT,
    imageContent,
    true
  );
  if (structuredResult) return structuredResult;

  // --- Attempt 2: Fallback to unstructured JSON ---
  console.log("[Gemini] Structured output failed. Trying unstructured fallback...");
  const fallbackResult = await callGeminiWithRetry(
    FALLBACK_PROMPT,
    imageContent,
    false
  );
  if (fallbackResult) return fallbackResult;

  throw new Error(
    "Failed to analyze prescription image with AI after all retries."
  );
}

async function callGeminiWithRetry(
  prompt: string,
  imageContent: { inlineData: { data: string; mimeType: string } },
  useSchema: boolean,
  maxRetries = 3
): Promise<any | null> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `[Gemini] Attempt ${attempt}/${maxRetries} (schema=${useSchema})`
      );

      const config: any = {
        temperature: 0.2,
      };

      if (useSchema) {
        config.responseMimeType = "application/json";
        config.responseSchema = extractionSchema;
      }

      const response = await ai.models.generateContent({
        model: MODEL,
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }, imageContent],
          },
        ],
        config,
      });

      const text = response.text;
      if (!text) {
        console.warn(`[Gemini] Empty response on attempt ${attempt}`);
        continue;
      }

      // Clean the response — strip markdown fences if present
      let cleanText = text.trim();
      if (cleanText.startsWith("```")) {
        cleanText = cleanText
          .replace(/^```(?:json)?\s*\n?/, "")
          .replace(/\n?```\s*$/, "");
      }

      const parsed = JSON.parse(cleanText);
      console.log(
        `[Gemini] Success on attempt ${attempt}. Found ${parsed.medicines?.length || 0} medicines.`
      );
      return parsed;
    } catch (error: any) {
      const status = error?.status || error?.response?.status;
      const message = error?.message || String(error);

      console.error(
        `[Gemini] Attempt ${attempt}/${maxRetries} failed — status=${status}, message=${message}`
      );

      // Don't retry on auth/permission errors
      if (status === 401 || status === 403) {
        console.error("[Gemini] Authentication error. Check your GEMINI_API_KEY.");
        return null;
      }

      // Retry on transient errors (429, 500, 503)
      if (attempt < maxRetries) {
        const backoff = Math.pow(2, attempt) * 1000; // 2s, 4s
        console.log(`[Gemini] Retrying in ${backoff}ms...`);
        await sleep(backoff);
      }
    }
  }

  return null;
}
