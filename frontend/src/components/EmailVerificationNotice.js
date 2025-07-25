import React, { useState } from "react";
import { getAuth, sendEmailVerification } from "firebase/auth";
import { toast } from "react-hot-toast";

const EmailVerificationNotice = ({ user }) => {
  const [resent, setResent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleResend = async () => {
    const auth = getAuth();
    if (!auth.currentUser) return;

    try {
      setSending(true);
      await sendEmailVerification(auth.currentUser);
      setResent(true);
      toast.success("Verification Email Sent Successfully! 🚀");
    } catch (err) {
      console.error("Failed to resend verification:", err);
      toast.error("Error sending verification email!");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="max-w-lg w-full bg-white dark:bg-gray-800 shadow-2xl rounded-xl p-8 text-center">
        <div className="text-6xl mb-4">📩</div>
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Verify Your Email
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          We've sent a verification link to: <br />
          <span className="font-bold text-indigo-600 dark:text-indigo-400">
            {user?.email}
          </span>
        </p>
        <button
          onClick={handleResend}
          disabled={sending || resent}
          className={`mt-4 px-6 py-2 text-lg rounded-lg shadow-md transition duration-300 ease-in-out ${
            resent
              ? "bg-green-500 text-white cursor-default"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          {resent ? "✅ Email Sent!" : sending ? "Sending..." : "Resend Verification Email"}
        </button>
      </div>
    </div>
  );
};

export default EmailVerificationNotice;
