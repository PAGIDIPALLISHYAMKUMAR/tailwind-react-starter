import React, { useState } from "react";
import axios from "axios";

const TopicBasedInterview = () => {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [showFullAnswer, setShowFullAnswer] = useState(false);

  const handleGenerate = async () => {
    try {
      const res = await axios.post("http://localhost:8000/topic-question", {
        topic,
        difficulty,
      });

      if (res.data.questions) {
        setQuestions(res.data.questions);
        setCurrentIndex(0);
        setAnswer("");
        setFeedback("");
        setCorrectAnswer("");
        setShowFullAnswer(false);
      } else {
        alert("No questions generated.");
      }
    } catch (err) {
      console.error("❌ Error generating questions:", err);
      alert("Failed to generate questions.");
    }
  };

  const handleSubmit = async () => {
    const question = questions[currentIndex];
    try {
      const res = await axios.post("http://localhost:8000/topic-evaluate", {
        question,
        answer,
      });

      const fb = res.data.feedback || "No feedback received.";
      const ca = res.data.correct_answer || "No correct answer provided.";

      setFeedback(fb);
      setCorrectAnswer(ca);
      setShowFullAnswer(false);
    } catch (err) {
      console.error("❌ Evaluation error:", err);
      alert("Evaluation failed.");
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setAnswer("");
      setFeedback("");
      setCorrectAnswer("");
      setShowFullAnswer(false);
    } else {
      alert("✅ Interview completed!");
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 text-black dark:text-white rounded shadow-md">
      <h3 className="text-2xl font-bold mb-4">🧠 Topic-Based Interview</h3>

      <div className="mb-6 flex flex-col md:flex-row items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="font-medium">🧩 Topic:</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter the topic"
            className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-black dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="font-medium">🎯 Difficulty:</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-black dark:text-white"
          >
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
        </div>

        <button
          onClick={handleGenerate}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Generate Questions
        </button>
      </div>

      {questions.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">
            Question {currentIndex + 1} of {questions.length}
          </h4>
          <p>{questions[currentIndex]}</p>

          <textarea
            rows={4}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Enter your answer here..."
            className="w-full p-3 rounded border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
          />

          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Submit Answer
          </button>

          {feedback && (
            <div className="mt-4 space-y-4">
              <div className="p-4 bg-yellow-100 dark:bg-yellow-200 text-black rounded border border-yellow-300">
                <h5 className="font-semibold mb-1">📝 Feedback:</h5>
                <pre className="whitespace-pre-wrap text-sm">{feedback}</pre>
              </div>

              <div className="p-4 bg-green-100 dark:bg-green-200 text-black rounded border border-green-300">
                <h5 className="font-semibold mb-1">✅ Correct Answer:</h5>
                <div
                  style={{
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    overflow: showFullAnswer ? "visible" : "hidden",
                    maxHeight: showFullAnswer ? "none" : "200px",
                    transition: "max-height 0.3s ease-in-out",
                  }}
                >
                  {correctAnswer}
                </div>
                {correctAnswer.length > 300 && (
                  <button
                    onClick={() => setShowFullAnswer(!showFullAnswer)}
                    className="mt-2 text-blue-600 hover:underline"
                  >
                    {showFullAnswer ? "Show Less" : "Show More"}
                  </button>
                )}
              </div>

              {currentIndex < questions.length - 1 && (
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Next Question
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TopicBasedInterview;
