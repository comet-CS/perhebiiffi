import { GoogleGenAI, Type } from "@google/genai";
import { Question, Answer } from "../types";

// Expanded fallback data to ensure the game is fun even without an API key
const FALLBACK_QUESTIONS: Question[] = [
  {
    text: "Mitä suomalainen mies tekee ensimmäisenä aamulla?",
    answers: [
      { id: "fb-1-1", text: "Keittää kahvia", points: 40, revealed: false },
      { id: "fb-1-2", text: "Käy vessassa", points: 30, revealed: false },
      { id: "fb-1-3", text: "Katsoo puhelinta", points: 20, revealed: false },
      { id: "fb-1-4", text: "Pesee hampaat", points: 10, revealed: false },
    ]
  },
  {
    text: "Mainitse asia, jota ilman sauna ei ole sauna.",
    answers: [
      { id: "fb-2-1", text: "Kiuas", points: 40, revealed: false },
      { id: "fb-2-2", text: "Löylykauha / Kiulu", points: 30, revealed: false },
      { id: "fb-2-3", text: "Vihta / Vasta", points: 20, revealed: false },
      { id: "fb-2-4", text: "Lämpö / Hiki", points: 10, revealed: false },
    ]
  },
  {
    text: "Mikä ärsyttää eniten julkisessa liikenteessä?",
    answers: [
      { id: "fb-3-1", text: "Haju / Hiki", points: 40, revealed: false },
      { id: "fb-3-2", text: "Myöhästely", points: 30, revealed: false },
      { id: "fb-3-3", text: "Meteli / Puhelin", points: 20, revealed: false },
      { id: "fb-3-4", text: "Ruuhka", points: 10, revealed: false },
    ]
  },
  {
    text: "Mitä suomalainen sanoo, kun astuu vahingossa toisen varpaille?",
    answers: [
      { id: "fb-4-1", text: "Oho", points: 40, revealed: false },
      { id: "fb-4-2", text: "Anteeksi", points: 30, revealed: false },
      { id: "fb-4-3", text: "Ei se mitään", points: 20, revealed: false },
      { id: "fb-4-4", text: "*Muminaa*", points: 10, revealed: false },
    ]
  },
  {
    text: "Asia, jota ilman ei voi mennä mökille?",
    answers: [
      { id: "fb-5-1", text: "Makkara", points: 40, revealed: false },
      { id: "fb-5-2", text: "Kalja / Alkoholi", points: 30, revealed: false },
      { id: "fb-5-3", text: "Hyttysmyrkky", points: 20, revealed: false },
      { id: "fb-5-4", text: "Uikkarit", points: 10, revealed: false },
    ]
  },
  {
    text: "Suosituin pizzatäyte Suomessa?",
    answers: [
      { id: "fb-6-1", text: "Kinkku", points: 40, revealed: false },
      { id: "fb-6-2", text: "Ananas", points: 30, revealed: false },
      { id: "fb-6-3", text: "Aura-juusto", points: 20, revealed: false },
      { id: "fb-6-4", text: "Pepperoni", points: 10, revealed: false },
    ]
  },
  {
    text: "Mitä teet, jos näet naapurin rappukäytävässä?",
    answers: [
      { id: "fb-7-1", text: "Välttelet katsekontaktia", points: 40, revealed: false },
      { id: "fb-7-2", text: "Moikkaat hiljaa", points: 30, revealed: false },
      { id: "fb-7-3", text: "Odotat että menee pois", points: 20, revealed: false },
      { id: "fb-7-4", text: "Tuijotat lattiaa", points: 10, revealed: false },
    ]
  },
  {
    text: "Paras tapa viettää perjantai-ilta?",
    answers: [
      { id: "fb-8-1", text: "Sauna", points: 40, revealed: false },
      { id: "fb-8-2", text: "Kotisohva / TV", points: 30, revealed: false },
      { id: "fb-8-3", text: "Baari / Bileet", points: 20, revealed: false },
      { id: "fb-8-4", text: "Nukkuminen", points: 10, revealed: false },
    ]
  },
  {
    text: "Yleisin syy myöhästyä töistä tai koulusta?",
    answers: [
      { id: "fb-9-1", text: "Nukuin pommiin", points: 40, revealed: false },
      { id: "fb-9-2", text: "Bussi myöhässä", points: 30, revealed: false },
      { id: "fb-9-3", text: "Ruuhka", points: 20, revealed: false },
      { id: "fb-9-4", text: "Krapula", points: 10, revealed: false },
    ]
  },
  {
    text: "Mitä löytyy jokaisen opiskelijan jääkaapista?",
    answers: [
      { id: "fb-10-1", text: "Valo", points: 40, revealed: false },
      { id: "fb-10-2", text: "Ketsuppi", points: 30, revealed: false },
      { id: "fb-10-3", text: "Olut / Lonkero", points: 20, revealed: false },
      { id: "fb-10-4", text: "Vanhaa ruokaa", points: 10, revealed: false },
    ]
  },
  {
    text: "Mainitse asia, jota ilman et voi elää.",
    answers: [
      { id: "fb-11-1", text: "Puhelin", points: 40, revealed: false },
      { id: "fb-11-2", text: "Kahvi", points: 30, revealed: false },
      { id: "fb-11-3", text: "Perhe / Kaverit", points: 20, revealed: false },
      { id: "fb-11-4", text: "Happi", points: 10, revealed: false },
    ]
  },
  {
    text: "Mitä teet, kun netti katkeaa?",
    answers: [
      { id: "fb-12-1", text: "Kiroilet", points: 40, revealed: false },
      { id: "fb-12-2", text: "Käynnistät reitittimen uudelleen", points: 30, revealed: false },
      { id: "fb-12-3", text: "Vaihdat mobiilidataan", points: 20, revealed: false },
      { id: "fb-12-4", text: "Odotat", points: 10, revealed: false },
    ]
  }
];

// Helper to pick a random fallback question excluding history
const getFallbackQuestion = (history: string[]): Question => {
  const availableQuestions = FALLBACK_QUESTIONS.filter(q => !history.includes(q.text));
  
  // If we've used all fallbacks, reset and pick any random one
  const pool = availableQuestions.length > 0 ? availableQuestions : FALLBACK_QUESTIONS;
  
  const randomQuestion = pool[Math.floor(Math.random() * pool.length)];
  
  // Return a deep copy to avoid mutating the original FALLBACK_QUESTIONS when resetting the game
  return JSON.parse(JSON.stringify(randomQuestion));
};

export const generateQuestion = async (previousQuestions: string[] = []): Promise<Question> => {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    console.warn("No API Key found. Using fallback data.");
    return Promise.resolve(getFallbackQuestion(previousQuestions));
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const prompt = `
      You are generating content for "Perhe Biiffi", a Finnish version of Family Feud.
      
      Task: Generate a survey question in Finnish.
      Target Audience: Finnish people, humor similar to "Iha Just Imus" (slightly edgy, relatable, funny, or absurd but grounded in Finnish culture).
      
      Requirements:
      1. Question: Something 100 Finnish people might answer. Can be about daily life, stereotypes, celebrities, annoying things, etc.
      2. Answers: Exactly 4 answers.
      3. Answers should be sorted by popularity (most popular first).
      
      IMPORTANT: Do not generate any of these previous questions:
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

      // Override points with fixed values: 40, 30, 20, 10
      const FIXED_POINTS = [40, 30, 20, 10];
      const finalAnswers = limitedAnswers.map((ans, index) => ({
        ...ans,
        points: FIXED_POINTS[index] || 10
      }));

      return {
        text: data.question,
        answers: finalAnswers
      };
    }
    
    throw new Error("No text returned from Gemini");

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Use the smart fallback logic on error too
    return getFallbackQuestion(previousQuestions);
  }
};