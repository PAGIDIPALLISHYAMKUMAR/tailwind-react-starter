import React, { useState } from "react";
import axios from "axios";

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [showNext, setShowNext] = useState(false);

  const user = localStorage.getItem("user") || "guest";

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a PDF file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("user", user);

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:8000/start-resume-session", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.question) {
        setQuestion(res.data.question);
        setSessionStarted(true);
        setAnswer("");
        setFeedback("");
        setCorrectAnswer("");
        setShowNext(false);
      } else {
        alert("No questions generated.");
      }
    } catch (err) {
      console.error("❌ Upload Error:", err);
      alert("Error uploading resume. Check backend logs.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!answer.trim()) {
      alert("Please enter an answer before submitting.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:8000/submit-resume-answer", {
        user,
        answer,
      });

      if (res.data?.feedback) {
        setFeedback(res.data.feedback);
        setCorrectAnswer(res.data.correct_answer);
        setShowNext(true);
      } else {
        setFeedback("No feedback received.");
        setShowNext(false);
      }

      if (!res.data.next_question) {
        alert("✅ Interview completed!");
        setSessionStarted(false);
        setQuestion(null);
      }
    } catch (err) {
      console.error("❌ Evaluation Error:", err);
      setFeedback("Error evaluating answer. Check backend logs.");
    }
  };

  const handleNextQuestion = async () => {
    try {
      const res = await axios.get("http://localhost:8000/next-question", {
        params: { user },
      });

      if (res.data.message === "Interview complete.") {
        alert("✅ Interview completed!");
        setSessionStarted(false);
        setQuestion(null);
        setFeedback("");
        setCorrectAnswer("");
      } else if (res.data.question) {
        setQuestion(res.data.question);
        setAnswer("");
        setFeedback("");
        setCorrectAnswer("");
        setShowNext(false);
      }
    } catch (err) {
      console.error("❌ Next Question Error:", err);
      alert("Failed to fetch next question.");
    }
  };

  return (
    <div className="p-6 text-black dark:text-white bg-white dark:bg-gray-900 rounded shadow-md">
      {!sessionStarted && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">📄 Upload Resume to Generate Questions</h3>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files[0])}
            className="block mb-2 text-sm text-gray-700 dark:text-gray-300"
          />
          <button
            onClick={handleUpload}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Generating..." : "Upload and Start Interview"}
          </button>
        </div>
      )}

      {sessionStarted && question && (
        <div className="mt-6 space-y-4">
          <h4 className="text-lg font-semibold">🧠 Question:</h4>
          <p className="text-gray-800 dark:text-gray-200">{question}</p>

          <textarea
            rows="4"
            className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-black dark:text-white"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Enter your answer here..."
          />

          <button
            onClick={handleAnswerSubmit}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Submit Answer
          </button>

          {feedback && (
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700">
              <h5 className="font-semibold">📝 Feedback:</h5>
              <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200">{feedback}</pre>

              <h5 className="mt-2 font-semibold">✅ Correct Answer:</h5>
              <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200">{correctAnswer}</pre>
            </div>
          )}

          {showNext && (
            <button
              onClick={handleNextQuestion}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Next Question
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;