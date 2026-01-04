import { GoogleGenAI } from "@google/genai";

// Initialize the Google GenAI client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const aiService = {
  /**
   * Generates a simple, student-friendly explanation for financial concepts.
   */
  explainConcept: async (concept: string): Promise<string> => {
    try {
      const prompt = `Explain the financial concept "${concept}" to a college student who has zero finance knowledge. 
      Use a fun, relatable analogy (like food, college life, or sports). 
      Keep it under 60 words. 
      Tone: Encouraging and simple. Language: English.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      return response.text || "Could not generate explanation.";
    } catch (error) {
      console.error("AI Service Error:", error);
      return "Investing is like planting a tree. You water it a little bit every day, and eventually, it grows big.";
    }
  },

  /**
   * Generates a quick daily financial tip.
   * Updated to match specific requirements for motivation and actionability.
   */
  getQuickTip: async (): Promise<string> => {
    try {
      const prompt = `Generate a quick financial tip in English for a first-time investor in India.

Requirements:
- 1-3 sentences max
- Actionable (they can do it today)
- Encouraging and positive
- Relevant to their ₹10-100 investment range
- Include 1 practical example

Make it motivating, like something a friend would say. No jargon.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      return response.text || "Skip one chai today and invest that ₹10. Your future self will thank you!";
    } catch (error) {
      console.error("AI Service Error:", error);
      return "Small steps lead to big journeys. Start with just ₹10!";
    }
  },

  /**
   * Chat function for the FAQ section.
   */
  askQuestion: async (question: string): Promise<string> => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are a helpful, encouraging financial mentor for students named 'Pocket Guru'. 
        Answer this user question in English: "${question}". 
        Keep the answer safe, conservative, and education-focused. 
        Do not give specific buy/sell recommendations. 
        Keep it short (max 3 sentences).`,
      });
      return response.text || "I didn't quite catch that, but remember: start small!";
    } catch (error) {
       console.error("AI Service Error:", error);
       return "I'm having trouble connecting right now. Please try again later.";
    }
  },

  /**
   * Dynamic Lesson Generator for Topic-Based Learning.
   */
  generateLesson: async (topic: string): Promise<string> => {
    try {
      const prompt = `Create a beginner-friendly lesson in English on: "${topic}"

Requirements:
- Assume the reader has no financial background
- Use simple, everyday language
- Include 1 Indian real-life example
- Include 1 simple analogy
- Keep under 180 words
- Add 3 action points they can take today
- Use bullet points for clarity
- Add 1 encouraging sentence at the end
- Format the output as clean HTML (using <p>, <ul>, <li>, <strong> tags only, no markdown code blocks).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      let text = response.text || "";
      // Simple cleanup to remove markdown code blocks if the model returns them
      text = text.replace(/```html/g, '').replace(/```/g, '');

      return text || `<p>Sorry, we couldn't generate a lesson for this topic right now.</p>`;
    } catch (error) {
      console.error("AI Service Error:", error);
      return `<p>We are having trouble connecting to the AI teacher.</p>`;
    }
  }
};