// frontend/src/services/paymentService.js
import api from "./api";

/**
 * Fetch authoritative pricing calculated on backend
 * @param {string} [couponCode]
 */
export const calculateCheckoutPricing = async (couponCode = "") => {
  const response = await api.post("/payment/calculate-pricing", { couponCode });
  return response.data;
};

/**
 * Request backend to initialize Razorpay payment order
 * @param {string} [couponCode]
 */
export const createPaymentOrder = async (couponCode = "") => {
  const response = await api.post("/payment/create-order", { couponCode });
  return response.data;
};

/**
 * Send Razorpay payment credentials to backend for HMAC verification & atomic order creation
 * @param {object} paymentData - { razorpay_order_id, razorpay_payment_id, razorpay_signature, shippingAddress, couponCode }
 */
export const verifyPayment = async (paymentData) => {
  const response = await api.post("/payment/verify-payment", paymentData);
  return response.data;
};
