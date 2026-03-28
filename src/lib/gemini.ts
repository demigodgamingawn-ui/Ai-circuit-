import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export interface GeneratedProject {
  title: string;
  description: string;
  components: string[];
  connections: { from: string; to: string; pinFrom: string; pinTo: string }[];
  arduinoCode: string;
}

export async function generateProject(prompt: string): Promise<GeneratedProject> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a detailed Arduino project based on this idea: ${prompt}. 
    Return a JSON object with:
    - title: Project name
    - description: Short summary
    - components: List of electronic components (e.g., "Arduino Uno", "LED", "Resistor 220 Ohm")
    - connections: List of wire connections between components
    - arduinoCode: The complete Arduino C++ code`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          components: { type: Type.ARRAY, items: { type: Type.STRING } },
          connections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                from: { type: Type.STRING },
                to: { type: Type.STRING },
                pinFrom: { type: Type.STRING },
                pinTo: { type: Type.STRING },
              },
            },
          },
          arduinoCode: { type: Type.STRING },
        },
        required: ["title", "description", "components", "connections", "arduinoCode"],
      },
    },
  });

  return JSON.parse(response.text);
}
