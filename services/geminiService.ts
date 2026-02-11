import { GoogleGenAI, Type } from "@google/genai";
import { Question, Answer } from "../types";

// Fallback data in case API fails or key is missing
const FALLBACK_QUESTIONS: Question[] = [
  {
    text: "Mitä suomalainen mies tekee ensimmäisenä aamulla?",
    answers: [
      { id: "1", text: "Keittää kahvia", points: 10, revealed: false },
      { id: "2", text: "Käy vessassa", points: 8, revealed: false },
      { id: "3", text: "Katsoo puhelinta", points: 4, revealed: false },
      { id: "4", text: "Pesee hampaat", points: 2, revealed: false },
    ]
  },
  {
    text: "Mainitse asia, jota ilman sauna ei ole sauna.",
    answers: [
      { id: "1", text: "Kiuas", points: 10, revealed: false },
      { id: "2", text: "Löylykauha", points: 8, revealed: false },
      { id: "3", text: "Vihta / Vasta", points: 4, revealed: false },
      { id: "4", text: "Lämpö", points: 2, revealed: false },
    ]
  }
];

export const generateQuestion = async (previousQuestions: string[] = []): Promise<Question> => {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    console.warn("No API Key found. Using fallback data.");
    return Promise.resolve(FALLBACK_QUESTIONS[Math.floor(Math.random() * FALLBACK_QUESTIONS.length)]);
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const prompt = `
      Generate a 'Family Feud' style survey question in Finnish. 
      The question should be something 100 Finnish people might answer. 
      Include exactly 4 answers.
      The answers should be common, funny, or culturally specific to Finland.
      
      IMPORTANT: Do not generate any of the following questions or anything very similar:
      ${previousQuestions.join("; ")}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: {
              type: Type.STRING,
              description: "The survey question in Finnish",
            },
            answers: {
              type: Type.ARRAY,
              description: "List of 4 answers sorted by popularity (most popular first)",
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING, description: "Answer text" },
                  points: { type: Type.NUMBER, description: "Estimated popularity (used for sorting only)" }
                },
                required: ["text", "points"]
              }
            }
          },
          required: ["question", "answers"]
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      
      // Transform into our internal format
      let mappedAnswers: Answer[] = data.answers.map((a: any, index: number) => ({
        id: `ans-${Date.now()}-${index}`,
        text: a.text,
        points: a.points, // Temporary, used for sorting
        revealed: false
      }));

      // Sort by points descending to ensure we get the "best" answers first
      mappedAnswers.sort((a, b) => b.points - a.points);

      // Limit to exactly 4 answers
      const limitedAnswers = mappedAnswers.slice(0, 4);

      // Override points with fixed values: 10, 8, 4, 2
      const FIXED_POINTS = [10, 8, 4, 2];
      const finalAnswers = limitedAnswers.map((ans, index) => ({
        ...ans,
        points: FIXED_POINTS[index] || 2
      }));

      return {
        text: data.question,
        answers: finalAnswers
      };
    }
    
    throw new Error("No text returned from Gemini");

  } catch (error) {
    console.error("Gemini API Error:", error);
    return FALLBACK_QUESTIONS[Math.floor(Math.random() * FALLBACK_QUESTIONS.length)];
  }
};