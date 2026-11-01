import '../config.js';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

export function createGeminiModel(temperature: number): ChatGoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY must be set in the backend .env file');
  }

  return new ChatGoogleGenerativeAI({
    apiKey,
    model: process.env.GEMINI_MODEL ?? 'gemini-3.6-flash',
    temperature,
  });
}
