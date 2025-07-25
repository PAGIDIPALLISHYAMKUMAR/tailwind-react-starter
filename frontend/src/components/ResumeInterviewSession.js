import React, { useEffect, useState } from "react";
import axios from "axios";

const ResumeInterviewSession = ({ username }) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [sessionActive, setSessionActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const startSession = async () => {
    setLoading(true);
    const formData = new FormData();
    const resumeFile = document.getElementById("resumeFile").files[0];
    formData.append("resume", resumeFile);
    formData.append("user", username);

    try {
      const res = await axios.post("http://localhost:8000/start-resume-session", formData);
      setSessionActive(true);
      fetchCurrentQuestion();
    } catch (err) {
      alert("Error starting session. Check backend.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentQuestion = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/resume-session-status?user=${username}`);
      setQuestion(res.data.question || "");
      setFeedback(res.data.feedback || "");
      setCorrectAnswer(res.data.correct_answer || "");
    } catch (err) {
      alert("Failed to get current question.");
    }
  };

  const submitAnswer = async () => {
    try {
      const res = await axios.post("http://localhost:8000/submit-resume-answer", {
        user: username,
        answer,
      });

      setFeedback(res.data.feedback);
      setCorrectAnswer(res.data.correct_answer);

      // Automatically load next question after a short delay
      setTimeout(() => {
        setAnswer("");
        setFeedback("");
        setCorrectAnswer("");
        fetchCurrentQuestion();
      }, 5000);
    } catch (err) {
      alert("Error submitting answer.");
    }
  };

  return (
    <div style={{ marginTop: 20 }}>
      {!sessionActive ? (
        <div>
          <h3>Upload Resume to Begin Interview</h3>
          <input id="resumeFile" type="file" accept=".pdf" />
          <button onClick={startSession} disabled={loading}>
            {loading ? "Starting..." : "Start Interview"}
          </button>
        </div>
      ) : (
        <div>
          <h3>Interview Question</h3>
          <p>{question}</p>
          <textarea
            rows="4"
            style={{ width: "100%" }}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
          <br />
          <button onClick={submitAnswer} disabled={!answer.trim()}>
            Submit Answer
          </button>
          {feedback && (
            <div style={{ marginTop: 10 }}>
              <p><strong>Feedback:</strong> {feedback}</p>
              <p><strong>Correct Answer:</strong> {correctAnswer}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResumeInterviewSession;
