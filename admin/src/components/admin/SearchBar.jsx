import React, { useEffect, useRef } from "react";
import "./SearchBar.css";

const SearchBar = ({ placeholder = "Search orders, products, customers...", onSearch }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="search-bar-container">
      <span className="search-bar-icon">🔍</span>
      <input
        ref={inputRef}
        type="text"
        className="search-bar-input"
        placeholder={placeholder}
        onChange={(e) => onSearch && onSearch(e.target.value)}
      />
      <span className="search-bar-shortcut">⌘K</span>
    </div>
  );
};

export default SearchBar;
