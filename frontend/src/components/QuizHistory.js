// src/components/QuizHistory.js
import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";

const QuizHistory = () => {
  const [userEmail, setUserEmail] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserEmail(user.email);
        await fetchResults(user.email);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchResults = async (email) => {
    try {
      const q = query(
        collection(db, "quiz_results"),
        where("email", "==", email), // ✅ MATCHES FIELD NAME IN QuizMode.js
        orderBy("submitted_at", "desc") // ✅ Also updated to match
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => doc.data());
      setResults(data);
    } catch (err) {
      console.error("❌ Failed to fetch quiz history:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 text-black dark:text-white min-h-screen">
      <h2 className="text-2xl font-bold mb-6">📜 Quiz History</h2>

      {loading ? (
        <p>Loading your past quizzes...</p>
      ) : results.length === 0 ? (
        <p>No quiz attempts found.</p>
      ) : (
        <ul className="space-y-4">
          {results.map((r, idx) => (
            <li
              key={idx}
              className="border border-gray-300 dark:border-gray-700 rounded p-4 bg-gray-50 dark:bg-gray-800 shadow"
            >
              <p><strong>🧩 Topic:</strong> {r.topic}</p>
              <p>
                <strong>✅ Score:</strong> {r.score} / {r.total}
              </p>
              <p className="text-sm italic text-gray-600 dark:text-gray-400">
                {r.submitted_at?.seconds
                  ? new Date(r.submitted_at.seconds * 1000).toLocaleString()
                  : "No timestamp"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default QuizHistory;
