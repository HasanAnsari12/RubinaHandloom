import React from "react";
import "./ChartCard.css";

const ChartCard = ({ title, subtitle, type = "line", data = [] }) => {
  return (
    <div className="luxury-chart-card">
      <div className="chart-card-header">
        <div>
          <h3 className="chart-card-title">{title}</h3>
          {subtitle && <p className="chart-card-subtitle">{subtitle}</p>}
        </div>
        <span className="chart-card-action-dot">•••</span>
      </div>

      <div className="chart-card-body">
        {type === "line" && (
          <div className="svg-chart-container">
            {/* Draw a beautiful smooth SVG line chart */}
            <svg viewBox="0 0 300 120" className="animated-line-svg">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="30" x2="300" y2="30" stroke="rgba(123,30,58,0.04)" strokeDasharray="3" />
              <line x1="0" y1="60" x2="300" y2="60" stroke="rgba(123,30,58,0.04)" strokeDasharray="3" />
              <line x1="0" y1="90" x2="300" y2="90" stroke="rgba(123,30,58,0.04)" strokeDasharray="3" />

              {/* Area path */}
              <path
                d="M0,110 L15,100 L45,105 L75,70 L105,85 L135,45 L165,55 L195,20 L225,35 L255,10 L285,15 L300,5 L300,120 L0,120 Z"
                fill="url(#chartGradient)"
              />
              {/* Path stroke */}
              <path
                d="M0,110 L15,100 L45,105 L75,70 L105,85 L135,45 L165,55 L195,20 L225,35 L255,10 L285,15 L300,5"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="draw-stroke-path"
              />
              {/* Points */}
              <circle cx="195" cy="20" r="4" fill="var(--accent)" stroke="var(--primary)" strokeWidth="1.5" />
              <circle cx="255" cy="10" r="4" fill="var(--accent)" stroke="var(--primary)" strokeWidth="1.5" />
            </svg>
            <div className="chart-x-axis">
              <span>Jan</span>
              <span>Mar</span>
              <span>May</span>
              <span>Jul</span>
              <span>Sep</span>
              <span>Nov</span>
            </div>
          </div>
        )}

        {type === "bar" && (
          <div className="bar-chart-container">
            {data.map((item, idx) => (
              <div key={idx} className="bar-chart-col">
                <div className="bar-chart-rail">
                  <div
                    className="bar-chart-fill"
                    style={{ height: `${item.percentage || 40}%` }}
                  >
                    <span className="bar-tooltip">₹{item.value}</span>
                  </div>
                </div>
                <span className="bar-label">{item.label}</span>
              </div>
            ))}
          </div>
        )}

        {type === "radial" && (
          <div className="radial-chart-container">
            <div className="radial-visual-wrapper">
              {/* SVG circular donut chart */}
              <svg viewBox="0 0 100 100" className="donut-svg">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F3F1ED" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="var(--primary)"
                  strokeWidth="8"
                  strokeDasharray="251"
                  strokeDashoffset="65"
                  strokeLinecap="round"
                  className="draw-radial-stroke"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="var(--accent)"
                  strokeWidth="8"
                  strokeDasharray="251"
                  strokeDashoffset="190"
                  strokeLinecap="round"
                  className="draw-radial-stroke-gold"
                />
              </svg>
              <div className="radial-center-text">
                <strong>72%</strong>
                <span>Direct</span>
              </div>
            </div>
            
            <div className="radial-labels-list">
              <div className="radial-label-item">
                <span className="radial-color-dot wine"></span>
                <span className="radial-name">Kanchipuram Silk</span>
                <span className="radial-val">65%</span>
              </div>
              <div className="radial-label-item">
                <span className="radial-color-dot gold"></span>
                <span className="radial-name">Banarasi Brocade</span>
                <span className="radial-val">24%</span>
              </div>
              <div className="radial-label-item">
                <span className="radial-color-dot gray"></span>
                <span className="radial-name">Others</span>
                <span className="radial-val">11%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartCard;
