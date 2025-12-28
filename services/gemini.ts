
import { GoogleGenAI, Type } from "@google/genai";
import { GameMode } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSmartHint = async (pokemonName: string, cluesUsed: number) => {
  try {
    const ai = getAI();
    const prompt = `You are Dexter, the AI Pokedex. Give a cryptic 1-sentence clue about ${pokemonName}. 
    Difficulty level: ${cluesUsed}/5. 
    At low levels, be very vague (habitat/color). 
    At high levels, mention a unique ability or signature move. 
    DO NOT mention the name or its evolution stages. 
    Keep it under 15 words. 
    Format: "DEXTER HINT: [Your hint]"`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "SIGNAL INTERFERENCE. NO DATA AVAILABLE.";
  } catch (error) {
    console.error("Gemini Hint Error:", error);
    return "DEXTER: LORE DATABASE OFFLINE.";
  }
};

export const redactFlavorText = async (flavorText: string, pokemonName: string) => {
  try {
    const ai = getAI();
    const prompt = `Redact the Pokemon name "${pokemonName}" and its specific category (e.g. "The Mouse Pokemon") from this text: "${flavorText}". 
    Replace them with "[REDACTED]". Keep all other words exactly the same. Output ONLY the redacted text.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || flavorText.replace(new RegExp(pokemonName, 'gi'), '[REDACTED]');
  } catch (error) {
    return flavorText.replace(new RegExp(pokemonName, 'gi'), '[REDACTED]');
  }
};

export const getTwoTruths = async (pokemon: any) => {
  try {
    const ai = getAI();
    const prompt = `For the Pokemon ${pokemon.name}, generate 3 very short statements (max 10 words each). 
    2 must be true facts about its biology, moves, or types. 
    1 must be a LIE—something plausible but definitely false (e.g., wrong type, wrong weight).
    Return them as a JSON array of objects with "statement" and "isLie" (boolean).`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              statement: { type: Type.STRING },
              isLie: { type: Type.BOOLEAN }
            },
            required: ["statement", "isLie"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Two Truths Error:", error);
    return [
      { statement: "This Pokemon is a Fire type.", isLie: false },
      { statement: "This Pokemon can fly.", isLie: true },
      { statement: "This Pokemon lives in caves.", isLie: false }
    ];
  }
};

export const getAkinatorQuestion = async (history: { question: string; answer: string }[], targetName: string) => {
  try {
    const ai = getAI();
    const historyText = history.map(h => `Q: ${h.question} A: ${h.answer}`).join("\n");
    const prompt = `You are Dexter trying to guess a Pokemon. The user is thinking of ${targetName}.
    Based on this history of your questions so far:
    ${historyText}
    
    Ask the NEXT best short yes/no question to identify this Pokemon. 
    If you are 90% sure, your question should be "Are you [Pokemon Name]?". 
    Otherwise, ask about its appearance, type, or abilities. 
    Keep it to one short sentence.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "Is it a basic Pokemon?";
  } catch (error) {
    return "Is it a legendary?";
  }
};

export const getPostMatchLore = async (pokemonName: string) => {
  try {
    const ai = getAI();
    const prompt = `Provide one rare or funny fact about the Pokemon ${pokemonName} that a trainer should know. Keep it short (1 sentence). Start with "DID YOU KNOW?"`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "";
  } catch (error) {
    return "";
  }
};

export const getMissionBriefing = async (mode: string) => {
  try {
    const ai = getAI();
    const prompt = `You are Professor Oak. Give a short, 1-sentence urgent mission briefing for a trainer starting a "${mode}" mission. Use classic anime style. Keep it under 20 words.`;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "Trainer! We need your help to identify this mysterious signal!";
  } catch (error) {
    return "New signal detected. Commencing analysis.";
  }
};

export const getComparisonHint = async (target: string, guess: string) => {
  try {
    const ai = getAI();
    const prompt = `The user guessed "${guess}" but the correct Pokemon is "${target}". As Dexter the AI Pokedex, give a 1-sentence hint that compares the two or explains a key difference without naming "${target}". e.g. "Similar type, but your guess is much heavier than this target."`;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "Incorrect analysis. Target signature differs from your guess.";
  } catch (error) {
    return "Analysis failed. Try again.";
  }
};
