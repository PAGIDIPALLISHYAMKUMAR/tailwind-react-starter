import React, { useState } from "react";
import axios from "axios";

const ResumeQA = () => {
  const [question, setQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [nextAvailable, setNextAvailable] = useState(false);

  const user = localStorage.getItem("user") || "guest";

  const startSession = async () => {
    try {
      const formData = new FormData();
      formData.append("user", user);
      // You must handle resume upload in another component, then call this
      const res = await axios.post("http://localhost:8000/next-question", { user });
      setQuestion(res.data.question);
      setFeedback("");
      setCorrectAnswer("");
      setUserAnswer("");
      setNextAvailable(false);
    } catch (err) {
      console.error("❌ Start Session Error:", err);
    }
  };

  const submitAnswer = async () => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/submit-resume-answer", {
        user,
        answer: userAnswer,
      });

      if (res.data) {
        setFeedback(res.data.feedback);
        setCorrectAnswer(res.data.correct_answer);
        setNextAvailable(res.data.next_question_available);
      } else {
        setFeedback("No feedback received.");
      }
    } catch (err) {
      console.error("❌ Submit Answer Error:", err);
      setFeedback("Error evaluating answer.");
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = async () => {
    try {
      const res = await axios.get("http://localhost:8000/next-question", {
        params: { user },
      });

      if (res.data.message === "Interview complete.") {
        alert("✅ Interview complete!");
        setQuestion(null);
        setUserAnswer("");
        setFeedback("");
        setCorrectAnswer("");
        setNextAvailable(false);
      } else {
        setQuestion(res.data.question);
        setUserAnswer("");
        setFeedback("");
        setCorrectAnswer("");
        setNextAvailable(false);
      }
    } catch (err) {
      console.error("❌ Next Question Error:", err);
    }
  };

  return (
    <div style={{ marginTop: 30 }}>
      {!question ? (
        <button onClick={startSession}>Start Resume-Based Interview</button>
      ) : (
        <div>
          <h4>Question:</h4>
          <p>{question}</p>
          <textarea
            rows={4}
            cols={80}
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Enter your answer"
          ></textarea>
          <br />
          <button onClick={submitAnswer} disabled={loading}>
            {loading ? "Evaluating..." : "Submit Answer"}
          </button>

          {feedback && (
            <div style={{ marginTop: 20 }}>
              <h5>Evaluation:</h5>
              <p><strong>Feedback:</strong> {feedback}</p>
              <p><strong>Correct Answer:</strong> {correctAnswer}</p>
              {nextAvailable && <button onClick={handleNextQuestion}>Next Question</button>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResumeQA;
