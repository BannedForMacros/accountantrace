import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const modelName = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

if (!apiKey) {
  console.warn(
    "[gemini] GEMINI_API_KEY no esta definida. Configura .env antes de generar preguntas."
  );
}

export const gemini = new GoogleGenerativeAI(apiKey ?? "");
export const geminiModel = gemini.getGenerativeModel({ model: modelName });
