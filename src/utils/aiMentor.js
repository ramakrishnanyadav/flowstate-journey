// src/utils/aiMentor.js - FINAL VERIFIED BRAIN

import { GoogleGenerativeAI } from "@google/generative-ai";

// Get the API key from our secret .env file
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Initialize the Google AI client
const genAI = new GoogleGenerativeAI(API_KEY);

export const getGeneralAiHelp = async (userInput) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

  const prompt = `
    You are "FlowState Mentor," a world-class AI assistant for students.
    A student is asking for your help. Their question is: "${userInput}".

    Your task is to provide a clear, helpful, and encouraging response.
    - If they ask for a roadmap, provide one with phases and resources.
    - If they ask for a concept explanation (like "explain recursion"), explain it simply with an analogy.
    - If they ask for advice (like "how to stop procrastinating"), give them actionable, psychological tips.
    - Always maintain a positive and supportive tone.
    - Structure your entire response using Markdown for clear formatting (use headings, bold text, and bullet points).
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error("Google AI Error:", error);
    if (error.message.includes('API key not valid')) {
        return "It seems there's an issue with the Google AI API Key. Please check the configuration in your .env file.";
    }
    return "Sorry, the AI mentor is currently unavailable. The connection to Google AI failed. Please try again in a moment.";
  }
};

// This function is used by Dashboard.jsx (post-session feedback)
export const getAiFeedback = async (goal, rating, distraction) => {
    const prompt = `
    A student just finished a focus session with the goal: "${goal}".
    They rated their focus as ${rating} out of 5.
    Their biggest distraction was "${distraction}".
    Act as an encouraging AI mentor.
    Provide 2-3 sentences of positive and actionable feedback.
    If the rating is high, praise them. If it's low, be encouraging.
    Give one specific, simple suggestion for their next session to help them combat their main distraction.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 80,
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error("AI feedback error:", error);
    if (error.response && error.response.status === 401) {
        return "It seems there's an issue with the API Key. Please check the configuration.";
    }
    if (error.response && error.response.status === 429) {
        return "The AI is receiving too many requests, or the account's credit limit has been reached. Please check your OpenAI account status.";
    }
    return "Great work completing the session! Keep up the momentum."; // Default safe message
  }
};