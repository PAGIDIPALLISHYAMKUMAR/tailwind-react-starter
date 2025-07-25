import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";

const ResetPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("✅ Password reset email sent. Please check your inbox.");
    } catch (err) {
      console.error("Reset error:", err);
      setError("❌ Failed to send reset email. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4 text-black dark:text-white">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-center">🔐 Reset Password</h2>

        {message && (
          <div className="mb-4 text-sm text-green-600 bg-green-100 dark:bg-green-900 px-4 py-2 rounded">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-100 dark:bg-red-900 px-4 py-2 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">📧 Email:</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-black dark:text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition"
          >
            🔁 Send Reset Link
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Remembered your password?{" "}
          <button onClick={() => navigate("/login")} className="text-blue-500 hover:underline">
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
