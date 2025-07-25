// src/App.jsx - ADVANCED & DYNAMIC VERSION

import { useState, useEffect } from 'react'; // <-- NEW: Import useEffect
import { auth } from '../firebase'; // <-- Corrected Path
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

// Custom Hook for Parallax Effect
const useParallax = () => {
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const x = (clientX - innerWidth / 2) / innerWidth * 30; // 30 is the parallax intensity
      const y = (clientY - innerHeight / 2) / innerHeight * 30;
      document.body.style.backgroundPosition = `${50 - x}% ${50 - y}%`;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
};

function App() {
  useParallax(); // <-- NEW: Activate our parallax hook
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // ... (Your handleSignUp and handleLogIn functions remain exactly the same)
  const handleSignUp = async (e) => { e.preventDefault(); try { const userCredential = await createUserWithEmailAndPassword(auth, email, password); console.log("User signed up successfully:", userCredential.user); } catch (error) { console.error("Error signing up:", error.message); } };
  const handleLogIn = async (e) => { e.preventDefault(); try { const userCredential = await signInWithEmailAndPassword(auth, email, password); console.log("User logged in successfully:", userCredential.user); } catch (error) { console.error("Error logging in:", error.message); } };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4">
      <div 
        className="w-full max-w-md p-8 space-y-6 rounded-2xl shadow-lg
                   bg-black/20 backdrop-blur-xl animate-fadeInUp"
      >
        <div className="text-center">
          <h1 className="text-4xl font-black text-white tracking-wider">FlowState Journey</h1>
          <p className="text-white/70 mt-2">Enter the gateway to your focus.</p>
        </div>
        
        <form className="flex flex-col gap-6"> {/* Increased gap */}
          {/* Input with new wrapper for gradient border effect */}
          <div className="p-0.5 rounded-lg transition-all duration-300 input-focus-gradient">
            <input 
              type="email" 
              placeholder="Email"
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-gray-900/80 text-white rounded-[7px] border-none focus:outline-none"
            />
          </div>
          {/* Input with new wrapper for gradient border effect */}
          <div className="p-0.5 rounded-lg transition-all duration-300 input-focus-gradient">
            <input 
              type="password" 
              placeholder="Password"
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-gray-900/80 text-white rounded-[7px] border-none focus:outline-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            {/* Sign Up Button with new colors and effects */}
            <button 
              onClick={handleSignUp}
              className="w-full p-3 text-white rounded-lg font-bold relative overflow-hidden
                         bg-gradient-to-r from-cosmic-purple to-nebula-pink 
                         transition-all duration-300 ease-in-out
                         hover:scale-105 button-glow-effect"
            >
              Sign Up
            </button>
            {/* Log In Button with new colors and effects */}
            <button 
              onClick={handleLogIn}
              className="w-full p-3 text-white rounded-lg font-bold relative overflow-hidden
                         bg-gradient-to-r from-deep-space to-star-blue
                         transition-all duration-300 ease-in-out
                         hover:scale-105 button-glow-effect"
            >
              Log In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;