import { CohereClient } from "cohere-ai";

if (!process.env.COHERE_API_KEY) {
  throw new Error("COHERE_API_KEY is not set in the environment variables");
}

export const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

export async function generateAssistantResponse(prompt: string, context: string = "", language: "en" | "hi" = "en") {
  try {
    const preamble = `You are MediAssist AI, a helpful and precise virtual assistant for a patient dashboard. 
Your goal is to answer the patient's questions accurately based on their medical context, or provide helpful general internet knowledge if requested.
Always be empathetic, clear, and concise. Provide a helpful answer directly addressing the patient. Do not include markdown formatting if it will be spoken out loud, keep it conversational.
${language === 'hi' ? '\nCRITICAL INSTRUCTION: You MUST respond entirely in Hindi using the Devanagari script. Do not use English.' : ''}

Patient Context:
${context}`;

    const response = await cohere.chat({
      message: prompt,
      preamble: preamble,
      model: "command-r-plus-08-2024",
      temperature: 0.3,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Cohere generation error:", error);
    throw new Error("Failed to generate response from Cohere");
  }
}
