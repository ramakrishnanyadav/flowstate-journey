// src/components/AiMentorPage.jsx - FINAL VERIFIED UI

import { useState } from 'react';
import { getGeneralAiHelp } from '../utils/aiMentor'; // <-- This is the correct import for this file
import ReactMarkdown from 'react-markdown';

function AiMentorPage({ showDashboard }) {
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGetAiHelp = async () => {
    if (aiQuery.trim() === '') {
      alert("Please ask a question or describe your goal for the AI mentor.");
      return;
    }
    setIsGenerating(true);
    setAiResponse('The AI mentor is thinking...');
    const help = await getGeneralAiHelp(aiQuery);
    setAiResponse(help);
    setIsGenerating(false);
  };

  return (
    <div className="w-full max-w-4xl p-8 space-y-8 rounded-2xl shadow-lg bg-black/20 backdrop-blur-xl animate-fadeInUp">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-black text-white tracking-wider">AI Mentor</h2>
        <button onClick={showDashboard} className="p-2 px-4 bg-gray-600/80 rounded-lg font-bold">Back to Dashboard</button>
      </div>

      <div className="bg-gray-900/50 p-6 rounded-lg space-y-4 border border-transparent hover:border-purple-600 transition-all duration-300">
        <h3 className="text-xl font-bold text-white">Your AI Learning Coach</h3>
        <p className="text-white/70 text-sm">Ask for a personalized roadmap, an explanation, or advice on any topic.</p>
        <textarea 
            value={aiQuery} 
            onChange={(e) => setAiQuery(e.target.value)} 
            placeholder="e.g., Explain Big O notation simply..." 
            className="w-full p-3 h-24 bg-gray-800 text-white rounded resize-none border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors" 
        />
        <button onClick={handleGetAiHelp} disabled={isGenerating} 
            className="w-full p-3 bg-gradient-to-r from-purple-700 to-pink-600 text-white rounded-lg font-bold 
                       transition-all duration-300 ease-in-out hover:scale-105 hover:from-purple-600 hover:to-pink-500 disabled:bg-gray-500 disabled:opacity-50"
        >
            {isGenerating ? 'Generating...' : 'Ask the AI Mentor'}
        </button>
        {aiResponse && (
            <div className="prose prose-invert max-w-none p-6 bg-black/40 rounded-lg mt-4 border border-purple-500/50 text-white/90 
                            prose-p:text-white/90 prose-headings:text-white prose-h1:text-white prose-h2:text-white prose-h3:text-white prose-li:text-white/90 prose-strong:text-white prose-a:text-blue-400">
                <ReactMarkdown>{aiResponse}</ReactMarkdown>
            </div>
        )}
      </div>
    </div>
  );
}

export default AiMentorPage;