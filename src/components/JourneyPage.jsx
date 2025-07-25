// src/components/JourneyPage.jsx - FINAL VERSION with Back Button

import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { okaidia } from '@uiw/codemirror-theme-okaidia';

// --- HELPER COMPONENT: The Modal to View/Download Content (Unchanged) ---
const ViewContentModal = ({ session, onClose }) => {
  if (!session) return null;

  const handleDownload = () => {
    const fileExtension = session.mode === 'code' ? '.js' : '.txt';
    const fileName = `${session.goal.replace(/ /g, '_')}${fileExtension}`;
    const blob = new Blob([session.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 animate-fadeInUp">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-2xl h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
            <div>
                <h3 className="text-xl font-bold text-white">{session.goal}</h3>
                <p className="text-sm text-white/60">{new Date(session.completedAt?.toDate()).toLocaleString()}</p>
            </div>
            <div>
                <button onClick={handleDownload} className="p-2 px-4 mr-2 bg-green-600 rounded-lg font-bold">Download</button>
                <button onClick={onClose} className="p-2 px-4 bg-red-600 rounded-lg font-bold">Close</button>
            </div>
        </div>
        <div className="flex-grow bg-gray-900 rounded-lg overflow-auto">
            {session.mode === 'code' ? (
                <CodeMirror value={session.content || ''} theme={okaidia} extensions={[javascript()]} readOnly={true} />
            ) : (
                <pre className="whitespace-pre-wrap p-4 text-white/90">{session.content}</pre>
            )}
        </div>
      </div>
    </div>
  );
};

// --- MAIN JOURNEY PAGE COMPONENT (with Back Button) ---
function JourneyPage({ showDashboard }) { // <-- UPDATED to accept the prop
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const q = query(collection(db, 'users', user.uid, 'focusSessions'), orderBy('completedAt', 'desc'));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const sessionsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSessions(sessionsData);
        setLoading(false);
      }, (error) => { console.error("Firestore listener error:", error); setLoading(false); });
      return () => unsubscribe();
    }
  }, []);

  return (
    <>
      {selectedSession && <ViewContentModal session={selectedSession} onClose={() => setSelectedSession(null)} />}
      <div className="w-full max-w-4xl p-8 space-y-6 rounded-2xl shadow-lg bg-black/20 backdrop-blur-xl animate-fadeInUp">
        
        {/* THIS IS THE NEW HEADER WITH THE BACK BUTTON */}
        <div className="flex justify-between items-center">
            <h2 className="text-3xl font-black text-white tracking-wider">Your Session Log</h2>
            <button 
                onClick={showDashboard} 
                className="p-2 px-4 bg-gray-600/80 rounded-lg font-bold hover:bg-gray-500 transition-colors"
            >
                Back to Dashboard
            </button>
        </div>
        
        {loading && <p className="text-center text-white/70">Loading your history...</p>}

        {!loading && sessions.length === 0 ? (
            <p className="text-center text-white/70">You haven't completed any sessions yet. Go back to the dashboard to start your first one!</p>
        ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {sessions.map(session => (
                    <div key={session.id} className="bg-gray-900/50 p-4 rounded-lg flex justify-between items-center">
                        <div>
                            <p className="font-bold text-white">{session.goal}</p>
                            <p className="text-sm text-white/60">{new Date(session.completedAt?.toDate()).toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className={`w-5 h-5 ${i < session.focusRating ? 'text-yellow-400' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                ))}
                            </div>
                            <button onClick={() => setSelectedSession(session)} className="p-2 px-4 bg-blue-600 rounded-lg font-bold">View</button>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </>
  );
}

export default JourneyPage;