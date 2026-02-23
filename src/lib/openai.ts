import OpenAI from "openai";

// Model configuration
export const AI_MODELS = {
  PRIMARY: process.env.AI_MODEL || "gpt-4o",
  MINI: process.env.AI_MODEL_MINI || "gpt-4o-mini",
};

// Default AI configuration
export const AI_CONFIG = {
  temperature: 0.7,
  maxTokens: 500,
  timeout: 30000, // 30 seconds
};

/**
 * Lazily creates the OpenAI client on first call.
 * Must be called inside a request handler, NOT at module level,
 * so the build doesn't fail when env vars are absent.
 */
export function getOpenAI(): OpenAI {
  return new OpenAI({
    baseURL: process.env.V98STORE_BASE_URL || "https://v98store.com/v1",
    apiKey: process.env.V98STORE_API_KEY || "no-key-configured",
  });
}

export default getOpenAI;
