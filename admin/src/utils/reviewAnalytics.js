/**
 * Math utility helpers for reviews analytics calculations.
 * Shared across Reviews page, Dashboard, and product details views.
 */

export const calculateAverageRating = (reviews = []) => {
  const approved = reviews.filter((r) => r.status === "Approved" && !r.isDeleted);
  if (approved.length === 0) return 0;
  const sum = approved.reduce((acc, r) => acc + (r.rating || 0), 0);
  return Number((sum / approved.length).toFixed(1));
};

export const calculateStarDistribution = (reviews = []) => {
  const approved = reviews.filter((r) => r.status === "Approved" && !r.isDeleted);
  const total = approved.length;

  const dist = {
    5: { count: 0, percentage: 0 },
    4: { count: 0, percentage: 0 },
    3: { count: 0, percentage: 0 },
    2: { count: 0, percentage: 0 },
    1: { count: 0, percentage: 0 },
  };

  if (total === 0) return dist;

  approved.forEach((r) => {
    const star = Math.floor(r.rating);
    if (dist[star] !== undefined) {
      dist[star].count += 1;
    }
  });

  // Calculate percentage values
  for (let key = 1; key <= 5; key++) {
    const count = dist[key].count;
    dist[key].percentage = Number(((count / total) * 100).toFixed(0));
  }

  return dist;
};

export const calculateReviewStats = (reviews = []) => {
  const activeReviews = reviews.filter((r) => !r.isDeleted);
  
  const total = activeReviews.length;
  const pending = activeReviews.filter((r) => r.status === "Pending").length;
  const approved = activeReviews.filter((r) => r.status === "Approved").length;
  const rejected = activeReviews.filter((r) => r.status === "Rejected").length;
  const hidden = activeReviews.filter((r) => r.status === "Hidden").length;

  const averageRating = calculateAverageRating(reviews);
  const starDistribution = calculateStarDistribution(reviews);

  return {
    total,
    pending,
    approved,
    rejected,
    hidden,
    averageRating,
    starDistribution,
  };
};
