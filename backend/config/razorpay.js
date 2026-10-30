const Razorpay = require("razorpay");

/**
 * Get configured Razorpay SDK instance.
 * Reads RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET from environment.
 * In Test Mode, standard test keys (rzp_test_*) should be configured.
 */
const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    if (process.env.NODE_ENV !== "test") {
      console.warn("⚠️ Razorpay credentials (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET) are not configured.");
    }
    return null;
  }

  return new Razorpay({
    key_id,
    key_secret,
  });
};

module.exports = {
  getRazorpayInstance,
};
