import React, { useEffect, useState } from "react";
import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const Dashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [userEmail, setUserEmail] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
      } else {
        alert("🚫 Please log in to access the dashboard.");
        window.location.href = "/login";
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchSessions = () => {
    if (!userEmail) return;
    axios
      .get("http://localhost:8000/get-sessions", {
        params: { user: userEmail },
        headers: {
          Authorization: `Bearer ${getAuth().currentUser?.accessToken}`,
        },
      })
      .then((res) => {
        setSessions(res.data);
        setShowHistory(true);
      })
      .catch((err) => {
        console.error("❌ Failed to fetch sessions", err);
        alert("Error loading sessions.");
      });
  };

  return (
    <div className="p-6 min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
      <h2 className="text-2xl font-semibold mb-4">📊 Interview History</h2>

      <button
        onClick={() => {
          if (!showHistory) fetchSessions();
          else setShowHistory(false);
        }}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        {showHistory ? "Hide History" : "Show History"}
      </button>

      {showHistory && (
        <>
          {sessions.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">No sessions yet.</p>
          ) : (
            <ul className="space-y-6">
              {sessions.map((s) => (
                <li
                  key={s.id}
                  className="border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded p-4"
                >
                  <p><strong>Question:</strong> {s.question}</p>
                  <p><strong>Your Answer:</strong> {s.answer}</p>
                  <p><strong>Feedback:</strong> {s.feedback}</p>
                  <em className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(s.timestamp._seconds * 1000).toLocaleString()}
                  </em>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
