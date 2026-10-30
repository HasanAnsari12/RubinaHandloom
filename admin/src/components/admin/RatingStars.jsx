import React, { useState } from "react";
import "./RatingStars.css";

const RatingStars = ({
  rating = 0,
  size = "medium",
  showValue = false,
  interactive = false,
  onChange,
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (value) => {
    if (interactive && onChange) {
      onChange(value);
    }
  };

  const handleMouseEnter = (value) => {
    if (interactive) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  const renderStars = () => {
    const stars = [];
    const activeRating = hoverRating || rating;

    for (let i = 1; i <= 5; i++) {
      const isFull = i <= Math.floor(activeRating);
      const isHalf = !isFull && i - 0.5 <= activeRating;
      
      let starClass = "star-empty";
      if (isFull) starClass = "star-full";
      else if (isHalf) starClass = "star-half";

      stars.push(
        <span
          key={i}
          className={`star-symbol-element ${starClass} ${interactive ? "interactive" : ""}`}
          onClick={() => handleClick(i)}
          onMouseEnter={() => handleMouseEnter(i)}
          onMouseLeave={handleMouseLeave}
        >
          ★
        </span>
      );
    }

    return stars;
  };

  return (
    <div className={`rating-stars-wrapper size-${size}`}>
      <div className="stars-flex-row">{renderStars()}</div>
      {showValue && <span className="rating-value-indicator">{Number(rating).toFixed(1)}</span>}
    </div>
  );
};

export default RatingStars;
