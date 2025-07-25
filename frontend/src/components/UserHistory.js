// src/components/UserHistory.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const UserHistory = () => {
  const [sessions, setSessions] = useState([]);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        setUserEmail(user.email);

        try {
          const res = await axios.get("http://localhost:8000/get-sessions", {
            params: { user: user.email },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setSessions(res.data);
        } catch (err) {
          console.error("Failed to fetch history:", err);
          alert("Error loading interview history.");
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="p-6 text-black dark:text-white bg-white dark:bg-gray-900 min-h-screen">
      <h2 className="text-2xl font-semibold mb-4">📜 Interview History</h2>
      {sessions.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">No interview sessions found.</p>
      ) : (
        <ul className="space-y-6">
          {sessions.map((s) => (
            <li
              key={s.id}
              className="border border-gray-300 dark:border-gray-700 rounded p-4 shadow-sm"
            >
              <p><strong>Q:</strong> {s.question}</p>
              <p><strong>Your Answer:</strong> {s.answer}</p>
              <p><strong>Feedback:</strong> {s.feedback}</p>
              <p className="text-sm italic text-gray-500 dark:text-gray-400">
                {s.timestamp?._seconds
                  ? new Date(s.timestamp._seconds * 1000).toLocaleString()
                  : "No timestamp"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserHistory;
