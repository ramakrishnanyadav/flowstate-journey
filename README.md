# FlowState 🚀

### Your Personal Sanctuary for Deep Work and Learning.

I built FlowState to solve a problem I face every single day: the constant war against digital distraction. As a student, I found that my biggest enemy wasn't the difficulty of the material, but the endless rabbit hole of browser tabs, notifications, and the siren call of social media.

This project is my answer. It's not just another timer; it's a complete ecosystem designed to transform your computer from a distraction machine into a powerful tool for focus, learning, and growth.

---

### **[➡️ Click Here to Try FlowState Live!](https://flowstate-journey.vercel.app/)**

## ✨ So, What Is FlowState?

FlowState is an all-in-one platform built on three core pillars: Focus, Review, and Guidance.

#### 🎯 The Focus Sanctuary
This is where the magic happens. When you're ready to work, FlowState creates an immersive, fullscreen **Deep Work Zone** that locks away distractions and gives you the perfect tool for the job:
*   **✍️ A clean editor** for writing essays without temptation.
*   **📚 A split-screen PDF viewer** for studying notes side-by-side.
*   **💻 A real, multi-language code editor with a live compiler** for practicing DSA problems without ever leaving your focus zone.

#### 📈 Your Personal Journey
Your effort should never disappear into the void. FlowState helps you learn from every session:
*   **Track your focus** after each session and identify what distracted you.
*   **View your analytics** on the Journey page, with a dynamic star map that visualizes your progress.
*   **Access your entire work history.** All notes and code from your sessions are saved and downloadable, creating a personal knowledge base of your hard work.

#### 🤖 The Guidance Center
Sometimes, you're not just distracted—you're stuck. That's where the Guidance Center comes in:
*   **The AI Mentor:** Powered by **Google Gemini**, this is your on-demand learning coach. Ask for a detailed roadmap on any topic, get complex concepts explained simply, or receive actionable advice on study habits.
*   **The Community:** A dedicated, focused forum to connect with other students. Ask for help, share solutions, and get real human support without the noise of traditional social media.

---

## 🛠️ How I Built This (My Toolbox)

Bringing this vision to life required a powerful and modern tech stack. I had to learn and integrate these tools to build a seamless experience.

| Category              | Technology                                                                                                  |
| --------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Frontend**          | **React.js**, **Vite**, **TailwindCSS**                                                                     |
| **Backend & Database**| **Firebase** (Authentication, Cloud Firestore)                                                              |
| **Languages**         | **JavaScript** (ES6+)                                                                                       |
| **APIs & Services**   | **Google Gemini API** (for the AI Mentor), **Judge0 API** (for live code execution)                           |
| **Specialized Libs**  | **`@uiw/react-codemirror`** (Code Editor), **`react-pdf`** (PDF Viewer), **`react-markdown`** (AI Responses) |
| **Deployment**        | **Vercel** & **GitHub**                                                                                     |

---

## 🧗 The Journey & The Struggle

Honestly, this project was a huge challenge, especially as a solo beginner. It was a constant cycle of building a feature, hitting a wall, and then spending hours debugging. There were moments when I thought the live code compiler was impossible, or when a stubborn CSS bug made me question everything.

But every single error—from the frustrating Firebase indexing issues to the obscure `npm` conflicts—was a learning opportunity. I learned how to read API documentation like a detective, how to manage secret keys securely, and most importantly, I learned the power of persistence. Pushing through those tough bugs and finally seeing the app work as I envisioned was the most rewarding part of this entire journey.

---

## 🚀 Getting It Running on Your Machine

Want to peek under the hood? Here’s how to get a local copy running.

1.  **Clone the repo:**
    `git clone https://github.com/ramakrishnayadav/flowstate-journey.git`
2.  **Jump in:**
    `cd flowstate-journey`
3.  **Install dependencies:**
    `npm install`
4.  **Set up your secrets:**
    *   Create a `.env` file in the root directory.
    *   Add your API keys (make sure the names start with `VITE_`):
        ```env
        VITE_RAPIDAPI_KEY=your_judge0_api_key
        VITE_GEMINI_API_KEY=your_google_ai_api_key
        ```
    *   Add your Firebase config to `src/firebase.js`.
5.  **Launch it!**
    `npm run dev`

---

## 🔮 What's Next for FlowState

This is just the beginning! I'm buzzing with ideas for the future:
*   **Collaborative Focus Sessions:** For group study and accountability.
*   **Deeper AI Integration:** AI-powered content summarization for PDFs and code refactoring suggestions.
*   **Gamification:** Streaks, badges, and leaderboards to make focus even more rewarding.

Thank you for checking out my project!
