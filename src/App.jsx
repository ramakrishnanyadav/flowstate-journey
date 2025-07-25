// src/App.jsx - FINAL VERIFIED VERSION (Import Fix)

import { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import LoadingSpinner from './components/LoadingSpinner';
import JourneyPage from './components/JourneyPage';
import ConnectPage from './components/ConnectPage';
import PostDetailsPage from './components/PostDetailsPage';
import AiMentorPage from "./components/AiMentorPage.jsx"; // <-- THE FIX IS HERE

function MainApp() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedPostId, setSelectedPostId] = useState(null);

  if (selectedPostId) {
    return <PostDetailsPage postId={selectedPostId} showConnectPage={() => setSelectedPostId(null)} />;
  }

  switch (currentPage) {
    case 'journey':
      return <JourneyPage showDashboard={() => setCurrentPage('dashboard')} />;
    case 'connect':
      return <ConnectPage showDashboard={() => setCurrentPage('dashboard')} onPostSelect={(postId) => setSelectedPostId(postId)} />;
    case 'aiMentor':
      return <AiMentorPage showDashboard={() => setCurrentPage('dashboard')} />;
    case 'dashboard':
    default:
      return <Dashboard 
                showJourneyPage={() => setCurrentPage('journey')} 
                showConnectPage={() => setCurrentPage('connect')}
                showAiMentorPage={() => setCurrentPage('aiMentor')} 
             />;
  }
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => { setUser(currentUser); setLoading(false); });
    return () => unsubscribe();
  }, []);

  if (loading) { return <LoadingSpinner />; }

  return user ? <MainApp /> : <AuthPage />;
}

export default App;