import React, { useState, useRef } from "react";
import axios from "axios";
import html2pdf from "html2pdf.js";

const roles = ["DevOps", "Full stack Development", "Data Scientist", "Data Engineer"];

const ResumeReview = () => {
  const [role, setRole] = useState("DevOps");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const reviewRef = useRef();
  const user = localStorage.getItem("user") || "guest";

  const handleUpload = async () => {
    if (!file) return alert("Upload a PDF resume");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("role", role);

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:8000/resume-review", formData);
      setFeedback(res.data.feedback || "No feedback returned.");
    } catch (err) {
      console.error("❌ Upload or review failed:", err);
      alert("Upload or review failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const element = reviewRef.current;
    html2pdf().set({
      margin: 0.5,
      filename: `resume_review_${role}_${user}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    }).from(element).save();
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 text-black dark:text-white rounded shadow-md">
      <h3 className="text-2xl font-bold mb-4">🧾 AI Resume Review</h3>

      <div className="mb-4">
        <label className="font-semibold">Select Role:</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="ml-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 text-black dark:text-white"
        >
          {roles.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files[0])}
          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 text-black dark:text-white"
        />
      </div>

      <button
        onClick={handleUpload}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Reviewing..." : "Upload & Review"}
      </button>

      {feedback && (
        <div className="mt-6 space-y-4" ref={reviewRef}>
          {/* Header Info for PDF */}
          <div className="p-4 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 rounded">
            <p><strong>👤 User:</strong> {user}</p>
            <p><strong>🎯 Role:</strong> {role}</p>
          </div>

          {/* Feedback Sections */}
          {feedback.split("\n\n").map((section, idx) => (
            <div
              key={idx}
              className={`p-4 rounded border text-sm font-mono ${
                section.includes("✅") ? "bg-green-100 border-green-400" :
                section.includes("⚠️") ? "bg-yellow-100 border-yellow-400" :
                section.includes("🔧") ? "bg-blue-100 border-blue-400" :
                section.includes("🎓") ? "bg-purple-100 border-purple-400" :
                "bg-gray-100 border-gray-300"
              }`}
            >
              <pre className="whitespace-pre-wrap">{section}</pre>
            </div>
          ))}
        </div>
      )}

      {feedback && (
  <div className="mt-4 flex space-x-4">
    <button
      onClick={handleDownload}
      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
    >
      📥 Download PDF
    </button>

    <button
      onClick={() => {
        setFeedback("");
        setFile(null);
        document.querySelector('input[type="file"]').value = "";
      }}
      className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
    >
      ♻️ Clear Review
    </button>
  </div>
)}

    </div>
  );
};

export default ResumeReview;
