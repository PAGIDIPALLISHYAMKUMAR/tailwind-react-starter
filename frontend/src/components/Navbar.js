import React, { useEffect, useRef, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { ThemeContext } from "../ThemeContext";

const Navbar = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [userPhoto, setUserPhoto] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { dark, setDark } = useContext(ThemeContext);

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();

    const unsubscribe = onAuthStateChanged(auth, async (userObj) => {
      if (userObj) {
        setUser(userObj.email);
        setUserPhoto(userObj.photoURL);
        localStorage.setItem("user", userObj.email);

        const userDoc = doc(db, "users", userObj.email);
        const docSnap = await getDoc(userDoc);
        if (docSnap.exists()) {
          setIsAdmin(!!docSnap.data().isAdmin);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
        setUserPhoto(null);
        localStorage.removeItem("user");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        localStorage.removeItem("user");
        setUser(null);
        setIsAdmin(false);
        setDropdownOpen(false);
        setUserPhoto(null);
        navigate("/login");
      })
      .catch((err) => {
        console.error("Logout error:", err);
      });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const avatarUrl =
    userPhoto ||
    "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";

  return (
    <div className="flex justify-between items-center px-6 py-3 bg-white dark:bg-gray-900 text-black dark:text-white shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-4">
        <h1
          className="text-xl font-semibold cursor-pointer hover:opacity-80"
          onClick={() => navigate("/dashboard")}
        >
          Interview Simulator
        </h1>
        <button
          onClick={() => setDark(!dark)}
          className="hidden md:inline-block text-sm px-3 py-1 bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded hover:opacity-80 transition"
        >
          {dark ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      <div className="flex items-center space-x-4">
        {/* Hamburger menu for mobile */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="block md:hidden p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800"
        >
          ☰
        </button>

        {/* Avatar dropdown (desktop) */}
        {user && (
          <div className="relative" ref={dropdownRef}>
            <img
              src={avatarUrl}
              alt="User avatar"
              className="w-10 h-10 rounded-full cursor-pointer border-2 border-gray-300 dark:border-gray-600"
              onClick={() => setDropdownOpen((prev) => !prev)}
            />

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 shadow-lg rounded-md w-52 z-10 text-black dark:text-white">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => {
                    navigate("/dashboard");
                    setDropdownOpen(false);
                  }}
                >
                  🏠 Dashboard
                </button>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => {
                    navigate("/history");
                    setDropdownOpen(false);
                  }}
                >
                  📜 Interview History
                </button>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => {
                    navigate("/quiz-history");
                    setDropdownOpen(false);
                  }}
                >
                  📝 Quiz History
                </button>
                {isAdmin && (
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => {
                      navigate("/admin");
                      setDropdownOpen(false);
                    }}
                  >
                    🛠 Admin Panel
                  </button>
                )}
                <button
                  className="w-full text-left px-4 py-2 hover:bg-red-100 dark:hover:bg-red-900 text-red-600"
                  onClick={handleLogout}
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="absolute top-16 right-4 md:hidden bg-white dark:bg-gray-900 text-black dark:text-white shadow-md rounded-md w-52 border border-gray-300 dark:border-gray-700 z-20">
          <button
            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => {
              navigate("/dashboard");
              setMobileMenuOpen(false);
            }}
          >
            🏠 Dashboard
          </button>
          <button
            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => {
              navigate("/history");
              setMobileMenuOpen(false);
            }}
          >
            📜 Interview History
          </button>
          <button
            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => {
              navigate("/quiz-history");
              setMobileMenuOpen(false);
            }}
          >
            📝 Quiz History
          </button>
          {isAdmin && (
            <button
              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => {
                navigate("/admin");
                setMobileMenuOpen(false);
              }}
            >
              🛠 Admin Panel
            </button>
          )}
          <button
            className="w-full text-left px-4 py-2 hover:bg-red-100 dark:hover:bg-red-900 text-red-600"
            onClick={handleLogout}
          >
            🚪 Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default Navbar;
