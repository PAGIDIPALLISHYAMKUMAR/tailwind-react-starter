import React, { useState } from "react";
import axios from "axios";

const ChatWithMultiVoice = () => {
  const questions = [
    "Explain how Terraform handles remote state.",
    "What is a DaemonSet in Kubernetes?",
    "How does Prometheus discover services?"
  ];
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState("");
  const [user] = useState(localStorage.getItem("user") || "guest");

  const currentQuestion = questions[questionIndex];

  const handleVoiceInput = () => {
    const recognition =
      new window.webkitSpeechRecognition() || new window.SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();

    recognition.onresult = (event) => {
      const speech = event.results[0][0].transcript;
      console.log("🎙️ Voice Input:", speech);
      setAnswer(speech);
      sendAnswer(speech);
    };

    recognition.onerror = (event) => {
      console.error("❌ Speech recognition error", event.error);
    };
  };

  const sendAnswer = async (text) => {
    try {
      const res = await axios.post("http://localhost:8000/evaluate-answer", {
        user,
        question: currentQuestion,
        answer: text
      });

      setEvaluation(res.data.evaluation);
    } catch (err) {
      console.error("❌ Error sending answer:", err.message);
    }
  };

  const nextQuestion = () => {
    if (questionIndex + 1 < questions.length) {
      setQuestionIndex(questionIndex + 1);
      setAnswer("");
      setEvaluation("");
    } else {
      alert("🎉 Interview session complete!");
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 text-black dark:text-white rounded shadow-md">
      <h2 className="text-2xl font-bold mb-2">Interview Simulator</h2>
      <h4 className="text-lg mb-4">🧠 Interview Practice</h4>

      <p className="mb-2">
        <strong>Question {questionIndex + 1}:</strong> {currentQuestion}
      </p>

      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        rows={3}
        className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-black dark:text-white rounded mb-4"
        placeholder="Type your answer or use voice..."
      />

      <div className="flex items-center space-x-4 mb-4">
        <button
          onClick={handleVoiceInput}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          🎤 Speak
        </button>
        <button
          onClick={() => sendAnswer(answer)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Submit
        </button>
      </div>

      {evaluation && (
        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">
          <h4 className="text-lg font-semibold mb-2">GPT Evaluation:</h4>
          <p className="text-sm whitespace-pre-wrap">{evaluation}</p>

          <button
            onClick={nextQuestion}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Next Question
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatWithMultiVoice;
