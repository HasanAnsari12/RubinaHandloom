import React from "react";
import StatCard from "./StatCard";
import RatingStars from "./RatingStars";
import "./ReviewStats.css";

const ReviewStats = ({
  total = 0,
  pending = 0,
  approved = 0,
  rejected = 0,
  hidden = 0,
  averageRating = 0,
  starDistribution = {},
}) => {
  return (
    <div className="review-stats-deck-container">
      {/* Metrics Cards */}
      <div className="review-stats-cards-grid">
        <StatCard title="Total Reviews" value={total} icon="💬" subtitle="all checkout reviews" />
        <StatCard title="Pending Moderation" value={pending} icon="⏳" trend={pending > 0 ? "neutral" : "positive"} subtitle="requires audit" />
        <StatCard title="Approved" value={approved} icon="🟢" trend="positive" subtitle="visible to customers" />
        <StatCard title="Rejected" value={rejected} icon="🔴" trend="negative" subtitle="void ratings" />
        <StatCard title="Hidden" value={hidden} icon="👁️‍🌫️" subtitle="moderated out" />
      </div>

      {/* Average rating & star distribution */}
      <div className="review-stats-rating-breakdown-card">
        {/* Left: Rating score */}
        <div className="rating-score-overview">
          <span className="overview-average-number">{Number(averageRating).toFixed(1)}</span>
          <RatingStars rating={averageRating} size="medium" />
          <span className="overview-subtext-approved">Based on {approved} approved reviews</span>
        </div>

        {/* Right: Star Bar distribution chart */}
        <div className="rating-bar-distribution-chart">
          {[5, 4, 3, 2, 1].map((stars) => {
            const data = starDistribution[stars] || { count: 0, percentage: 0 };
            return (
              <div key={stars} className="star-dist-row">
                <span className="star-dist-label">{stars} ★</span>
                <div className="star-dist-bar-track">
                  <div
                    className="star-dist-bar-fill"
                    style={{ width: `${data.percentage}%` }}
                  ></div>
                </div>
                <span className="star-dist-meta">
                  {data.count} ({data.percentage}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ReviewStats;
