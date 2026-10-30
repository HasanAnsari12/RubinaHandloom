import React from "react";
import RatingStars from "../RatingStars";
import "./RatingDistributionChart.css";

const RatingDistributionChart = ({
  averageRating = 0,
  starDistribution = {},
  totalReviews = 0,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="rating-dist-skeleton animate-pulse">
        <div className="skeleton-line-long"></div>
        <div className="skeleton-line-med"></div>
      </div>
    );
  }

  return (
    <div className="rating-distribution-dashboard-widget">
      {/* Left rating summary */}
      <div className="rating-kpi-summary-side">
        <strong className="kpi-avg-score">{Number(averageRating).toFixed(1)}</strong>
        <RatingStars rating={averageRating} size="medium" />
        <span className="kpi-reviews-volume-sub">Based on {totalReviews} approved reviews</span>
      </div>

      {/* Right bars */}
      <div className="rating-bars-side-deck">
        {[5, 4, 3, 2, 1].map((stars) => {
          const percentage = starDistribution[stars] || 0;
          return (
            <div key={stars} className="dashboard-star-dist-row">
              <span className="dist-row-label">{stars} ★</span>
              <div className="dist-row-track">
                <div
                  className="dist-row-fill"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <span className="dist-row-meta">{percentage}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RatingDistributionChart;
