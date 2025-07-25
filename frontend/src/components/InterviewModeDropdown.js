import React, { useState, useRef, useEffect } from "react";

const InterviewModeDropdown = ({ selectedMode, setSelectedMode }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const options = [
    { label: "🧠 Interview Practice", value: "practice" },
    { label: "📄 Resume-Based Interview", value: "resume" },
    { label: "🧩 Topic-Based Interview", value: "topic" },
    { label: "🧾 AI Resume Review", value: "review" },
      { label: "📝 Quiz", value: "quiz" },
  ];

  const getModeLabel = (mode) => {
    return options.find((opt) => opt.value === mode)?.label || "Select Mode";
  };

  // ✅ Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative inline-block text-left mb-6 w-full max-w-md">
      <label className="block mb-1 font-medium text-black dark:text-white">
        Select Interview Mode:
      </label>
      <button
        type="button"
        onClick={() => setShowDropdown((prev) => !prev)}
        className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm flex justify-between items-center hover:bg-gray-300 dark:hover:bg-gray-700 transition"
      >
        {getModeLabel(selectedMode)}
        <svg
          className="w-5 h-5 ml-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDropdown && (
        <div className="absolute z-30 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setSelectedMode(option.value);
                setShowDropdown(false);
              }}
              className={`block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                selectedMode === option.value ? "bg-gray-100 dark:bg-gray-700" : ""
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default InterviewModeDropdown;
