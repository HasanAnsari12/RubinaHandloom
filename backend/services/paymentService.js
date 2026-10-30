const crypto = require("crypto");
const { getRazorpayInstance } = require("../config/razorpay");

/**
 * Creates an authoritative Razorpay order in test/live mode.
 * @param {number} amountInRupees - The total payable amount calculated by the backend.
 * @param {string} receiptId - Unique receipt identifier (e.g., user id or timestamp).
 * @returns {Promise<object>} The Razorpay order object.
 */
const createRazorpayOrder = async (amountInRupees, receiptId = "") => {
  const instance = getRazorpayInstance();
  if (!instance) {
    throw new Error("Razorpay gateway is not configured on the server");
  }

  const amountInPaise = Math.round(Number(amountInRupees) * 100);
  if (isNaN(amountInPaise) || amountInPaise <= 0) {
    throw new Error("Invalid order amount for payment creation");
  }

  const options = {
    amount: amountInPaise,
    currency: "INR",
    receipt: receiptId ? `rcpt_${String(receiptId).slice(-15)}` : `rcpt_${Date.now()}`,
    notes: {
      merchant: "SRK Handloom",
      productType: "Authentic Handloom Sarees",
    },
  };

  return await instance.orders.create(options);
};

/**
 * Cryptographically verifies Razorpay payment signature using HMAC SHA-256.
 * Implements timing-safe string comparison to prevent timing side-channel attacks.
 * @param {string} razorpayOrderId
 * @param {string} razorpayPaymentId
 * @param {string} razorpaySignature
 * @param {string} [secretOverride] - Optional secret for testing.
 * @returns {boolean} True if signature is authentic.
 */
const verifyRazorpaySignature = (
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
  secretOverride
) => {
  const secret = secretOverride || process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    throw new Error("Razorpay key secret is not configured on the server");
  }

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return false;
  }

  const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  const generatedBuffer = Buffer.from(generatedSignature, "utf8");
  const providedBuffer = Buffer.from(razorpaySignature, "utf8");

  if (generatedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(generatedBuffer, providedBuffer);
};

/**
 * Verifies Razorpay Webhook signature against raw request body.
 * @param {Buffer|string} rawBody - Raw buffer or raw string of the webhook request body.
 * @param {string} webhookSignature - The signature from 'x-razorpay-signature' header.
 * @param {string} [secretOverride] - Webhook secret override.
 * @returns {boolean} True if webhook is authentic.
 */
const verifyWebhookSignature = (rawBody, webhookSignature, secretOverride) => {
  const secret = secretOverride || process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("Razorpay webhook secret is not configured on the server");
  }

  if (!rawBody || !webhookSignature) {
    return false;
  }

  const bodyContent = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody, "utf8");
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(bodyContent)
    .digest("hex");

  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  const receivedBuffer = Buffer.from(webhookSignature, "utf8");

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
};

/**
 * Authoritatively retrieves payment details from Razorpay gateway API.
 * @param {string} paymentId
 * @returns {Promise<object>} The Razorpay payment entity.
 */
const fetchRazorpayPayment = async (paymentId) => {
  const instance = getRazorpayInstance();
  if (!instance) {
    throw new Error("Razorpay gateway is not configured on the server");
  }
  return await instance.payments.fetch(paymentId);
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpaySignature,
  verifyWebhookSignature,
  fetchRazorpayPayment,
};

