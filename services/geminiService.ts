import { GoogleGenAI, Schema, Type } from "@google/genai";
import { HarEntry, AnalysisResult } from "../types";

// Initialize Gemini
// Note: process.env.API_KEY is injected by the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const ANALYSIS_SYSTEM_INSTRUCTION = `
You are an expert Network Security Engineer and Backend Developer. 
Your job is to analyze HTTP requests from a HAR file (User Session).

You need to deconstruct the request and explain it in these ways:
1. **Summary**: Plain English explanation of the User Action (e.g., "User created a new admin account named 'John'").
2. **Error Analysis**: If the response status code is 4xx or 5xx, specifically explain the error, why it likely happened based on the request/response, and suggest potential fixes.
3. **Reproduction**: Machine Instructions/Reproduction code in multiple languages to programmatically reproduce this exact action.

Be concise, technical but accessible. Focus on the payload, the intent, and any failure reasons.
`;

export const analyzeEntry = async (entry: HarEntry, curlCommand: string): Promise<AnalysisResult> => {
  try {
    const model = 'gemini-3-flash-preview';
    
    // Prepare a simplified context to save tokens, focusing on what matters
    const context = {
      method: entry.request.method,
      url: entry.request.url,
      payload: entry.request.postData?.text || "No Body",
      responseStatus: entry.response.status,
      responseStatusText: entry.response.statusText,
      curl: curlCommand
    };

    const prompt = `
    Analyze the following HTTP Request context:
    ${JSON.stringify(context, null, 2)}

    Determine the likely user intent (Add, Delete, Update, View, Login, etc.).
    
    If the 'responseStatus' is 4xx or 5xx, provide a detailed 'errorAnalysis' explaining the failure and next steps. 
    If successful (2xx/3xx), 'errorAnalysis' should be an empty string.

    Provide reproduction scripts for the following languages:
    - Python (using 'requests')
    - TypeScript (using 'fetch')
    - Go (using 'net/http')
    - Rust (using 'reqwest')
    - PHP (using 'curl' or 'guzzle')

    Ensure headers, cookies, and payloads are correctly formatted in the code.
    `;

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        summary: {
          type: Type.STRING,
          description: "A concise, plain English description of what the user did.",
        },
        errorAnalysis: {
          type: Type.STRING,
          description: "If failed (4xx/5xx), explain why and how to fix. If successful, return empty string.",
        },
        pythonCode: { type: Type.STRING, description: "Python reproduction code" },
        typescriptCode: { type: Type.STRING, description: "TypeScript reproduction code" },
        goCode: { type: Type.STRING, description: "Go reproduction code" },
        rustCode: { type: Type.STRING, description: "Rust reproduction code" },
        phpCode: { type: Type.STRING, description: "PHP reproduction code" },
      },
      required: ["summary", "errorAnalysis", "pythonCode", "typescriptCode", "goCode", "rustCode", "phpCode"],
    };

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: ANALYSIS_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2, // Low temperature for deterministic code generation
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as AnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return {
      summary: "Failed to analyze request.",
      errorAnalysis: "Could not generate error analysis.",
      pythonCode: "# Error generating reproduction code.",
      typescriptCode: "// Error generating reproduction code.",
      goCode: "// Error generating reproduction code.",
      rustCode: "// Error generating reproduction code.",
      phpCode: "// Error generating reproduction code.",
    };
  }
};
