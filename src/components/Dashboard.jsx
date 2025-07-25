// src/components/Dashboard.jsx - FINAL VERIFIED VERSION (Removed getAiFeedback import)

import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// --- Code Editor Imports ---
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { python } from '@codemirror/lang-python';
import { okaidia } from '@uiw/codemirror-theme-okaidia';

// --- PDF Imports ---
import { Document, Page } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';

// --- No AI Mentor Function needed here directly anymore ---
// (We moved the AI feedback logic directly into handleSessionComplete's try/catch)


// --- HELPER COMPONENT 1: Session Complete Modal (Unchanged) ---
const SessionCompleteModal = ({ onSave }) => {
  const [focusRating, setFocusRating] = useState(0);
  const [distraction, setDistraction] = useState('');
  const distractions = ['Phone', 'Social Media', 'My Thoughts', 'People'];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 animate-fadeInUp">
      <div className="bg-gray-800 p-8 rounded-lg text-center w-full max-w-sm space-y-6">
        <div><h2 className="text-2xl font-bold">Session Complete!</h2><p className="mt-2 text-white/80">Rate your focus:</p></div>
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map(star => (<button key={star} onClick={() => setFocusRating(star)}><svg className={`w-10 h-10 transition-colors ${focusRating >= star ? 'text-yellow-400' : 'text-gray-600 hover:text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg></button>))}
        </div>
        <div><p className="text-white/80">Main distraction?</p><div className="grid grid-cols-2 gap-2 mt-2">{distractions.map(d => (<button key={d} onClick={() => setDistraction(d)} className={`p-2 rounded-lg border-2 transition-colors ${distraction === d ? 'bg-blue-500 border-blue-400' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'}`}>{d}</button>))}</div></div>
        <button onClick={() => onSave(focusRating, distraction)} disabled={focusRating === 0 || distraction === ''} className="w-full p-3 bg-green-600 rounded-lg font-bold disabled:bg-gray-500 disabled:cursor-not-allowed">Save & Continue</button>
      </div>
    </div>
  );
};


// --- HELPER COMPONENT 2: The Fullscreen Sandbox (unchanged) ---
const FocusSandbox = ({ goal, mode, time, onEndSession, text, onTextChange, code, onCodeChange }) => {
  const [currentLanguage, setCurrentLanguage] = useState('JavaScript');
  const [languageExtension, setLanguageExtension] = useState(javascript());
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [numPages, setNumPages] = useState(null);

  const formatTime = (seconds) => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  
  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('Running your code...');
    const API_KEY = import.meta.env.VITE_RAPIDAPI_KEY;
    const languageIdMap = { 'JavaScript': 63, 'Python': 71, 'C++': 54, 'Java': 62 }; // Judge0 Language IDs
    const options = { method: 'POST', headers: { 'content-type': 'application/json', 'X-RapidAPI-Key': API_KEY, 'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com' }, body: JSON.stringify({ language_id: languageIdMap[currentLanguage], source_code: btoa(code), stdin: btoa(input) }) };
    try {
      const response = await fetch('https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=false', options);
      const submission = await response.json();
      if (submission.token) {
        let resultData;
        do { await new Promise(r => setTimeout(r, 1000)); const resultResponse = await fetch(`https://judge0-ce.p.rapidapi.com/submissions/${submission.token}?base64_encoded=true`, { headers: options.headers }); resultData = await resultResponse.json(); } while (resultData.status.id <= 2);
        if (resultData.stdout) setOutput(atob(resultData.stdout));
        else if (resultData.stderr) setOutput(`Error:\n${atob(resultData.stderr)}`);
        else if (resultData.compile_output) setOutput(`Compilation Error:\n${atob(resultData.compile_output)}`);
        else setOutput('Execution finished with no output.');
      } else { setOutput(`Error creating submission: ${JSON.stringify(submission)}`); }
    } catch (err) { setOutput(`API Error: ${err.message}`); }
    setIsRunning(false);
  };
  
  const languageMap = { 'JavaScript': javascript(), 'Python': python(), 'C++': cpp(), 'Java': java() }; // CodeMirror extensions
  const onLanguageChange = (langName) => {
    setCurrentLanguage(langName);
    setLanguageExtension(languageMap[langName]);
  };

  const onFileChange = (event) => { const file = event.target.files[0]; if (file && file.type === "application/pdf") { setPdfFile(file); } else { alert("Please select a PDF file."); } };
  const onDocumentLoadSuccess = ({ numPages }) => { setNumPages(numPages); };

  const renderContent = () => {
    switch (mode) {
      case 'study':
        return (<div className="flex-grow flex gap-4 h-[calc(100%-60px)]"><div className="w-1/2 h-full bg-gray-800/50 rounded-lg flex flex-col items-center justify-center text-white/50 border border-white/10 p-2"><input type="file" onChange={onFileChange} className="mb-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" /><div className="w-full h-full overflow-y-auto">{pdfFile ? (<Document file={pdfFile} onLoadSuccess={onDocumentLoadSuccess}>{Array.from(new Array(numPages), (el, index) => (<Page key={`page_${index + 1}`} pageNumber={index + 1} renderTextLayer={false} />))}</Document>) : <p>Upload a PDF to begin.</p>}</div></div><textarea value={text} onChange={(e) => onTextChange(e.target.value)} placeholder="Take your notes here..." className="w-1/2 h-full p-6 bg-gray-800 text-white/90 text-lg rounded-lg border-none focus:outline-none resize-none" /></div>);
      case 'code':
        return (<div className="flex-grow grid grid-cols-2 gap-4 h-[calc(100%-60px)]"><div className="flex flex-col h-full"><div className="flex justify-between items-center p-2 bg-gray-800 rounded-t-lg"><select onChange={(e) => onLanguageChange(e.target.value)} value={currentLanguage} className="bg-gray-700 text-white border-none rounded">{Object.keys(languageMap).map(lang => <option key={lang}>{lang}</option>)}</select><button onClick={handleRunCode} disabled={isRunning} className="px-4 py-1 bg-green-600 rounded disabled:bg-gray-500">{isRunning ? 'Running...' : 'Run Code'}</button></div><CodeMirror value={code} height="100%" extensions={[languageExtension]} onChange={(value) => onCodeChange(value)} theme={okaidia} style={{ flexGrow: 1, overflow: 'hidden', borderRadius: '0 0 0.5rem 0.5rem' }} /></div><div className="flex flex-col h-full gap-4"><div className="flex flex-col h-1/2"><label className="p-2 bg-gray-800 rounded-t-lg">Input (stdin)</label><textarea value={input} onChange={(e) => setInput(e.target.value)} className="w-full h-full p-2 bg-gray-900/80 rounded-b-lg border-none focus:outline-none resize-none font-mono" /></div><div className="flex flex-col h-1/2"><label className="p-2 bg-gray-800 rounded-t-lg">Output</label><pre className="w-full h-full p-2 bg-black/80 rounded-b-lg border-none whitespace-pre-wrap font-mono">{output}</pre></div></div></div>);
      case 'writing': default:
        return <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="This is your Deep Work Zone..." className="w-full h-full flex-grow p-8 bg-gray-800 text-white/90 text-xl rounded-lg border-none focus:outline-none resize-none" />;
    }
  };

  return (<div className="fixed inset-0 w-full h-full flex flex-col items-center justify-center p-8 text-white bg-gray-900"><div className="w-full h-full max-w-7xl flex flex-col"><div className="flex justify-between items-center mb-4 text-white/80"><p className="text-lg">Goal: <span className="font-bold text-white">{goal}</span></p><div className="flex items-center gap-4"><p className="text-2xl font-bold text-white">{formatTime(time)}</p><button onClick={onEndSession} className="p-2 px-4 bg-red-600/80 rounded-lg font-bold">End Session</button></div></div>{renderContent()}<p className="text-center text-white/40 text-sm mt-4">Press 'Esc' to exit fullscreen mode.</p></div></div>);
};

// --- MAIN DASHBOARD COMPONENT ---
function Dashboard({ showJourneyPage, showConnectPage, showAiMentorPage }) { // All three navigation props
  const [duration, setDuration] = useState(1500);
  const [time, setTime] = useState(duration); 
  const [isActive, setIsActive] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false); // For AI feedback
  const [feedback, setFeedback] = useState(''); // For AI feedback
  const [goal, setGoal] = useState('');
  const [mode, setMode] = useState('writing');
  const [writingText, setWritingText] = useState('');
  const [code, setCode] = useState('// Your code here...');

  // Timer Effect
  useEffect(() => { let interval = null; if (isActive && time > 0) { interval = setInterval(() => { setTime(t => t - 1); }, 1000); } else if (isActive && time === 0) { setIsActive(false); setShowModal(true); } return () => clearInterval(interval); }, [isActive, time]);
  
  // Fullscreen Effect
  useEffect(() => {
    const goFullScreen = () => { if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen(); };
    const exitFullScreen = () => { if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen(); }; 
    if (isActive) { goFullScreen(); } else { exitFullScreen(); }
    return () => exitFullScreen();
  }, [isActive]);

  const handleStartSession = () => { if (goal.trim() === '') { alert("Please set a goal for your session."); return; } setTime(duration); setIsActive(true); };
  const handleEndSessionEarly = () => { if (window.confirm("End session early? Progress will not be saved.")) { setIsActive(false); resetTimer(); } };
  
  const handleSessionComplete = async (focusRating, distraction) => {
    const user = auth.currentUser;
    if (user && focusRating > 0 && distraction) {
      try {
        const sessionContent = mode === 'code' ? code : writingText;
        await addDoc(collection(db, 'users', user.uid, 'focusSessions'), {
          duration: duration,
          focusRating: focusRating,
          distraction: distraction,
          goal: goal,
          mode: mode,
          content: sessionContent,
          completedAt: serverTimestamp()
        });
        console.log("Session with content saved!");

        // --- Get AI Feedback (Only if session was successfully saved) ---
        // We moved the getAiFeedback function to aiMentor.js
        const aiFeedback = await getGeneralAiHelp(`User just completed a ${duration/60} minute session with goal "${goal}", focus rating ${focusRating}/5, and distraction "${distraction}". Provide 2-3 sentences of positive and actionable feedback specific to this.`); // Using general help for feedback
        setFeedback(aiFeedback);
        setShowFeedbackModal(true); // Show the AI Feedback Modal
      } catch (error) { 
        console.error("Error saving session or getting AI feedback: ", error); 
        // Show default modal if AI fails
        setShowFeedbackModal(true);
        setFeedback("Great work completing the session! Keep up the momentum.");
      }
    }
    setShowModal(false); // Hide the rating modal
    resetTimer(); // Reset the timer and clear content
  };

  const resetTimer = () => {
    setIsActive(false);
    setTime(duration);
    setGoal('');
    setWritingText('');
    setCode('// Your code here...');
    setShowModal(false); // Ensure session complete modal is hidden
    setShowFeedbackModal(false); // Ensure AI feedback modal is hidden
  };
  
  const durationOptions = [ { label: '10 min', seconds: 600 }, { label: '25 min', seconds: 1500 }, { label: '50 min', seconds: 3000 }, ];

  if (isActive) {
    return <FocusSandbox goal={goal} mode={mode} time={time} onEndSession={handleEndSessionEarly} text={writingText} onTextChange={setWritingText} code={code} onCodeChange={setCode} />;
  }

  return (
    <>
      {showModal && <SessionCompleteModal onSave={handleSessionComplete} />}
      {/* AI Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 animate-fadeInUp">
            <div className="bg-gray-800 p-8 rounded-lg text-center w-full max-w-sm space-y-4">
                <h2 className="text-xl font-bold">Your AI Coach Says:</h2>
                <p className="text-white/90 italic">"{feedback}"</p>
                <button onClick={() => setShowFeedbackModal(false)} className="w-full p-3 bg-blue-600 rounded-lg font-bold">
                    Got it!
                </button>
            </div>
        </div>
      )}

      <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 text-white">
        <div className="w-full max-w-2xl p-8 space-y-6 rounded-2xl shadow-lg bg-black/20 backdrop-blur-xl animate-fadeInUp">
          <div className="text-center"><h1 className="text-4xl font-black tracking-wider">Ready for Deep Work?</h1><p className="text-white/70 mt-2">Configure your session to begin.</p></div>
          <div className="space-y-2"><label htmlFor="goal" className="block text-sm font-medium text-white/80">1. What is your goal?</label><input id="goal" type="text" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g., Solve LeetCode problem #7" className="w-full p-3 bg-gray-900/80 text-white rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div className="space-y-2"><label className="block text-sm font-medium text-white/80">2. What is your tool?</label><div className="grid grid-cols-3 gap-2"><button onClick={() => setMode('writing')} className={`p-3 rounded-lg border-2 ${mode === 'writing' ? 'bg-blue-500 border-blue-400' : 'bg-gray-700 border-gray-600'}`}>Writing</button><button onClick={() => setMode('study')} className={`p-3 rounded-lg border-2 ${mode === 'study' ? 'bg-blue-500 border-blue-400' : 'bg-gray-700 border-gray-600'}`}>Study</button><button onClick={() => setMode('code')} className={`p-3 rounded-lg border-2 ${mode === 'code' ? 'bg-blue-500 border-blue-400' : 'bg-gray-700 border-gray-600'}`}>Code</button></div></div>
          <div className="space-y-2"><label className="block text-sm font-medium text-white/80">3. Choose your duration</label><div className="grid grid-cols-3 gap-2">{durationOptions.map((option) => (<button key={option.seconds} onClick={() => setDuration(option.seconds)} className={`p-3 rounded-lg border-2 transition-colors ${ duration === option.seconds ? 'bg-blue-500 border-blue-400' : 'bg-gray-700 border-gray-600 hover:bg-gray-600' }`}>{option.label}</button>))}</div></div>
          
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button onClick={handleStartSession} className="sm:col-span-1 p-4 text-xl font-bold rounded-lg transition-all duration-300 ease-in-out hover:scale-105 bg-gradient-to-r from-deep-space to-star-blue">Focus</button>
            <button onClick={showJourneyPage} className="sm:col-span-1 p-4 text-xl font-bold rounded-lg transition-all duration-300 ease-in-out hover:scale-105 bg-gradient-to-r from-cosmic-purple to-nebula-pink">Journey</button>
            <button onClick={showConnectPage} className="sm:col-span-1 p-4 text-xl font-bold rounded-lg transition-all duration-300 ease-in-out hover:scale-105 bg-gradient-to-r from-purple-500 to-pink-500">Community</button>
            {/* AI Mentor Button - placed on its own row for prominence */}
            <button onClick={showAiMentorPage} className="sm:col-span-3 mt-4 p-4 text-xl font-bold rounded-lg transition-all duration-300 ease-in-out hover:scale-105 bg-gradient-to-r from-teal-500 to-cyan-600">AI Mentor</button> 
          </div>
        </div>
        <button onClick={() => signOut(auth)} className="mt-8 p-2 px-4 text-sm bg-red-600/80 rounded-lg font-bold hover:bg-red-500 transition-all">Log Out</button>
      </div>
    </>
  );
}

export default Dashboard;