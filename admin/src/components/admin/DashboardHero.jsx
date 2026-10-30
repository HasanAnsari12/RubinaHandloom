import React, { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import "./DashboardHero.css";

const DashboardHero = () => {
  const { currentAdmin } = useAuth();
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = dateTime.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedTime = dateTime.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return (
    <div className="dashboard-hero-banner">
      <div className="hero-banner-content">
        <div className="hero-welcome-text">
          <span className="hero-date-badge">⚜️ {formattedDate} — {formattedTime}</span>
          <h1 className="hero-heading">
            Welcome Back, <span>{currentAdmin?.name || "Administrator"}</span> 👋
          </h1>
          <p className="hero-description">
            Here's what's happening with your luxury saree collection store today. Keep crafting heritage.
          </p>
        </div>
        <div className="hero-vintage-badge">
          <div className="vintage-inner">
            <span className="vintage-txt">ESTD</span>
            <span className="vintage-yr">1985</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHero;
