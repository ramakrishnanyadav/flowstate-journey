// src/components/PostDetailsPage.jsx - TWO-COLUMN CONVERSATION LAYOUT

import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, query, onSnapshot, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import CodeMirror from '@uiw/react-codemirror'; // For viewing code content
import { javascript } from '@codemirror/lang-javascript'; // Default language for code display
import { okaidia } from '@uiw/codemirror-theme-okaidia'; // Theme for code display

function PostDetailsPage({ postId, showConnectPage }) {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');

  // Effect to fetch the main post and its comments
  useEffect(() => {
    // 1. Fetch the single post document
    const postRef = doc(db, 'posts', postId);
    getDoc(postRef).then((docSnap) => {
      if (docSnap.exists()) {
        setPost({ id: docSnap.id, ...docSnap.data() });
      }
    }).catch(error => {
        console.error("Error fetching post:", error);
        setPost(null); // Set to null if post not found
        setLoading(false);
    });

    // 2. Set up a real-time listener for the comments subcollection
    const commentsRef = collection(db, 'posts', postId, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'asc')); // Order comments by oldest first
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const commentsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setComments(commentsData);
      setLoading(false);
    }, error => {
        console.error("Error fetching comments:", error);
        setComments([]);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [postId]);

  // Handle posting a new comment
  const handlePostComment = async (e) => {
    e.preventDefault();
    if (newComment.trim() === '') return;

    const user = auth.currentUser;
    if (user) {
      const commentsRef = collection(db, 'posts', postId, 'comments');
      await addDoc(commentsRef, {
        text: newComment,
        authorEmail: user.email,
        authorId: user.uid,
        createdAt: serverTimestamp(),
      });
      setNewComment('');
    }
  };

  if (loading) {
    return <p className="text-white/70 text-center">Loading conversation...</p>;
  }

  // Display message if post is not found
  if (!post) {
      return (
          <div className="w-full max-w-4xl p-8 space-y-6 rounded-2xl shadow-lg bg-black/20 backdrop-blur-xl animate-fadeInUp">
              <h2 className="text-3xl font-black text-white tracking-wider">Conversation</h2>
              <p className="text-white/70 text-center">Sorry, this post could not be found.</p>
              <div className="flex justify-center">
                  <button onClick={showConnectPage} className="p-2 px-4 bg-gray-600/80 rounded-lg font-bold">Back to All Posts</button>
              </div>
          </div>
      );
  }

  return (
    <div className="w-full max-w-6xl h-[85vh] p-8 space-y-6 rounded-2xl shadow-lg bg-black/20 backdrop-blur-xl animate-fadeInUp flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-black text-white tracking-wider">Conversation</h2>
        <button onClick={showConnectPage} className="p-2 px-4 bg-gray-600/80 rounded-lg font-bold">Back to All Posts</button>
      </div>

      {/* Main content grid */}
      <div className="flex-grow grid grid-cols-1 md:grid-cols-[1.5fr,2fr] gap-6 overflow-hidden">
        {/* Left Column: Original Post */}
        <div className="flex flex-col bg-gray-900/50 p-6 rounded-lg border-l-4 border-blue-500 overflow-y-auto">
          <h3 className="font-bold text-white text-xl mb-2">{post.title}</h3>
          <p className="text-sm text-white/60 mb-4">by {post.authorEmail} on {post.createdAt ? new Date(post.createdAt.toDate()).toLocaleDateString() : '...'}</p>
          {/* Render content as CodeMirror if it was a code session, otherwise as pre-formatted text */}
          {post.mode === 'code' ? (
              <CodeMirror value={post.content || ''} theme={okaidia} extensions={[javascript()]} readOnly={true} />
          ) : (
              <p className="text-white/90 whitespace-pre-wrap">{post.content}</p>
          )}
        </div>

        {/* Right Column: Comments Section & Add Comment Form */}
        <div className="flex flex-col bg-gray-900/50 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-white mb-4">Replies</h3>
          {/* Comments List */}
          <div className="flex-grow space-y-4 overflow-y-auto pr-2 mb-4">
            {comments.length === 0 ? (
                <p className="text-white/70">No replies yet. Be the first!</p>
            ) : (
                comments.map(comment => (
                    <div key={comment.id} className="bg-gray-800/60 p-3 rounded-lg">
                        <p className="text-sm font-bold text-white">{comment.authorEmail} replied:</p>
                        <p className="text-white/90 mt-1 whitespace-pre-wrap">{comment.text}</p>
                        <p className="text-xs text-white/40 text-right">{comment.createdAt ? new Date(comment.createdAt.toDate()).toLocaleTimeString() : '...'}</p>
                    </div>
                ))
            )}
          </div>

          {/* Add a Comment Form */}
          <form onSubmit={handlePostComment} className="flex gap-2 pt-4 border-t border-gray-700">
            <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write a helpful reply..." className="flex-grow p-2 bg-gray-800 text-white rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500" />
            <button type="submit" className="p-2 px-4 bg-green-600 rounded font-bold hover:bg-green-500 transition-colors">Reply</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PostDetailsPage;