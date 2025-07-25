import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const ScoreHistory = ({ username }) => {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const fetchSessions = async () => {
      const q = query(
        collection(db, "interview_sessions"),
        where("user", "==", username)
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => doc.data());
      setSessions(data);
    };

    fetchSessions();
  }, [username]);

  return (
    <div>
      <h3>Interview History for {username}</h3>
      <ul>
        {sessions.map((s, idx) => (
          <li key={idx} style={{ marginBottom: "10px" }}>
            <strong>Q:</strong> {s.question} <br />
            <strong>Your Answer:</strong> {s.answer} <br />
            <strong>Feedback:</strong> {s.feedback}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ScoreHistory;