// src/components/PrivateRoute.js
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, sendEmailVerification } from "firebase/auth";

const PrivateRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (userObj) => {
      setUser(userObj);
      setChecking(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let interval;

    if (user && !user.emailVerified) {
      interval = setInterval(async () => {
        await user.reload();
        if (user.emailVerified) {
          clearInterval(interval);
          setUser({ ...user }); // force update
          window.location.reload(); // ✅ auto-refresh UI
        }
      }, 3000);
    }

    return () => clearInterval(interval);
  }, [user]);

  const resendVerification = async () => {
    const auth = getAuth();
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    }
  };

  if (checking) return <p className="text-center mt-10">🔐 Checking authentication...</p>;

  if (!user) return <Navigate to="/login" />;

  if (!user.emailVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center bg-white dark:bg-gray-800 shadow-xl rounded-xl p-8 max-w-lg w-full">
          <div className="text-5xl mb-4">📩</div>
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
            Verify your email
          </h3>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            A verification link was sent to:{" "}
            <span className="font-semibold text-indigo-600">{user.email}</span>
          </p>
          <button
            onClick={resendVerification}
            className={`px-5 py-2 rounded transition duration-200 ${
              resent ? "bg-green-500 cursor-default" : "bg-indigo-600 hover:bg-indigo-700"
            } text-white`}
            disabled={resent}
          >
            {resent ? "✅ Email Sent!" : "Resend Verification Email"}
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default PrivateRoute;
