// src/components/ConnectPage.jsx - NOW ONLY FOR COMMUNITY CONNECT

import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, query, onSnapshot, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';

function ConnectPage({ showDashboard, onPostSelect }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');

  // Fetch all community posts from Firestore in real-time
  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(postsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching posts: ", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Handle creating a new community post
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (newPostTitle.trim() === '' || newPostContent.trim() === '') {
      alert("Please fill out both the title and the content.");
      return;
    }
    const user = auth.currentUser;
    if (user) {
      await addDoc(collection(db, 'posts'), { title: newPostTitle, content: newPostContent, authorEmail: user.email, authorId: user.uid, createdAt: serverTimestamp() });
      setNewPostTitle('');
      setNewPostContent('');
    }
  };

  return (
    <div className="w-full max-w-4xl p-8 space-y-8 rounded-2xl shadow-lg bg-black/20 backdrop-blur-xl animate-fadeInUp">
      <div className="flex justify-between items-center">
        {/* Title changed to reflect it's now only for community */}
        <h2 className="text-3xl font-black text-white tracking-wider">FlowState Community</h2> 
        <button onClick={showDashboard} className="p-2 px-4 bg-gray-600/80 rounded-lg font-bold">Back to Dashboard</button>
      </div>

      {/* Community Connect Section (Moved up, now the primary content) */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white">Ask a question or share a solution with other students.</h3> {/* This was previously a <p> */}
        <form onSubmit={handleCreatePost} className="bg-gray-900/50 p-4 rounded-lg space-y-2">
            <input type="text" value={newPostTitle} onChange={(e) => setNewPostTitle(e.target.value)} placeholder="Title of your problem or solution..." className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <textarea value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)} placeholder="Describe the problem in detail or share your solution..." className="w-full p-2 h-24 bg-gray-800 text-white rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            <button type="submit" className="w-full p-2 bg-blue-600 rounded font-bold hover:bg-blue-500 transition-colors">Post to Community</button>
        </form>
        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 mt-4"> {/* Adjusted max-height */}
          {loading ? (
            <p className="text-white/70 text-center">Loading posts...</p>
          ) : (
            posts.map(post => (
              <button 
                key={post.id} 
                onClick={() => onPostSelect(post.id)} 
                className="w-full text-left"
              >
                <div className="bg-gray-900/50 p-4 rounded-lg hover:bg-gray-900/80 transition-colors border border-transparent hover:border-blue-500">
                  <h3 className="font-bold text-white text-lg">{post.title}</h3>
                  <p className="text-sm text-white/60">
                    by {post.authorEmail} on {post.createdAt ? new Date(post.createdAt.toDate()).toLocaleDateString() : '...'}
                  </p>
                  <p className="text-white/80 mt-2 truncate">
                    {post.content}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ConnectPage;