import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import ChatWithMultiVoice from "./components/ChatWithMultiVoice";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";
import ResumeUpload from "./components/ResumeUpload";
import TopicBasedInterview from "./components/TopicBasedInterview";
import ResumeReview from "./components/ResumeReview";
import AdminPanel from "./components/AdminPanel";
import UserHistory from "./components/UserHistory";
import InterviewModeDropdown from "./components/InterviewModeDropdown";
import ResetPasswordPage from "./components/ResetPasswordPage"; // ✅ Added
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Toaster } from "react-hot-toast";
import "./styles.css";
import QuizMode from "./components/QuizMode";
import QuizHistory from "./components/QuizHistory";


function App() {
  const [selectedMode, setSelectedMode] = useState("practice");
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (userObj) => {
      if (userObj) {
        try {
          const token = await userObj.getIdToken(true); // Force refresh
          const email = userObj.email;
          setUser(email);
          localStorage.setItem("user", email);

          const res = await fetch(`http://localhost:8000/admin/check?email=${email}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!res.ok) throw new Error("❌ Token verification failed or user deleted");

          const data = await res.json();
          setIsAdmin(!!data.is_admin);
        } catch (err) {
          console.error("⚠️ User is invalid or deleted. Logging out...", err);
          auth.signOut();
          setUser(null);
          setIsAdmin(false);
          localStorage.removeItem("user");
        }
      } else {
        setUser(null);
        setIsAdmin(false);
        localStorage.removeItem("user");
      }

      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  if (checkingAuth) return <p className="text-center mt-10">🔐 Checking authentication...</p>;

  return (
    <Router>
      <Navbar isAdmin={isAdmin} />
      <Toaster position="top-right" reverseOrder={false} />

      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} /> {/* ✅ Added */}
        <Route path="/quiz-history" element={<QuizHistory />} />
        

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <div className="p-6 bg-white dark:bg-gray-900 text-black dark:text-white min-h-screen">
                <h2 className="text-2xl font-semibold mb-4">Interview Simulator</h2>

                <InterviewModeDropdown
                  selectedMode={selectedMode}
                  setSelectedMode={setSelectedMode}
                />

                <hr className="my-4" />

                {selectedMode === "practice" && <ChatWithMultiVoice />}
                {selectedMode === "resume" && <ResumeUpload />}
                {selectedMode === "topic" && <TopicBasedInterview />}
                {selectedMode === "review" && <ResumeReview />}
                {selectedMode === "quiz" && <QuizMode />}

              </div>
            </PrivateRoute>
          }
        />

        <Route
          path="/history"
          element={
            <PrivateRoute>
              <UserHistory />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <PrivateRoute>
              {isAdmin ? (
                <AdminPanel />
              ) : (
                <div className="p-6">
                  <h3>🚫 You are not authorized to access this page.</h3>
                </div>
              )}
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
