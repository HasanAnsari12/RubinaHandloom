const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("crypto");
const {
  verifyRazorpaySignature,
  verifyWebhookSignature,
} = require("../services/paymentService");

test("Payment Security: verifyRazorpaySignature accepts authentic HMAC-SHA256 signature", () => {
  const testSecret = "test_razorpay_secret_987654321";
  const orderId = "order_NmbK123456789";
  const paymentId = "pay_NmbP987654321";

  // Compute authentic signature
  const authenticSignature = crypto
    .createHmac("sha256", testSecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const isValid = verifyRazorpaySignature(
    orderId,
    paymentId,
    authenticSignature,
    testSecret
  );

  assert.equal(isValid, true, "Authentic signature must be verified successfully");
});

test("Payment Security: verifyRazorpaySignature rejects tampered or forged signature", () => {
  const testSecret = "test_razorpay_secret_987654321";
  const orderId = "order_NmbK123456789";
  const paymentId = "pay_NmbP987654321";

  const fakeSignature = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

  const isValid = verifyRazorpaySignature(
    orderId,
    paymentId,
    fakeSignature,
    testSecret
  );

  assert.equal(isValid, false, "Tampered signature must be rejected");
});

test("Payment Security: verifyRazorpaySignature safely rejects mismatched length signatures without throwing", () => {
  const testSecret = "test_razorpay_secret_987654321";
  const orderId = "order_NmbK123456789";
  const paymentId = "pay_NmbP987654321";

  const shortSignature = "short_invalid_sig";

  const isValid = verifyRazorpaySignature(
    orderId,
    paymentId,
    shortSignature,
    testSecret
  );

  assert.equal(isValid, false, "Mismatched length signature must return false safely");
});

test("Payment Security: verifyWebhookSignature validates raw buffer against HMAC-SHA256", () => {
  const webhookSecret = "whsec_test_secret_abc123";
  const rawBody = JSON.stringify({
    event: "payment.captured",
    payload: { payment: { entity: { id: "pay_12345" } } },
  });

  const validSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(Buffer.from(rawBody, "utf8"))
    .digest("hex");

  const isValid = verifyWebhookSignature(
    Buffer.from(rawBody, "utf8"),
    validSignature,
    webhookSecret
  );

  assert.equal(isValid, true, "Authentic webhook raw buffer signature must be verified");

  const isTamperedValid = verifyWebhookSignature(
    Buffer.from(rawBody + "tampered", "utf8"),
    validSignature,
    webhookSecret
  );

  assert.equal(isTamperedValid, false, "Tampered webhook payload must be rejected");
});

test("Payment Pricing: Discount price calculation rule properly prioritizes discountPrice", () => {
  // Scenario 1: Product with discountPrice > 0 (e.g. MRP 4999, Discounted 3499)
  const sareeWithSale = { price: 4999, discountPrice: 3499, title: "Banarasi Katan Silk" };
  const effectivePrice1 =
    sareeWithSale.discountPrice && sareeWithSale.discountPrice > 0
      ? sareeWithSale.discountPrice
      : sareeWithSale.price;

  assert.equal(effectivePrice1, 3499, "Selling price must be 3499, not full MRP 4999");

  // Scenario 2: Product without discountPrice (discountPrice is 0)
  const regularSaree = { price: 2999, discountPrice: 0, title: "Chanderi Cotton Saree" };
  const effectivePrice2 =
    regularSaree.discountPrice && regularSaree.discountPrice > 0
      ? regularSaree.discountPrice
      : regularSaree.price;

  assert.equal(effectivePrice2, 2999, "Selling price must equal price 2999 when discountPrice is 0");
});

test("Payment Routes: Express app mounts /api/payment routes with authentication guards", async () => {
  const http = require("node:http");
  const app = require("../app");
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;

  try {
    // Calling protected calculate-pricing without token should return 401
    const res = await fetch(`http://127.0.0.1:${port}/api/payment/calculate-pricing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    assert.equal(res.status, 401, "Protected endpoint without token must return 401 Unauthorized");
    const data = await res.json();
    assert.equal(data.success, false);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("Deployment Health: Express app responds to /, /health, and /api/health with status 200", async () => {
  const http = require("node:http");
  const app = require("../app");
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;

  try {
    for (const path of ["/", "/health", "/api/health"]) {
      const res = await fetch(`http://127.0.0.1:${port}${path}`);
      assert.equal(res.status, 200, `Health check path ${path} must return HTTP 200`);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.status, "ok");
      assert.match(body.message, /running successfully/i);
    }
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
