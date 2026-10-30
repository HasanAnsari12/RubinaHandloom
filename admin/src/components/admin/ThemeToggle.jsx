import React, { useState, useEffect } from "react";
import "./ThemeToggle.css";

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("adminTheme") === "dark";
  });

  useEffect(() => {
    if (isDark) {
      document.body.classList.add("dark-theme");
      localStorage.setItem("adminTheme", "dark");
    } else {
      document.body.classList.remove("dark-theme");
      localStorage.setItem("adminTheme", "light");
    }
  }, [isDark]);

  return (
    <button
      className={`theme-toggle-btn ${isDark ? "dark" : "light"}`}
      onClick={() => setIsDark(!isDark)}
      aria-label="Toggle theme"
    >
      <span className="toggle-thumb">
        {isDark ? "🌙" : "☀️"}
      </span>
    </button>
  );
};

export default ThemeToggle;
