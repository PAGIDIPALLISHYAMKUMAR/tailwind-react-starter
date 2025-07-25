import React, { useState, useEffect } from "react";
import axios from "axios";
import { db } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

const QuizMode = () => {
  const [topic, setTopic] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [timerActive, setTimerActive] = useState(false);

  const handleGenerateQuiz = async () => {
    try {
      const res = await axios.post("http://localhost:8000/generate-quiz", { topic });
      setQuestions(res.data);
      setAnswers({});
      setSubmitted(false);
      setScore(0);
      setTimeLeft(300); // reset timer
      setTimerActive(true); // start timer
    } catch (err) {
      console.error("❌ Failed to fetch quiz:", err);
      alert("Quiz generation failed.");
    }
  };

  const handleCheckboxChange = (qIdx, option, checked) => {
    setAnswers((prev) => {
      const existing = prev[qIdx] || [];
      return {
        ...prev,
        [qIdx]: checked
          ? [...existing, option]
          : existing.filter((o) => o !== option),
      };
    });
  };

  const handleSubmit = async () => {
    let sc = 0;
    questions.forEach((q, i) => {
      const userAnswer = answers[i] || [];
      const correct = q.correct_answer || [];

      const isCorrect =
        userAnswer.length === correct.length &&
        userAnswer.every((a) => correct.includes(a));

      if (isCorrect) sc += 1;
    });

    setScore(sc);
    setSubmitted(true);
    setTimerActive(false);

    // ✅ Save to Firestore (NO nested arrays)
    try {
      const userEmail = localStorage.getItem("user") || "guest";
      await addDoc(collection(db, "quiz_results"), {
        email: userEmail,
        topic,
        score: sc,
        total: questions.length,
        answers,
        submitted_at: Timestamp.now(),
        questions: questions.map((q) => ({
          question: q.question,
          correct_answer: q.correct_answer,
        })),
      });
      console.log("✅ Quiz result saved to Firestore");
    } catch (error) {
      console.error("❌ Error saving quiz result:", error);
    }
  };

  useEffect(() => {
    if (!timerActive || submitted) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, submitted]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 text-black dark:text-white rounded shadow-md">
      <h3 className="text-2xl font-bold mb-4">📝 DevOps Quiz Mode</h3>

      <div className="mb-4 flex items-center gap-4">
        <input
          type="text"
          placeholder="Enter topic (e.g., Kubernetes)"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800"
        />
        <button
          onClick={handleGenerateQuiz}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Generate Quiz
        </button>
      </div>

      {questions.length > 0 && !submitted && (
        <div className="mb-4 font-semibold text-red-600 text-lg">
          ⏱ Time Left: {formatTime(timeLeft)}
        </div>
      )}

      {questions.length > 0 && (
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          {questions.map((q, idx) => (
            <div
              key={idx}
              className="p-4 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
            >
              <p className="font-semibold mb-2">
                Question {idx + 1}: {q.question}
              </p>
              {q.options.map((opt, optIdx) => (
                <label key={optIdx} className="block mb-1">
                  <input
                    type="checkbox"
                    checked={answers[idx]?.includes(opt) || false}
                    onChange={(e) =>
                      handleCheckboxChange(idx, opt, e.target.checked)
                    }
                    className="mr-2"
                    disabled={submitted}
                  />
                  {opt}
                </label>
              ))}
              {submitted && (
                <p
                  className={`mt-1 text-sm ${
                    answers[idx]?.every((a) => q.correct_answer.includes(a))
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  Correct Answer(s): {q.correct_answer.join(", ")}
                </p>
              )}
            </div>
          ))}

          {!submitted ? (
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Submit Quiz
            </button>
          ) : (
            <p className="text-xl font-bold text-purple-600 mt-4">
              ✅ Your Score: {score} / {questions.length}
            </p>
          )}
        </form>
      )}
    </div>
  );
};

export default QuizMode;
