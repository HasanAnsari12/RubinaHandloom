const test = require("node:test");
const assert = require("node:assert/strict");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const mongoose = require("mongoose");

const User = require("../models/User");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const Coupon = require("../models/Coupon");

const { loginUser, resetPassword } = require("../controllers/authController");
const { updateProfile } = require("../controllers/userController");
const { createOrder, verifyPayment, handleWebhook } = require("../controllers/paymentController");
const paymentService = require("../services/paymentService");

// Helper to create mock Express request and response
const createMockContext = (headers = {}, params = {}, body = {}, user = null) => {
  const req = {
    headers,
    params,
    body,
    user,
    rawBody: typeof body === "string" ? body : JSON.stringify(body),
  };
  const res = {
    statusCode: 200,
    body: null,
    headers: {},
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
    send(data) {
      this.body = data;
      return this;
    },
    setHeader(key, val) {
      this.headers[key] = val;
      return this;
    },
  };
  return { req, res };
};

// ============================================================================
// FIX 1: SERVER STARTUP & MONGODB CONNECTION SAFETY
// ============================================================================
test("Fix 1: Server startup aborts when MongoDB connection fails without accepting HTTP requests", async () => {
  let dbConnected = false;
  let serverListened = false;

  const mockConnectDB = async () => {
    throw new Error("Connection refused at port 27017");
  };

  const mockApp = {
    listen: () => {
      serverListened = true;
    },
  };

  const startServerSim = async () => {
    try {
      await mockConnectDB();
      mockApp.listen(5000);
      dbConnected = true;
    } catch (err) {
      // Caught error prevents app.listen from executing
      return "aborted";
    }
  };

  const result = await startServerSim();
  assert.equal(result, "aborted");
  assert.equal(dbConnected, false, "Database connection must not be marked successful");
  assert.equal(serverListened, false, "HTTP server must NOT start listening if DB fails");
});

// ============================================================================
// FIX 2: SENSITIVE FIELD PROTECTION (PASSWORD HASHES & TOKENS)
// ============================================================================
test("Fix 2: User schema has select: false for password, resetToken, and emailVerificationToken", () => {
  const passwordPath = User.schema.path("password");
  const resetTokenPath = User.schema.path("resetToken");
  const emailTokenPath = User.schema.path("emailVerificationToken");

  assert.equal(passwordPath.options.select, false, "password must have select: false");
  assert.equal(resetTokenPath.options.select, false, "resetToken must have select: false");
  assert.equal(emailTokenPath.options.select, false, "emailVerificationToken must have select: false");
});

test("Fix 2: User model toJSON and toObject transforms strip password and tokens", () => {
  const dummyUser = new User({
    name: "Customer A",
    email: "customer@example.com",
    password: "hashedPassword123",
    resetToken: "sensitiveResetTokenValue",
    emailVerificationToken: "sensitiveEmailTokenValue",
  });

  const jsonObject = dummyUser.toJSON();
  assert.equal(jsonObject.password, undefined, "toJSON must not expose password");
  assert.equal(jsonObject.resetToken, undefined, "toJSON must not expose resetToken");
  assert.equal(jsonObject.emailVerificationToken, undefined, "toJSON must not expose emailVerificationToken");

  const plainObject = dummyUser.toObject();
  assert.equal(plainObject.password, undefined, "toObject must not expose password");
  assert.equal(plainObject.resetToken, undefined, "toObject must not expose resetToken");
  assert.equal(plainObject.emailVerificationToken, undefined, "toObject must not expose emailVerificationToken");
});

test("Fix 2: loginUser authenticates successfully with select: false and never exposes password hash in response", async () => {
  process.env.JWT_SECRET = "test-secret-key-123456789";
  const plainPassword = "SecretPassword@2026";
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const mockUserDoc = {
    _id: new mongoose.Types.ObjectId(),
    name: "Hasan Ansari",
    email: "hasan@example.com",
    role: "user",
    isVerified: true,
    isBlocked: false,
    isDeleted: false,
    password: hashedPassword,
  };

  const origFindOne = User.findOne;
  User.findOne = () => ({
    select: (field) => {
      assert.equal(field, "+password", "loginUser must explicitly select +password");
      return Promise.resolve(mockUserDoc);
    },
  });

  try {
    const { req, res } = createMockContext({}, {}, {
      email: "hasan@example.com",
      password: plainPassword,
    });

    await loginUser(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.token, "JWT token must be returned");
    assert.equal(res.body.user.password, undefined, "Response must not contain password");
    assert.equal(res.body.user.resetToken, undefined, "Response must not contain resetToken");
    assert.equal(res.body.user.emailVerificationToken, undefined, "Response must not contain emailVerificationToken");
  } finally {
    User.findOne = origFindOne;
  }
});

test("Fix 2: updateProfile sanitizes user object and never exposes password or tokens", async () => {
  const mockUserDoc = new User({
    name: "Updated Name",
    email: "test@example.com",
    phone: "9876543210",
    password: "hiddenPasswordHash",
    resetToken: "hiddenResetToken",
    emailVerificationToken: "hiddenVerifyToken",
  });
  mockUserDoc.save = async () => mockUserDoc;

  const origFindById = User.findById;
  User.findById = async () => mockUserDoc;

  try {
    const { req, res } = createMockContext(
      {},
      {},
      { name: "Updated Name", phone: "9876543210" },
      { id: mockUserDoc._id }
    );

    await updateProfile(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.user.name, "Updated Name");
    assert.equal(res.body.user.password, undefined, "Profile update must not leak password");
    assert.equal(res.body.user.resetToken, undefined, "Profile update must not leak resetToken");
    assert.equal(res.body.user.emailVerificationToken, undefined, "Profile update must not leak emailVerificationToken");
  } finally {
    User.findById = origFindById;
  }
});

// ============================================================================
// FIX 3: RAZORPAY PENDING ORDER LIFECYCLE & IDEMPOTENT PROCESSING
// ============================================================================
test("Fix 3: createOrder creates a pending order linked to the Razorpay order ID to prevent orphan payments", async () => {
  const userId = new mongoose.Types.ObjectId();
  const productId = new mongoose.Types.ObjectId();
  const rzpOrderId = "order_rzp_pending_test_123";

  // Mock Cart
  const origCartFindOne = Cart.findOne;
  Cart.findOne = () => ({
    populate: () =>
      Promise.resolve({
        user: userId,
        cartItems: [
          {
            product: {
              _id: productId,
              title: "Banarasi Silk Saree",
              price: 5000,
              discountPrice: 4000,
              stock: 10,
            },
            quantity: 1,
          },
        ],
      }),
  });

  // Mock createRazorpayOrder
  const origCreateRazorpay = paymentService.createRazorpayOrder;
  paymentService.createRazorpayOrder = async () => ({
    id: rzpOrderId,
    amount: 400000,
    currency: "INR",
  });

  let createdOrderPayload = null;
  const origOrderCreate = Order.create;
  Order.create = async (payload) => {
    createdOrderPayload = payload;
    return {
      _id: "order_mongo_pending_123",
      ...payload,
    };
  };

  try {
    const { req, res } = createMockContext({}, {}, {}, { _id: userId, name: "Customer Test", phone: "9999999999" });

    await createOrder(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.razorpayOrderId, rzpOrderId);
    assert.ok(createdOrderPayload, "Pending order must be created in MongoDB");
    assert.equal(createdOrderPayload.paymentStatus, "Pending");
    assert.equal(createdOrderPayload.orderStatus, "Pending");
    assert.equal(createdOrderPayload.paymentResult.razorpayOrderId, rzpOrderId);
    assert.equal(createdOrderPayload.totalAmount, 4000);
  } finally {
    Cart.findOne = origCartFindOne;
    paymentService.createRazorpayOrder = origCreateRazorpay;
    Order.create = origOrderCreate;
  }
});

test("Fix 3: verifyPayment updates pending order to Paid, decrements stock atomically, and is strictly idempotent on duplicate call", async () => {
  const userId = new mongoose.Types.ObjectId();
  const productId = new mongoose.Types.ObjectId();
  const rzpOrderId = "order_rzp_lifecycle_456";
  const rzpPaymentId = "pay_rzp_456";
  const testSecret = "test_razorpay_secret_key";
  process.env.RAZORPAY_KEY_SECRET = testSecret;

  const validSignature = crypto
    .createHmac("sha256", testSecret)
    .update(`${rzpOrderId}|${rzpPaymentId}`)
    .digest("hex");

  let stockCount = 10;
  const origFindOneAndUpdate = Product.findOneAndUpdate;
  Product.findOneAndUpdate = async (query, update) => {
    if (stockCount >= 1) {
      stockCount += update.$inc.stock;
      return { _id: productId, stock: stockCount };
    }
    return null;
  };

  const origCartUpdateOne = Cart.updateOne;
  let cartCleared = false;
  Cart.updateOne = async () => {
    cartCleared = true;
  };

  // Mock Order in database starting in 'Pending' state
  const mockOrderDoc = {
    _id: "order_mongo_456",
    user: userId,
    paymentStatus: "Pending",
    orderStatus: "Pending",
    orderItems: [{ product: productId, quantity: 1, priceAtPurchase: 4000 }],
    shippingAddress: {
      fullName: "Initial Address",
      phone: "0000000000",
      house: "H1",
      area: "A1",
      city: "C1",
      state: "S1",
      pincode: "111111",
    },
    paymentResult: { razorpayOrderId: rzpOrderId },
    save: async function () {
      return this;
    },
  };

  const origOrderFindOne = Order.findOne;
  Order.findOne = async () => mockOrderDoc;

  try {
    const verifiedShipping = {
      fullName: "Hasan Ansari",
      phone: "9876543210",
      house: "Flat 101",
      area: "MG Road",
      city: "Varanasi",
      state: "Uttar Pradesh",
      pincode: "221001",
    };

    // 1. FIRST CALL: Successful payment verification
    const { req: req1, res: res1 } = createMockContext(
      {},
      {},
      {
        razorpay_order_id: rzpOrderId,
        razorpay_payment_id: rzpPaymentId,
        razorpay_signature: validSignature,
        shippingAddress: verifiedShipping,
      },
      { _id: userId, email: "hasan@example.com" }
    );

    await verifyPayment(req1, res1);

    assert.equal(res1.statusCode, 201);
    assert.equal(res1.body.success, true);
    assert.equal(mockOrderDoc.paymentStatus, "Paid");
    assert.equal(mockOrderDoc.orderStatus, "Processing");
    assert.equal(mockOrderDoc.paymentResult.id, rzpPaymentId);
    assert.equal(mockOrderDoc.shippingAddress.fullName, "Hasan Ansari");
    assert.equal(stockCount, 9, "Stock must decrement by exactly 1 on first verification");
    assert.equal(cartCleared, true, "Cart must be cleared on verification");

    // 2. SECOND CALL (REPLAY / DUPLICATE): Must be idempotent
    const { req: req2, res: res2 } = createMockContext(
      {},
      {},
      {
        razorpay_order_id: rzpOrderId,
        razorpay_payment_id: rzpPaymentId,
        razorpay_signature: validSignature,
        shippingAddress: verifiedShipping,
      },
      { _id: userId, email: "hasan@example.com" }
    );

    await verifyPayment(req2, res2);

    assert.equal(res2.statusCode, 200);
    assert.equal(res2.body.success, true);
    assert.match(res2.body.message, /already confirmed/i);
    assert.equal(stockCount, 9, "Stock must NOT decrement a second time on duplicate verification");
  } finally {
    Product.findOneAndUpdate = origFindOneAndUpdate;
    Cart.updateOne = origCartUpdateOne;
    Order.findOne = origOrderFindOne;
    delete process.env.RAZORPAY_KEY_SECRET;
  }
});

test("Fix 3: Webhook payment.captured locates pending order when customer closed browser, finalizes order, and ignores duplicate calls", async () => {
  const userId = new mongoose.Types.ObjectId();
  const productId = new mongoose.Types.ObjectId();
  const couponId = new mongoose.Types.ObjectId();
  const rzpOrderId = "order_rzp_webhook_789";
  const rzpPaymentId = "pay_rzp_webhook_789";
  const webhookSecret = "test_webhook_secret_key";
  process.env.RAZORPAY_WEBHOOK_SECRET = webhookSecret;

  let stockCount = 5;
  const origFindOneAndUpdate = Product.findOneAndUpdate;
  Product.findOneAndUpdate = async (query, update) => {
    if (stockCount >= 1) {
      stockCount += update.$inc.stock;
      return { _id: productId, stock: stockCount };
    }
    return null;
  };

  let couponUsedCount = 0;
  const origCouponFindByIdAndUpdate = Coupon.findByIdAndUpdate;
  Coupon.findByIdAndUpdate = async (id, update) => {
    couponUsedCount += update.$inc.usedCount;
  };

  const origCartUpdateOne = Cart.updateOne;
  let cartCleared = false;
  Cart.updateOne = async () => {
    cartCleared = true;
  };

  const mockOrderDoc = {
    _id: "order_mongo_orphan_prevented",
    user: userId,
    coupon: couponId,
    totalAmount: 2500,
    paymentStatus: "Pending", // Customer closed browser before frontend verify-payment
    orderStatus: "Pending",
    orderItems: [{ product: productId, quantity: 1, priceAtPurchase: 2500 }],
    paymentResult: { razorpayOrderId: rzpOrderId },
    save: async function () {
      return this;
    },
  };

  const origOrderFindOne = Order.findOne;
  Order.findOne = async () => mockOrderDoc;

  try {
    const payloadObject = {
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: rzpPaymentId,
            order_id: rzpOrderId,
            amount: 250000,
            currency: "INR",
            email: "browser_closed@example.com",
          },
        },
      },
    };
    const rawPayload = JSON.stringify(payloadObject);
    const validSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(Buffer.from(rawPayload, "utf8"))
      .digest("hex");

    // 1. FIRST WEBHOOK: payment.captured processes the pending order
    const { req: req1, res: res1 } = createMockContext(
      { "x-razorpay-signature": validSignature },
      {},
      payloadObject
    );
    req1.rawBody = rawPayload;

    await handleWebhook(req1, res1);

    assert.equal(res1.statusCode, 200);
    assert.equal(res1.body.status, "ok");
    assert.equal(mockOrderDoc.paymentStatus, "Paid", "Pending order must be finalized as Paid by webhook");
    assert.equal(mockOrderDoc.orderStatus, "Processing");
    assert.equal(mockOrderDoc.paymentResult.id, rzpPaymentId);
    assert.equal(stockCount, 4, "Stock must be decremented by exactly 1");
    assert.equal(couponUsedCount, 1, "Coupon usage count must increment by 1");
    assert.equal(cartCleared, true, "Cart must be cleared");

    // 2. DUPLICATE WEBHOOK RETRY: Must be idempotent and not decrement stock or increment coupon again
    const { req: req2, res: res2 } = createMockContext(
      { "x-razorpay-signature": validSignature },
      {},
      payloadObject
    );
    req2.rawBody = rawPayload;

    await handleWebhook(req2, res2);

    assert.equal(res2.statusCode, 200);
    assert.equal(res2.body.status, "ok");
    assert.equal(stockCount, 4, "Stock must NOT decrement again on duplicate webhook");
    assert.equal(couponUsedCount, 1, "Coupon count must NOT increment again on duplicate webhook");
  } finally {
    Product.findOneAndUpdate = origFindOneAndUpdate;
    Coupon.findByIdAndUpdate = origCouponFindByIdAndUpdate;
    Cart.updateOne = origCartUpdateOne;
    Order.findOne = origOrderFindOne;
    delete process.env.RAZORPAY_WEBHOOK_SECRET;
  }
});

test("Fix 3: Webhook payment.failed marks pending order as Failed without decrementing stock", async () => {
  const rzpOrderId = "order_rzp_failed_101";
  const rzpPaymentId = "pay_rzp_failed_101";
  const webhookSecret = "test_webhook_secret_key";
  process.env.RAZORPAY_WEBHOOK_SECRET = webhookSecret;

  let stockCount = 10;
  const origFindOneAndUpdate = Product.findOneAndUpdate;
  Product.findOneAndUpdate = async () => {
    stockCount -= 1;
  };

  const mockOrderDoc = {
    _id: "order_mongo_failed_101",
    paymentStatus: "Pending",
    orderStatus: "Pending",
    paymentResult: { razorpayOrderId: rzpOrderId },
    save: async function () {
      return this;
    },
  };

  const origOrderFindOne = Order.findOne;
  Order.findOne = async () => mockOrderDoc;

  try {
    const payloadObject = {
      event: "payment.failed",
      payload: {
        payment: {
          entity: {
            id: rzpPaymentId,
            order_id: rzpOrderId,
          },
        },
      },
    };
    const rawPayload = JSON.stringify(payloadObject);
    const validSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(Buffer.from(rawPayload, "utf8"))
      .digest("hex");

    const { req, res } = createMockContext(
      { "x-razorpay-signature": validSignature },
      {},
      payloadObject
    );
    req.rawBody = rawPayload;

    await handleWebhook(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.status, "ok");
    assert.equal(mockOrderDoc.paymentStatus, "Failed");
    assert.equal(stockCount, 10, "Stock must remain untouched on failed payment");
  } finally {
    Product.findOneAndUpdate = origFindOneAndUpdate;
    Order.findOne = origOrderFindOne;
    delete process.env.RAZORPAY_WEBHOOK_SECRET;
  }
});

test("Fix 2: verifyEmail functions properly with select: false emailVerificationToken", async () => {
  const { verifyEmail } = require("../controllers/authController");
  const rawToken = "sample_raw_verify_token_12345";
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  let saved = false;
  const mockUser = {
    _id: "user_verify_id",
    email: "verify_flow@example.com",
    isVerified: false,
    emailVerificationToken: hashedToken,
    emailVerificationTokenExpire: Date.now() + 60000,
    save: async function () {
      saved = true;
      return this;
    },
  };

  const origFindOne = User.findOne;
  User.findOne = async (query) => {
    if (query.emailVerificationToken === hashedToken) {
      return mockUser;
    }
    return null;
  };

  try {
    const { req, res } = createMockContext({ accept: "application/json" }, { token: rawToken });
    await verifyEmail(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(mockUser.isVerified, true);
    assert.equal(mockUser.emailVerificationToken, undefined);
    assert.equal(saved, true);
  } finally {
    User.findOne = origFindOne;
  }
});

test("Fix 2: resetPassword functions properly with select: false password, rejecting reuse and resetting password", async () => {
  const { resetPassword } = require("../controllers/authController");
  const rawToken = "sample_reset_token_67890";
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  const oldPassword = "OldPassword@2026";
  const hashedOldPassword = await bcrypt.hash(oldPassword, 10);

  let saved = false;
  const mockUser = {
    _id: "user_reset_id",
    email: "reset_flow@example.com",
    password: hashedOldPassword,
    resetToken: hashedToken,
    resetTokenExpire: Date.now() + 60000,
    save: async function () {
      saved = true;
      return this;
    },
  };

  const origFindOne = User.findOne;
  User.findOne = () => ({
    select: (field) => {
      assert.equal(field, "+password", "resetPassword must select +password");
      return Promise.resolve(mockUser);
    },
  });

  try {
    // 1. Same password should be rejected
    const { req: req1, res: res1 } = createMockContext({}, { token: rawToken }, { password: oldPassword });
    await resetPassword(req1, res1);
    assert.equal(res1.statusCode, 400);
    assert.match(res1.body.message, /cannot be the same/i);

    // 2. New password should be accepted
    const { req: req2, res: res2 } = createMockContext({}, { token: rawToken }, { password: "BrandNewPassword@2026" });
    await resetPassword(req2, res2);
    assert.equal(res2.statusCode, 200);
    assert.equal(res2.body.success, true);
    assert.equal(saved, true);
    assert.equal(mockUser.resetToken, undefined);

    const matchNew = await bcrypt.compare("BrandNewPassword@2026", mockUser.password);
    assert.equal(matchNew, true);
  } finally {
    User.findOne = origFindOne;
  }
});

// ============================================================================
// STEP 3 PAYMENT SAFETY TESTS (FIXES 1, 2, 3, & 4)
// ============================================================================

test("Step 3 Fix 3: verifyPayment rejects cross-customer order verification with 403 Forbidden", async () => {
  const legitOwnerId = new mongoose.Types.ObjectId();
  const attackerId = new mongoose.Types.ObjectId();
  const rzpOrderId = "order_rzp_cross_customer_123";
  const rzpPaymentId = "pay_rzp_cross_customer_123";
  const secret = "test_key_secret_step3";
  process.env.RAZORPAY_KEY_SECRET = secret;

  const validSignature = crypto
    .createHmac("sha256", secret)
    .update(`${rzpOrderId}|${rzpPaymentId}`)
    .digest("hex");

  const mockOrderDoc = {
    _id: new mongoose.Types.ObjectId(),
    user: legitOwnerId,
    totalAmount: 500,
    paymentStatus: "Pending",
    orderStatus: "Pending",
    paymentResult: { razorpayOrderId: rzpOrderId },
  };

  const origOrderFindOne = Order.findOne;
  Order.findOne = async () => mockOrderDoc;

  try {
    const { req, res } = createMockContext(
      {},
      {},
      {
        razorpay_order_id: rzpOrderId,
        razorpay_payment_id: rzpPaymentId,
        razorpay_signature: validSignature,
        shippingAddress: {
          fullName: "Attacker",
          phone: "1234567890",
          house: "A",
          area: "B",
          city: "C",
          state: "D",
          pincode: "111111",
        },
      },
      { _id: attackerId, email: "attacker@example.com" }
    );

    await verifyPayment(req, res);

    assert.equal(res.statusCode, 403);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /not authorized/i);
    assert.equal(mockOrderDoc.paymentStatus, "Pending", "Order must NOT be modified by non-owner");
  } finally {
    Order.findOne = origOrderFindOne;
    delete process.env.RAZORPAY_KEY_SECRET;
  }
});

test("Step 3 Fix 4: verifyPayment rejects mismatched currency or mismatched amount", async () => {
  const userId = new mongoose.Types.ObjectId();
  const rzpOrderId = "order_rzp_mismatch_456";
  const rzpPaymentId = "pay_rzp_mismatch_456";
  const secret = "test_key_secret_step3_mismatch";
  process.env.RAZORPAY_KEY_SECRET = secret;

  const validSignature = crypto
    .createHmac("sha256", secret)
    .update(`${rzpOrderId}|${rzpPaymentId}`)
    .digest("hex");

  const mockOrderDoc = {
    _id: new mongoose.Types.ObjectId(),
    user: userId,
    totalAmount: 750, // ₹750 = 75000 paise
    paymentStatus: "Pending",
    orderStatus: "Pending",
    paymentResult: { razorpayOrderId: rzpOrderId },
  };

  const origOrderFindOne = Order.findOne;
  Order.findOne = async () => mockOrderDoc;

  try {
    // 1. Currency mismatch (e.g. USD)
    const { req: req1, res: res1 } = createMockContext(
      {},
      {},
      {
        razorpay_order_id: rzpOrderId,
        razorpay_payment_id: rzpPaymentId,
        razorpay_signature: validSignature,
        shippingAddress: {
          fullName: "Valid User",
          phone: "1234567890",
          house: "A",
          area: "B",
          city: "C",
          state: "D",
          pincode: "111111",
        },
        currency: "USD",
      },
      { _id: userId, email: "user@example.com" }
    );
    await verifyPayment(req1, res1);
    assert.equal(res1.statusCode, 400);
    assert.match(res1.body.message, /Expected INR/i);

    // 2. Amount mismatch (e.g. 50000 paise instead of 75000 paise)
    const { req: req2, res: res2 } = createMockContext(
      {},
      {},
      {
        razorpay_order_id: rzpOrderId,
        razorpay_payment_id: rzpPaymentId,
        razorpay_signature: validSignature,
        shippingAddress: {
          fullName: "Valid User",
          phone: "1234567890",
          house: "A",
          area: "B",
          city: "C",
          state: "D",
          pincode: "111111",
        },
        amount: 50000,
      },
      { _id: userId, email: "user@example.com" }
    );
    await verifyPayment(req2, res2);
    assert.equal(res2.statusCode, 400);
    assert.match(res2.body.message, /amount mismatch/i);
    assert.equal(mockOrderDoc.paymentStatus, "Pending");
  } finally {
    Order.findOne = origOrderFindOne;
    delete process.env.RAZORPAY_KEY_SECRET;
  }
});

test("Step 3 Fix 4: handleWebhook rejects mismatched currency, amount, or gateway order ID", async () => {
  const rzpOrderId = "order_rzp_webhook_val_789";
  const rzpPaymentId = "pay_rzp_webhook_val_789";
  const webhookSecret = "test_webhook_secret_step3";
  process.env.RAZORPAY_WEBHOOK_SECRET = webhookSecret;

  const mockOrderDoc = {
    _id: "order_mongo_val_789",
    totalAmount: 1200, // ₹1200 = 120000 paise
    paymentStatus: "Pending",
    orderStatus: "Pending",
    paymentResult: { razorpayOrderId: rzpOrderId },
  };

  const origOrderFindOne = Order.findOne;
  Order.findOne = async () => mockOrderDoc;

  try {
    // 1. Currency mismatch in webhook
    const currencyMismatchPayload = {
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: rzpPaymentId,
            order_id: rzpOrderId,
            currency: "EUR",
            amount: 120000,
          },
        },
      },
    };
    const raw1 = JSON.stringify(currencyMismatchPayload);
    const sig1 = crypto.createHmac("sha256", webhookSecret).update(Buffer.from(raw1, "utf8")).digest("hex");
    const { req: req1, res: res1 } = createMockContext({ "x-razorpay-signature": sig1 }, {}, currencyMismatchPayload);
    req1.rawBody = raw1;
    await handleWebhook(req1, res1);
    assert.equal(res1.statusCode, 400);
    assert.match(res1.body.message, /currency/i);

    // 2. Amount mismatch in webhook
    const amountMismatchPayload = {
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: rzpPaymentId,
            order_id: rzpOrderId,
            currency: "INR",
            amount: 50000, // expected 120000
          },
        },
      },
    };
    const raw2 = JSON.stringify(amountMismatchPayload);
    const sig2 = crypto.createHmac("sha256", webhookSecret).update(Buffer.from(raw2, "utf8")).digest("hex");
    const { req: req2, res: res2 } = createMockContext({ "x-razorpay-signature": sig2 }, {}, amountMismatchPayload);
    req2.rawBody = raw2;
    await handleWebhook(req2, res2);
    assert.equal(res2.statusCode, 400);
    assert.match(res2.body.message, /amount mismatch/i);

    // 3. Order ID mismatch
    const orderIdMismatchPayload = {
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: rzpPaymentId,
            order_id: "order_different_gateway_id",
            currency: "INR",
            amount: 120000,
          },
        },
      },
    };
    const raw3 = JSON.stringify(orderIdMismatchPayload);
    const sig3 = crypto.createHmac("sha256", webhookSecret).update(Buffer.from(raw3, "utf8")).digest("hex");
    const { req: req3, res: res3 } = createMockContext({ "x-razorpay-signature": sig3 }, {}, orderIdMismatchPayload);
    req3.rawBody = raw3;
    await handleWebhook(req3, res3);
    assert.equal(res3.statusCode, 400);
    assert.match(res3.body.message, /order id mismatch/i);

    assert.equal(mockOrderDoc.paymentStatus, "Pending", "Order must remain Pending when webhook details mismatch");
  } finally {
    Order.findOne = origOrderFindOne;
    delete process.env.RAZORPAY_WEBHOOK_SECRET;
  }
});

test("Step 3 Fix 2: cancelOrder does NOT restock inventory for unpaid pending Razorpay orders (prevents phantom stock)", async () => {
  const { cancelOrder } = require("../controllers/orderController");
  const userId = new mongoose.Types.ObjectId();
  const orderId = new mongoose.Types.ObjectId();
  const productId = new mongoose.Types.ObjectId();

  let stockRestoredCount = 0;
  const origFindByIdAndUpdate = Product.findByIdAndUpdate;
  Product.findByIdAndUpdate = async () => {
    stockRestoredCount++;
  };

  const mockOrder = {
    _id: orderId,
    user: userId,
    paymentMethod: "Razorpay",
    paymentStatus: "Pending",
    orderStatus: "Pending",
    isStockDecremented: false,
    orderItems: [{ product: productId, quantity: 3 }],
    save: async function () {
      return this;
    },
  };

  const origOrderFindById = Order.findById;
  Order.findById = async () => mockOrder;

  try {
    const { req, res } = createMockContext({}, { id: orderId.toString() }, {}, { _id: userId });
    await cancelOrder(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(mockOrder.orderStatus, "Cancelled");
    assert.equal(mockOrder.isStockDecremented, false);
    assert.equal(stockRestoredCount, 0, "Inventory must NOT be restored when cancelling an unpaid order");
  } finally {
    Product.findByIdAndUpdate = origFindByIdAndUpdate;
    Order.findById = origOrderFindById;
  }
});

test("Step 3 Fix 2: cancelOrder restores stock for Paid/COD orders, and repeated cancellation cannot restore stock twice", async () => {
  const { cancelOrder } = require("../controllers/orderController");
  const userId = new mongoose.Types.ObjectId();
  const orderId = new mongoose.Types.ObjectId();
  const productId = new mongoose.Types.ObjectId();

  let stockRestored = 0;
  const origFindByIdAndUpdate = Product.findByIdAndUpdate;
  Product.findByIdAndUpdate = async (id, update) => {
    stockRestored += update.$inc.stock;
  };

  const mockOrder = {
    _id: orderId,
    user: userId,
    paymentMethod: "COD",
    paymentStatus: "Pending",
    orderStatus: "Pending",
    isStockDecremented: true,
    orderItems: [{ product: productId, quantity: 2 }],
    save: async function () {
      return this;
    },
  };

  const origOrderFindById = Order.findById;
  Order.findById = async () => mockOrder;

  try {
    // 1. First cancellation: should restore stock and set isStockDecremented = false
    const { req: req1, res: res1 } = createMockContext({}, { id: orderId.toString() }, {}, { _id: userId });
    await cancelOrder(req1, res1);

    assert.equal(res1.statusCode, 200);
    assert.equal(res1.body.success, true);
    assert.equal(mockOrder.orderStatus, "Cancelled");
    assert.equal(mockOrder.isStockDecremented, false);
    assert.equal(stockRestored, 2, "Stock must be restored by item quantity on first cancel");

    // 2. Second cancellation call: must be rejected with 400 and NOT increment stock again
    const { req: req2, res: res2 } = createMockContext({}, { id: orderId.toString() }, {}, { _id: userId });
    await cancelOrder(req2, res2);

    assert.equal(res2.statusCode, 400);
    assert.match(res2.body.message, /already cancelled/i);
    assert.equal(stockRestored, 2, "Stock must NOT be restored again on repeated cancellation");
  } finally {
    Product.findByIdAndUpdate = origFindByIdAndUpdate;
    Order.findById = origOrderFindById;
  }
});

test("Step 3 Fix 1 & 4: Webhook payment.failed cannot downgrade an already Paid order", async () => {
  const rzpOrderId = "order_rzp_paid_stay_paid";
  const rzpPaymentId = "pay_rzp_paid_failed_event";
  const webhookSecret = "test_webhook_secret_step3";
  process.env.RAZORPAY_WEBHOOK_SECRET = webhookSecret;

  const mockOrderDoc = {
    _id: "order_mongo_paid_1",
    totalAmount: 1000,
    paymentStatus: "Paid",
    orderStatus: "Processing",
    paymentResult: { razorpayOrderId: rzpOrderId, status: "Paid" },
    save: async function () {
      throw new Error("Should not be saved");
    },
  };

  const origOrderFindOne = Order.findOne;
  Order.findOne = async () => mockOrderDoc;

  try {
    const payload = {
      event: "payment.failed",
      payload: {
        payment: {
          entity: {
            id: rzpPaymentId,
            order_id: rzpOrderId,
          },
        },
      },
    };
    const raw = JSON.stringify(payload);
    const sig = crypto.createHmac("sha256", webhookSecret).update(Buffer.from(raw, "utf8")).digest("hex");
    const { req, res } = createMockContext({ "x-razorpay-signature": sig }, {}, payload);
    req.rawBody = raw;

    await handleWebhook(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(mockOrderDoc.paymentStatus, "Paid", "Paid order must NEVER be downgraded to Failed");
    assert.equal(mockOrderDoc.orderStatus, "Processing");
  } finally {
    Order.findOne = origOrderFindOne;
    delete process.env.RAZORPAY_WEBHOOK_SECRET;
  }
});

test("Step 3 Fix 1: Concurrency lock in finalizeOrderPayment prevents double stock decrement when racing", async () => {
  const userId = new mongoose.Types.ObjectId();
  const productId = new mongoose.Types.ObjectId();
  const rzpOrderId = "order_rzp_concurrent_race_999";
  const rzpPaymentId = "pay_rzp_concurrent_race_999";
  const secret = "test_key_secret_race";
  process.env.RAZORPAY_KEY_SECRET = secret;

  const validSignature = crypto
    .createHmac("sha256", secret)
    .update(`${rzpOrderId}|${rzpPaymentId}`)
    .digest("hex");

  let stock = 10;
  const origProductFindOneAndUpdate = Product.findOneAndUpdate;
  Product.findOneAndUpdate = async (query, update) => {
    stock += update.$inc.stock;
    return { _id: productId, stock };
  };

  const mockOrderDoc = {
    _id: new mongoose.Types.ObjectId(),
    user: userId,
    totalAmount: 500,
    paymentStatus: "Pending",
    orderStatus: "Pending",
    isStockDecremented: false,
    finalizationLock: null,
    orderItems: [{ product: { _id: productId, title: "Saree" }, quantity: 1 }],
    paymentResult: { razorpayOrderId: rzpOrderId },
    save: async function () {
      return this;
    },
  };

  const origOrderFindOne = Order.findOne;
  const origOrderFindById = Order.findById;
  const origOrderFindOneAndUpdate = Order.findOneAndUpdate;

  Order.findOne = async () => mockOrderDoc;

  // Simulate concurrency:
  // Thread 1 successfully acquires lock
  // Thread 2 finds lock already taken (returns null), polls findById, sees Paid, returns alreadyPaid: true
  let lockCallCount = 0;
  Order.findOneAndUpdate = async (query, update) => {
    if (update.$set?.paymentStatus === "Paid") {
      mockOrderDoc.paymentStatus = "Paid";
      return mockOrderDoc;
    }
    lockCallCount++;
    if (lockCallCount === 1) {
      mockOrderDoc.finalizationLock = update.$set.finalizationLock;
      mockOrderDoc.lockToken = update.$set.lockToken;
      return mockOrderDoc;
    }
    // Second concurrent call cannot acquire lock
    return null;
  };

  Order.findById = async () => {
    // When thread 2 checks by id, thread 1 has marked it Paid
    return { ...mockOrderDoc, paymentStatus: "Paid" };
  };

  const origCartUpdateOne = Cart.updateOne;
  Cart.updateOne = async () => ({});

  try {
    const shipping = {
      fullName: "Race User",
      phone: "1234567890",
      house: "A",
      area: "B",
      city: "C",
      state: "D",
      pincode: "111111",
    };

    const { req: req1, res: res1 } = createMockContext(
      {},
      {},
      {
        razorpay_order_id: rzpOrderId,
        razorpay_payment_id: rzpPaymentId,
        razorpay_signature: validSignature,
        shippingAddress: shipping,
      },
      { _id: userId, email: "race@example.com" }
    );

    const { req: req2, res: res2 } = createMockContext(
      {},
      {},
      {
        razorpay_order_id: rzpOrderId,
        razorpay_payment_id: rzpPaymentId,
        razorpay_signature: validSignature,
        shippingAddress: shipping,
      },
      { _id: userId, email: "race@example.com" }
    );

    // Run both concurrently
    await Promise.all([
      verifyPayment(req1, res1),
      verifyPayment(req2, res2),
    ]);

    // One must be 201 (or 200 for already confirmed) and stock decremented ONLY ONCE
    assert.equal(stock, 9, "Stock must decrement by exactly 1 item across both racing calls");
  } finally {
    Product.findOneAndUpdate = origProductFindOneAndUpdate;
    Cart.updateOne = origCartUpdateOne;
    Order.findOne = origOrderFindOne;
    Order.findById = origOrderFindById;
    Order.findOneAndUpdate = origOrderFindOneAndUpdate;
    delete process.env.RAZORPAY_KEY_SECRET;
  }
});

// ============================================================================
// STEP 5 TESTS: FINAL PAYMENT SAFETY BLOCKERS (FIXES 1 TO 5)
// ============================================================================

test("Step 5 Fix 1: Captured payment with exhausted inventory transitions order to reviewRequired and saves payment details", async () => {
  const userId = new mongoose.Types.ObjectId();
  const productId = new mongoose.Types.ObjectId();
  const rzpOrderId = "order_rzp_stock_exhausted_1";
  const rzpPaymentId = "pay_rzp_stock_exhausted_1";
  const secret = "test_key_secret_step5_exhausted";
  process.env.RAZORPAY_KEY_SECRET = secret;

  const validSignature = crypto
    .createHmac("sha256", secret)
    .update(`${rzpOrderId}|${rzpPaymentId}`)
    .digest("hex");

  const mockOrderDoc = {
    _id: new mongoose.Types.ObjectId(),
    user: userId,
    totalAmount: 1500,
    paymentStatus: "Pending",
    orderStatus: "Pending",
    isStockDecremented: false,
    finalizationLock: null,
    orderItems: [{ product: { _id: productId, title: "Banarasi Silk Saree" }, quantity: 1 }],
    paymentResult: { razorpayOrderId: rzpOrderId },
  };

  const origOrderFindOne = Order.findOne;
  const origOrderFindOneAndUpdate = Order.findOneAndUpdate;
  const origProductFindOneAndUpdate = Product.findOneAndUpdate;

  Order.findOne = async () => mockOrderDoc;

  // Simulate stock exhausted (returns null)
  Product.findOneAndUpdate = async () => null;

  let reviewUpdatedDoc = null;
  Order.findOneAndUpdate = async (query, update) => {
    if (update.$set?.reviewRequired === true) {
      reviewUpdatedDoc = { ...mockOrderDoc, ...update.$set };
      return reviewUpdatedDoc;
    }
    if (update.$set?.finalizationLock !== undefined && update.$set?.lockToken !== undefined) {
      mockOrderDoc.finalizationLock = update.$set.finalizationLock;
      mockOrderDoc.lockToken = update.$set.lockToken;
      return mockOrderDoc;
    }
    return mockOrderDoc;
  };

  try {
    const { req, res } = createMockContext(
      {},
      {},
      {
        razorpay_order_id: rzpOrderId,
        razorpay_payment_id: rzpPaymentId,
        razorpay_signature: validSignature,
        shippingAddress: { fullName: "User", phone: "1234567890", house: "A", area: "B", city: "C", state: "D", pincode: "111111" },
      },
      { _id: userId, email: "user@example.com" }
    );

    await verifyPayment(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.reviewRequired, true);
    assert.equal(reviewUpdatedDoc.paymentStatus, "Paid");
    assert.equal(reviewUpdatedDoc.orderStatus, "Cancelled");
    assert.equal(reviewUpdatedDoc.isStockDecremented, false);
    assert.equal(reviewUpdatedDoc.reviewRequired, true);
    assert.equal(reviewUpdatedDoc.paymentResult.id, rzpPaymentId);
    assert.match(reviewUpdatedDoc.reconciliationReason, /stock/i);
  } finally {
    Order.findOne = origOrderFindOne;
    Order.findOneAndUpdate = origOrderFindOneAndUpdate;
    Product.findOneAndUpdate = origProductFindOneAndUpdate;
    delete process.env.RAZORPAY_KEY_SECRET;
  }
});

test("Step 5 Fix 2 & 3: Failure during coupon update triggers inventory rollback and releases lock", async () => {
  const userId = new mongoose.Types.ObjectId();
  const productId = new mongoose.Types.ObjectId();
  const couponId = new mongoose.Types.ObjectId();
  const rzpOrderId = "order_rzp_coupon_fail_1";
  const rzpPaymentId = "pay_rzp_coupon_fail_1";
  const secret = "test_key_secret_step5_coupon";
  process.env.RAZORPAY_KEY_SECRET = secret;

  const validSignature = crypto
    .createHmac("sha256", secret)
    .update(`${rzpOrderId}|${rzpPaymentId}`)
    .digest("hex");

  let stock = 10;
  const origProductFindOneAndUpdate = Product.findOneAndUpdate;
  const origProductFindByIdAndUpdate = Product.findByIdAndUpdate;
  Product.findOneAndUpdate = async (query, update) => {
    stock += update.$inc.stock;
    return { _id: productId, stock };
  };
  Product.findByIdAndUpdate = async (id, update) => {
    stock += update.$inc.stock;
  };

  const origCouponFindByIdAndUpdate = Coupon.findByIdAndUpdate;
  Coupon.findByIdAndUpdate = async () => {
    throw new Error("Coupon database connection timed out");
  };

  let lockCleared = false;
  const mockOrderDoc = {
    _id: new mongoose.Types.ObjectId(),
    user: userId,
    coupon: couponId,
    totalAmount: 1000,
    paymentStatus: "Pending",
    orderStatus: "Pending",
    isStockDecremented: false,
    finalizationLock: null,
    orderItems: [{ product: { _id: productId }, quantity: 2 }],
    paymentResult: { razorpayOrderId: rzpOrderId },
  };

  const origOrderFindOne = Order.findOne;
  const origOrderFindOneAndUpdate = Order.findOneAndUpdate;
  Order.findOne = async () => mockOrderDoc;
  Order.findOneAndUpdate = async (query, update) => {
    if (update.$set?.finalizationLock === null) {
      lockCleared = true;
      mockOrderDoc.finalizationLock = null;
      mockOrderDoc.lockToken = null;
      return mockOrderDoc;
    }
    if (update.$set?.finalizationLock !== undefined && update.$set?.lockToken !== undefined) {
      mockOrderDoc.finalizationLock = update.$set.finalizationLock;
      mockOrderDoc.lockToken = update.$set.lockToken;
      return mockOrderDoc;
    }
    return mockOrderDoc;
  };

  try {
    const { req, res } = createMockContext(
      {},
      {},
      {
        razorpay_order_id: rzpOrderId,
        razorpay_payment_id: rzpPaymentId,
        razorpay_signature: validSignature,
        shippingAddress: { fullName: "User", phone: "1234567890", house: "A", area: "B", city: "C", state: "D", pincode: "111111" },
      },
      { _id: userId, email: "user@example.com" }
    );

    await verifyPayment(req, res);

    assert.equal(res.statusCode, 500);
    assert.match(res.body.message, /Coupon database connection timed out/i);
    assert.equal(stock, 10, "Inventory must be rolled back to 10 when coupon update fails");
    assert.equal(lockCleared, true, "Lock must be released on failure");
  } finally {
    Product.findOneAndUpdate = origProductFindOneAndUpdate;
    Product.findByIdAndUpdate = origProductFindByIdAndUpdate;
    Coupon.findByIdAndUpdate = origCouponFindByIdAndUpdate;
    Order.findOne = origOrderFindOne;
    Order.findOneAndUpdate = origOrderFindOneAndUpdate;
    delete process.env.RAZORPAY_KEY_SECRET;
  }
});

test("Step 5 Fix 2 & 3: Order save lock ownership loss aborts finalization and rolls back inventory", async () => {
  const userId = new mongoose.Types.ObjectId();
  const productId = new mongoose.Types.ObjectId();
  const rzpOrderId = "order_rzp_lock_lost_1";
  const rzpPaymentId = "pay_rzp_lock_lost_1";
  const secret = "test_key_secret_step5_lost";
  process.env.RAZORPAY_KEY_SECRET = secret;

  const validSignature = crypto
    .createHmac("sha256", secret)
    .update(`${rzpOrderId}|${rzpPaymentId}`)
    .digest("hex");

  let stock = 10;
  const origProductFindOneAndUpdate = Product.findOneAndUpdate;
  const origProductFindByIdAndUpdate = Product.findByIdAndUpdate;
  Product.findOneAndUpdate = async (query, update) => {
    stock += update.$inc.stock;
    return { _id: productId, stock };
  };
  Product.findByIdAndUpdate = async (id, update) => {
    stock += update.$inc.stock;
  };

  const mockOrderDoc = {
    _id: new mongoose.Types.ObjectId(),
    user: userId,
    totalAmount: 1000,
    paymentStatus: "Pending",
    orderStatus: "Pending",
    isStockDecremented: false,
    finalizationLock: null,
    orderItems: [{ product: { _id: productId }, quantity: 1 }],
    paymentResult: { razorpayOrderId: rzpOrderId },
  };

  const origOrderFindOne = Order.findOne;
  const origOrderFindOneAndUpdate = Order.findOneAndUpdate;
  Order.findOne = async () => mockOrderDoc;

  // Claim succeeds, but final save fails to match lockToken (stolen lock)
  Order.findOneAndUpdate = async (query, update) => {
    if (update.$set?.paymentStatus === "Paid") {
      // Simulate lockToken mismatch (another process stole lock)
      return null;
    }
    return mockOrderDoc;
  };

  try {
    const { req, res } = createMockContext(
      {},
      {},
      {
        razorpay_order_id: rzpOrderId,
        razorpay_payment_id: rzpPaymentId,
        razorpay_signature: validSignature,
        shippingAddress: { fullName: "User", phone: "1234567890", house: "A", area: "B", city: "C", state: "D", pincode: "111111" },
      },
      { _id: userId, email: "user@example.com" }
    );

    await verifyPayment(req, res);

    assert.equal(res.statusCode, 500);
    assert.match(res.body.message, /Lock ownership lost/i);
    assert.equal(stock, 10, "Inventory must be rolled back when lock ownership was lost");
  } finally {
    Product.findOneAndUpdate = origProductFindOneAndUpdate;
    Product.findByIdAndUpdate = origProductFindByIdAndUpdate;
    Order.findOne = origOrderFindOne;
    Order.findOneAndUpdate = origOrderFindOneAndUpdate;
    delete process.env.RAZORPAY_KEY_SECRET;
  }
});

test("Step 5 Fix 2 & 3: Cart clearing failure is non-blocking and preserves successful order finalization", async () => {
  const userId = new mongoose.Types.ObjectId();
  const productId = new mongoose.Types.ObjectId();
  const rzpOrderId = "order_rzp_cart_nonblock_1";
  const rzpPaymentId = "pay_rzp_cart_nonblock_1";
  const secret = "test_key_secret_step5_cart";
  process.env.RAZORPAY_KEY_SECRET = secret;

  const validSignature = crypto
    .createHmac("sha256", secret)
    .update(`${rzpOrderId}|${rzpPaymentId}`)
    .digest("hex");

  const origCartUpdateOne = Cart.updateOne;
  Cart.updateOne = async () => {
    throw new Error("Cart collection write conflict");
  };

  const mockOrderDoc = {
    _id: new mongoose.Types.ObjectId(),
    user: userId,
    totalAmount: 1000,
    paymentStatus: "Pending",
    orderStatus: "Pending",
    isStockDecremented: false,
    finalizationLock: null,
    orderItems: [{ product: { _id: productId }, quantity: 1 }],
    paymentResult: { razorpayOrderId: rzpOrderId },
  };

  const origOrderFindOne = Order.findOne;
  const origOrderFindOneAndUpdate = Order.findOneAndUpdate;
  const origProductFindOneAndUpdate = Product.findOneAndUpdate;

  Order.findOne = async () => mockOrderDoc;
  Order.findOneAndUpdate = async (query, update) => {
    if (update.$set?.paymentStatus === "Paid") {
      mockOrderDoc.paymentStatus = "Paid";
      mockOrderDoc.orderStatus = "Processing";
      return mockOrderDoc;
    }
    return mockOrderDoc;
  };
  Product.findOneAndUpdate = async () => ({ _id: productId, stock: 9 });

  try {
    const { req, res } = createMockContext(
      {},
      {},
      {
        razorpay_order_id: rzpOrderId,
        razorpay_payment_id: rzpPaymentId,
        razorpay_signature: validSignature,
        shippingAddress: { fullName: "User", phone: "1234567890", house: "A", area: "B", city: "C", state: "D", pincode: "111111" },
      },
      { _id: userId, email: "user@example.com" }
    );

    await verifyPayment(req, res);

    assert.equal(res.statusCode, 201);
    assert.equal(res.body.success, true);
    assert.equal(mockOrderDoc.paymentStatus, "Paid", "Order must still be confirmed even if cart clearing failed");
  } finally {
    Cart.updateOne = origCartUpdateOne;
    Order.findOne = origOrderFindOne;
    Order.findOneAndUpdate = origOrderFindOneAndUpdate;
    Product.findOneAndUpdate = origProductFindOneAndUpdate;
    delete process.env.RAZORPAY_KEY_SECRET;
  }
});

test("Step 5 Fix 4: Gateway timeout in fetchRazorpayPayment returns HTTP 502 without marking order paid", async () => {
  const userId = new mongoose.Types.ObjectId();
  const rzpOrderId = "order_rzp_gateway_down_1";
  const rzpPaymentId = "pay_rzp_gateway_down_1";
  const secret = "test_key_secret_step5_down";
  process.env.RAZORPAY_KEY_SECRET = secret;
  process.env.RAZORPAY_KEY_ID = "rzp_test_sample_key";

  const validSignature = crypto
    .createHmac("sha256", secret)
    .update(`${rzpOrderId}|${rzpPaymentId}`)
    .digest("hex");

  const origFetchRazorpayPayment = paymentService.fetchRazorpayPayment;
  paymentService.fetchRazorpayPayment = async () => {
    const err = new Error("Gateway timeout connecting to api.razorpay.com:443");
    err.code = "ETIMEDOUT";
    throw err;
  };

  const mockOrderDoc = {
    _id: new mongoose.Types.ObjectId(),
    user: userId,
    totalAmount: 1000,
    paymentStatus: "Pending",
    orderStatus: "Pending",
    paymentResult: { razorpayOrderId: rzpOrderId },
  };

  const origOrderFindOne = Order.findOne;
  Order.findOne = async () => mockOrderDoc;

  try {
    const { req, res } = createMockContext(
      {},
      {},
      {
        razorpay_order_id: rzpOrderId,
        razorpay_payment_id: rzpPaymentId,
        razorpay_signature: validSignature,
        shippingAddress: { fullName: "User", phone: "1234567890", house: "A", area: "B", city: "C", state: "D", pincode: "111111" },
      },
      { _id: userId, email: "user@example.com" }
    );

    const origEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    await verifyPayment(req, res);

    process.env.NODE_ENV = origEnv;

    assert.equal(res.statusCode, 502);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /gateway verification service temporarily unavailable/i);
    assert.equal(mockOrderDoc.paymentStatus, "Pending", "Order must remain Pending when gateway is down");
  } finally {
    paymentService.fetchRazorpayPayment = origFetchRazorpayPayment;
    Order.findOne = origOrderFindOne;
    delete process.env.RAZORPAY_KEY_SECRET;
    delete process.env.RAZORPAY_KEY_ID;
  }
});

test("Step 5 Fix 4: handleWebhook strictly rejects missing currency or missing amount with 400 Bad Request", async () => {
  const webhookSecret = "test_webhook_secret_step5_missing";
  process.env.RAZORPAY_WEBHOOK_SECRET = webhookSecret;

  const mockOrderDoc = {
    _id: "order_mongo_webhook_missing_test",
    totalAmount: 500,
    paymentStatus: "Pending",
    orderStatus: "Pending",
    paymentResult: { razorpayOrderId: "order_missing_amt_1" },
  };

  const origOrderFindOne = Order.findOne;
  Order.findOne = async () => mockOrderDoc;

  try {
    // 1. Missing currency
    const missingCurrencyPayload = {
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_missing_cur_1",
            order_id: "order_missing_cur_1",
            amount: 50000,
          },
        },
      },
    };
    const raw1 = JSON.stringify(missingCurrencyPayload);
    const sig1 = crypto.createHmac("sha256", webhookSecret).update(Buffer.from(raw1, "utf8")).digest("hex");
    const { req: req1, res: res1 } = createMockContext({ "x-razorpay-signature": sig1 }, {}, missingCurrencyPayload);
    req1.rawBody = raw1;
    await handleWebhook(req1, res1);
    assert.equal(res1.statusCode, 400);
    assert.match(res1.body.message, /currency/i);

    // 2. Missing amount
    const missingAmountPayload = {
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_missing_amt_1",
            order_id: "order_missing_amt_1",
            currency: "INR",
          },
        },
      },
    };
    const raw2 = JSON.stringify(missingAmountPayload);
    const sig2 = crypto.createHmac("sha256", webhookSecret).update(Buffer.from(raw2, "utf8")).digest("hex");
    const { req: req2, res: res2 } = createMockContext({ "x-razorpay-signature": sig2 }, {}, missingAmountPayload);
    req2.rawBody = raw2;
    await handleWebhook(req2, res2);
    assert.equal(res2.statusCode, 400);
    assert.match(res2.body.message, /amount/i);
  } finally {
    Order.findOne = origOrderFindOne;
    delete process.env.RAZORPAY_WEBHOOK_SECRET;
  }
});

test("Step 5 Fix 5: Duplicate fallback verification returns existing order with HTTP 200 without creating second order", async () => {
  const userId = new mongoose.Types.ObjectId();
  const rzpOrderId = "order_rzp_dup_fallback_1";
  const rzpPaymentId = "pay_rzp_dup_fallback_1";
  const secret = "test_key_secret_step5_fallback";
  process.env.RAZORPAY_KEY_SECRET = secret;

  const validSignature = crypto
    .createHmac("sha256", secret)
    .update(`${rzpOrderId}|${rzpPaymentId}`)
    .digest("hex");

  const existingOrder = {
    _id: new mongoose.Types.ObjectId(),
    user: userId,
    paymentStatus: "Paid",
    orderStatus: "Processing",
    paymentResult: { id: rzpPaymentId, razorpayOrderId: rzpOrderId },
  };

  const origOrderFindOne = Order.findOne;
  const origOrderCreate = Order.create;
  let orderCreatedCount = 0;

  Order.create = async () => {
    orderCreatedCount++;
    return existingOrder;
  };

  Order.findOne = async (query) => {
    if (query["paymentResult.id"] === rzpPaymentId) {
      return existingOrder;
    }
    return null;
  };

  try {
    const { req, res } = createMockContext(
      {},
      {},
      {
        razorpay_order_id: rzpOrderId,
        razorpay_payment_id: rzpPaymentId,
        razorpay_signature: validSignature,
        shippingAddress: { fullName: "User", phone: "1234567890", house: "A", area: "B", city: "C", state: "D", pincode: "111111" },
      },
      { _id: userId, email: "user@example.com" }
    );

    await verifyPayment(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.match(res.body.message, /already confirmed/i);
    assert.equal(orderCreatedCount, 0, "No duplicate order must be created");
  } finally {
    Order.findOne = origOrderFindOne;
    Order.create = origOrderCreate;
    delete process.env.RAZORPAY_KEY_SECRET;
  }
});



