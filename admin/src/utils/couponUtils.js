/**
 * Utility math and format helper functions for Coupons & Offers.
 */

export const calculateCouponStatus = (validFrom, validUntil, manualStatus) => {
  if (manualStatus === "Disabled" || manualStatus === "Draft") {
    return manualStatus;
  }
  const now = new Date();
  const start = new Date(validFrom);
  const expiry = new Date(validUntil);

  if (now > expiry) return "Expired";
  if (now >= start) return "Active";
  return "Scheduled";
};

export const isUnlimitedCoupon = (usageLimit) => {
  return usageLimit === null || usageLimit === undefined || usageLimit === "";
};

export const calculateRemainingUses = (usageLimit, usedCount = 0) => {
  if (isUnlimitedCoupon(usageLimit)) return "Unlimited";
  const limit = Number(usageLimit);
  return Math.max(0, limit - usedCount);
};

export const calculateUsagePercentage = (usedCount = 0, usageLimit) => {
  if (isUnlimitedCoupon(usageLimit)) return 0;
  const limit = Number(usageLimit);
  if (limit <= 0) return 0;
  return Math.min(100, Math.round((usedCount / limit) * 100));
};

export const calculateExpiryDays = (validUntil) => {
  const expiry = new Date(validUntil);
  const now = new Date();
  const diffTime = expiry - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const formatDiscount = (type, value) => {
  const numVal = Number(value) || 0;
  if (type === "Percentage") {
    return `${numVal}%`;
  }
  return `₹${numVal}`;
};

export const formatCouponCode = (code = "") => {
  return code.trim().toUpperCase();
};

export const formatCouponValidity = (validFrom, validUntil) => {
  if (!validFrom || !validUntil) return "—";
  const start = new Date(validFrom).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const end = new Date(validUntil).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  return `${start} - ${end}`;
};

export const isCouponExpired = (validUntil) => {
  if (!validUntil) return false;
  return new Date() > new Date(validUntil);
};

export const isCouponScheduled = (validFrom) => {
  if (!validFrom) return false;
  return new Date() < new Date(validFrom);
};

export const isNearlyExhausted = (usedCount = 0, usageLimit) => {
  if (isUnlimitedCoupon(usageLimit)) return false;
  const remaining = calculateRemainingUses(usageLimit, usedCount);
  const totalLimit = Number(usageLimit);
  if (totalLimit <= 0) return false;
  return (remaining / totalLimit) < 0.1; // Less than 10% remaining
};

export const getCouponCountdown = (validUntil, validFrom) => {
  const now = new Date();
  const start = new Date(validFrom);
  const expiry = new Date(validUntil);

  if (now > expiry) {
    const diffTime = now - expiry;
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return `Expired ${days === 0 ? "today" : `${days} days ago`}`;
  }

  if (now < start) {
    const diffTime = start - now;
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return `Starts in ${days} days`;
  }

  const diffTime = expiry - now;
  const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (days >= 1) {
    return `${days} days left`;
  }

  // Under 24h: show live countdown (hours, minutes)
  const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m left`;
};

export const getUsageColor = (percentage) => {
  if (percentage >= 90) return "var(--danger)";
  if (percentage >= 70) return "var(--warning)";
  return "var(--success)";
};
