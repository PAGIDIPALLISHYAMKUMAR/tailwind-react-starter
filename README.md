# 🤖 AI Interview Simulator

An AI-powered platform for mock technical interviews with real-time evaluation, resume-based question generation, admin control panel, and full dark mode support.

---

## 🚀 Features

- 🎙️ **Voice & Text Interview Practice** – Practice answering DevOps questions via text or voice input.
- 🧠 **Topic-Based Interview** – Choose a topic and difficulty to get custom questions and AI feedback.
- 📄 **Resume-Based Interview** – Upload your resume, and the AI generates questions from your actual experience.
- 🧾 **AI Resume Review** – Get strengths, weaknesses, suggestions, and certification advice.
- 📊 **Score History** – See past interview scores and feedback.
- 🔐 **Firebase Auth** – Email/password login, email verification, admin role management.
- ⚙️ **Admin Panel** – Manage user roles (make/remove admin) with Firestore backend.
- 🌙 **Dark Mode** – Toggle between dark/light themes across the app.

---

## 🛠 Tech Stack

### Frontend (React + Tailwind CSS)
- `React Router` – for routing
- `Tailwind CSS` – for responsive and modern UI
- `Firebase Auth` – for authentication and role-based routing
- `Axios` – to communicate with backend
- `SpeechRecognition API` – for voice input

### Backend (FastAPI + AI Models)
- `FastAPI` – modern, fast Python API framework
- `Together.ai API` – for GPT-powered question generation and evaluation
- `PyMuPDF` – for extracting text from resumes
- `Firebase Admin SDK` – for role validation and Firestore access

---

## 📁 Folder Structure

```
frontend/
├── src/
│   ├── components/         # All major UI components
│   ├── styles.css          # Tailwind entry
│   └── firebase.js         # Firebase config
backend/
├── main.py                 # FastAPI entry point
├── resume_parser.py        # Extracts text from uploaded PDFs
├── evaluator.py            # GPT answer evaluator
├── resume_gpt_generator.py # GPT resume-based question generator
├── resume_review.py        # GPT resume analysis and suggestions
├── topic_question.py       # Topic-based questions
└── admin_routes.py         # Admin role checker routes
```

---

## 🧪 Running the Project

### 1. Clone the repo:
```bash
git clone https://github.com/yourname/interview-simulator.git
cd interview-simulator
```

### 2. Install and Run Backend (Python)
```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # or `source venv/bin/activate` on Linux/macOS
pip install -r requirements.txt
uvicorn main:app --reload
```

### 3. Run Frontend (React)
```bash
cd frontend
npm install
npm start
```

---

## 🔐 Firebase Setup

1. Create a Firebase project
2. Enable **Email/Password Auth**
3. Set Firestore rules for user role management
4. Replace Firebase config in `frontend/src/firebase.js`

---

## 👩‍💼 Admin Access

Admins can:
- Access `/admin` route
- Make/remove admins
- See all registered users

Only verified users can access the dashboard.

---

## 📦 Deployment Tips

- Use **Vercel/Netlify** for frontend
- Use **Railway/Render** for backend
- Set environment variables for `TOGETHER_API_KEY`, Firebase credentials, etc.

---

