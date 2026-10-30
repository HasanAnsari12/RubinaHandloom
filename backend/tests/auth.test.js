const test = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const { protect } = require("../middleware/authMiddleware");
const User = require("../models/User");

// Test helper to generate mock request, response, and next
const createMockContext = (headers = {}, params = {}, body = {}) => {
  const req = { headers, params, body };
  const res = {
    statusCode: null,
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
    setHeader(key, val) {
      this.headers[key] = val;
      return this;
    },
    send(data) {
      this.body = data;
      return this;
    },
  };
  let nextCalled = false;
  const next = () => {
    nextCalled = true;
  };

  return { req, res, next, wasNextCalled: () => nextCalled };
};

test("Phase 1 Security: protect middleware rejects request when Authorization header is missing", async () => {
  const { req, res, next, wasNextCalled } = createMockContext();

  await protect(req, res, next);

  assert.equal(res.statusCode, 401);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /token missing/i);
  assert.equal(wasNextCalled(), false);
});

test("Phase 1 Security: protect middleware rejects request when token is invalid or corrupted", async () => {
  const { req, res, next, wasNextCalled } = createMockContext({
    authorization: "Bearer invalid.token.payload",
  });

  process.env.JWT_SECRET = "test-secret-key-123456789";
  await protect(req, res, next);

  assert.equal(res.statusCode, 401);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /invalid or expired/i);
  assert.equal(wasNextCalled(), false);
});

test("Phase 1 Security: protect middleware rejects soft-deleted user (isDeleted: true)", async () => {
  process.env.JWT_SECRET = "test-secret-key-123456789";
  const userId = "507f1f77bcf86cd799439011";
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1h" });

  // Stub User.findById
  const originalFindById = User.findById;
  User.findById = () => ({
    select: () => ({
      _id: userId,
      name: "Deleted User",
      email: "deleted@example.com",
      isDeleted: true,
      isBlocked: false,
    }),
  });

  try {
    const { req, res, next, wasNextCalled } = createMockContext({
      authorization: `Bearer ${token}`,
    });

    await protect(req, res, next);

    assert.equal(res.statusCode, 401);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /no longer exists/i);
    assert.equal(wasNextCalled(), false);
  } finally {
    User.findById = originalFindById;
  }
});

test("Phase 1 Security: protect middleware rejects blocked user (isBlocked: true)", async () => {
  process.env.JWT_SECRET = "test-secret-key-123456789";
  const userId = "507f1f77bcf86cd799439012";
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1h" });

  const originalFindById = User.findById;
  User.findById = () => ({
    select: () => ({
      _id: userId,
      name: "Blocked User",
      email: "blocked@example.com",
      isDeleted: false,
      isBlocked: true,
    }),
  });

  try {
    const { req, res, next, wasNextCalled } = createMockContext({
      authorization: `Bearer ${token}`,
    });

    await protect(req, res, next);

    assert.equal(res.statusCode, 403);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /blocked/i);
    assert.equal(wasNextCalled(), false);
  } finally {
    User.findById = originalFindById;
  }
});

test("Phase 1 Security: protect middleware invalidates token issued before passwordChangedAt", async () => {
  process.env.JWT_SECRET = "test-secret-key-123456789";
  const userId = "507f1f77bcf86cd799439013";

  // Issue token with an older timestamp (e.g. 100 seconds ago)
  const currentEpochSeconds = Math.floor(Date.now() / 1000);
  const token = jwt.sign(
    { id: userId, iat: currentEpochSeconds - 100 },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  const originalFindById = User.findById;
  User.findById = () => ({
    select: () => ({
      _id: userId,
      name: "Password Changed User",
      email: "changed@example.com",
      isDeleted: false,
      isBlocked: false,
      passwordChangedAt: new Date(Date.now() - 10 * 1000), // Changed 10 seconds ago (newer than token iat)
    }),
  });

  try {
    const { req, res, next, wasNextCalled } = createMockContext({
      authorization: `Bearer ${token}`,
    });

    await protect(req, res, next);

    assert.equal(res.statusCode, 401);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /password recently changed/i);
    assert.equal(wasNextCalled(), false);
  } finally {
    User.findById = originalFindById;
  }
});

test("Phase 1 Security: protect middleware allows active user with valid token", async () => {
  process.env.JWT_SECRET = "test-secret-key-123456789";
  const userId = "507f1f77bcf86cd799439014";
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1h" });

  const originalFindById = User.findById;
  User.findById = () => ({
    select: () => ({
      _id: userId,
      name: "Valid User",
      email: "valid@example.com",
      isDeleted: false,
      isBlocked: false,
      passwordChangedAt: null,
    }),
  });

  try {
    const { req, res, next, wasNextCalled } = createMockContext({
      authorization: `Bearer ${token}`,
    });

    await protect(req, res, next);

    assert.equal(wasNextCalled(), true);
    assert.equal(req.user._id, userId);
  } finally {
    User.findById = originalFindById;
  }
});

test("Phase 1 Security: CORS allows configured origin and rejects untrusted origin", async () => {
  const http = require("node:http");
  const app = require("../app");
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;

  try {
    // 1. Test allowed origin (e.g. storefront on port 5173)
    const allowedRes = await fetch(`http://127.0.0.1:${port}/`, {
      method: "GET",
      headers: { Origin: "http://localhost:5173" },
    });
    assert.equal(allowedRes.headers.get("access-control-allow-origin"), "http://localhost:5173");

    // 2. Test disallowed origin
    const disallowedRes = await fetch(`http://127.0.0.1:${port}/`, {
      method: "GET",
      headers: { Origin: "https://evil-hacker-site.com" },
    });
    assert.notEqual(disallowedRes.headers.get("access-control-allow-origin"), "https://evil-hacker-site.com");
    assert.equal(disallowedRes.status, 403);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("Phase 2 Verification: verifyEmail verifies user with valid SHA-256 token and invalidates token", async () => {
  const crypto = require("crypto");
  const { verifyEmail } = require("../controllers/authController");

  const rawToken = "testverificationtoken1234567890abcdef";
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  let saved = false;
  const mockUser = {
    _id: "user123",
    email: "test@example.com",
    isVerified: false,
    emailVerificationToken: hashedToken,
    emailVerificationTokenExpire: Date.now() + 60000,
    lastVerificationEmailSentAt: Date.now(),
    save: async function () {
      saved = true;
    },
  };

  const originalFindOne = User.findOne;
  User.findOne = async (query) => {
    if (query.emailVerificationToken === hashedToken) {
      return mockUser;
    }
    return null;
  };

  try {
    const { req, res } = createMockContext(
      { accept: "application/json" },
      { token: rawToken }
    );

    await verifyEmail(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(mockUser.isVerified, true);
    assert.equal(mockUser.emailVerificationToken, undefined);
    assert.equal(mockUser.emailVerificationTokenExpire, undefined);
    assert.equal(saved, true);
  } finally {
    User.findOne = originalFindOne;
  }
});

test("Phase 2 Verification: verifyEmail rejects invalid or already consumed token without verifying user", async () => {
  const { verifyEmail } = require("../controllers/authController");

  const originalFindOne = User.findOne;
  User.findOne = async () => null;

  try {
    const { req, res } = createMockContext(
      { accept: "application/json" },
      { token: "invalidOrAlreadyUsedToken" }
    );

    await verifyEmail(req, res);

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /invalid or has already been used/i);
  } finally {
    User.findOne = originalFindOne;
  }
});

test("Phase 2 Verification: verifyEmail rejects expired token", async () => {
  const crypto = require("crypto");
  const { verifyEmail } = require("../controllers/authController");

  const rawToken = "expiredverificationtoken1234567890";
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  const mockUser = {
    _id: "user123",
    isVerified: false,
    emailVerificationToken: hashedToken,
    emailVerificationTokenExpire: Date.now() - 10000, // Expired 10s ago
    save: async () => {},
  };

  const originalFindOne = User.findOne;
  User.findOne = async (query) => {
    if (query.emailVerificationToken === hashedToken) {
      return mockUser;
    }
    return null;
  };

  try {
    const { req, res } = createMockContext(
      { accept: "application/json" },
      { token: rawToken }
    );

    await verifyEmail(req, res);

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /expired/i);
    assert.equal(mockUser.isVerified, false);
  } finally {
    User.findOne = originalFindOne;
  }
});

test("Phase 2 Forgot Password: checkResetToken accepts valid unexpired token and rejects invalid/expired token", async () => {
  const crypto = require("crypto");
  const { checkResetToken } = require("../controllers/authController");

  const validRawToken = "validresettoken1234567890abcdef";
  const validHashedToken = crypto.createHash("sha256").update(validRawToken).digest("hex");

  const mockUser = {
    _id: "user456",
    resetToken: validHashedToken,
    resetTokenExpire: Date.now() + 15 * 60 * 1000,
  };

  const originalFindOne = User.findOne;
  User.findOne = async (query) => {
    if (query.resetToken === validHashedToken) {
      return mockUser;
    }
    return null;
  };

  try {
    // 1. Valid token
    const ctx1 = createMockContext({}, { token: validRawToken });
    await checkResetToken(ctx1.req, ctx1.res);
    assert.equal(ctx1.res.statusCode, 200);
    assert.equal(ctx1.res.body.success, true);

    // 2. Invalid token
    const ctx2 = createMockContext({}, { token: "unknownToken" });
    await checkResetToken(ctx2.req, ctx2.res);
    assert.equal(ctx2.res.statusCode, 400);
    assert.equal(ctx2.res.body.success, false);
  } finally {
    User.findOne = originalFindOne;
  }
});

test("Phase 2 Forgot Password: resetPassword rejects same-password reuse and updates password on valid new input", async () => {
  const crypto = require("crypto");
  const bcrypt = require("bcryptjs");
  const { resetPassword } = require("../controllers/authController");

  const validRawToken = "validresettokenforupdate12345";
  const validHashedToken = crypto.createHash("sha256").update(validRawToken).digest("hex");

  const currentPasswordHashed = await bcrypt.hash("OldPass@1234", 10);
  let saved = false;

  const mockUser = {
    _id: "user789",
    password: currentPasswordHashed,
    resetToken: validHashedToken,
    resetTokenExpire: Date.now() + 15 * 60 * 1000,
    passwordChangedAt: null,
    save: async function () {
      saved = true;
    },
  };

  const originalFindOne = User.findOne;
  User.findOne = async (query) => {
    if (query.resetToken === validHashedToken) {
      return mockUser;
    }
    return null;
  };

  try {
    // 1. Same password reuse rejection
    const ctx1 = createMockContext(
      {},
      { token: validRawToken },
      { password: "OldPass@1234" }
    );
    await resetPassword(ctx1.req, ctx1.res);
    assert.equal(ctx1.res.statusCode, 400);
    assert.equal(ctx1.res.body.success, false);
    assert.match(ctx1.res.body.message, /cannot be the same/i);

    // 2. Successful password reset
    const ctx2 = createMockContext(
      {},
      { token: validRawToken },
      { password: "NewStrongPass@2026" }
    );
    await resetPassword(ctx2.req, ctx2.res);
    assert.equal(ctx2.res.statusCode, 200);
    assert.equal(ctx2.res.body.success, true);
    assert.equal(saved, true);
    assert.equal(mockUser.resetToken, undefined);
    assert.equal(mockUser.resetTokenExpire, undefined);
    assert.ok(mockUser.passwordChangedAt);

    const isNewMatch = await bcrypt.compare("NewStrongPass@2026", mockUser.password);
    assert.equal(isNewMatch, true);
  } finally {
    User.findOne = originalFindOne;
  }
});

test("Phase 2 Flow: email URLs point to storefront port 5173", async () => {
  const { sendVerificationEmail, sendPasswordResetEmail } = require("../services/emailService");

  const origSmtpHost = process.env.SMTP_HOST;
  const origFrontendUrl = process.env.FRONTEND_URL;

  let capturedLogs = [];
  const origConsoleLog = console.log;
  console.log = (...args) => {
    capturedLogs.push(args.join(" "));
  };

  try {
    delete process.env.SMTP_HOST; // Trigger fallback console logger
    process.env.FRONTEND_URL = "http://localhost:5173";

    // 1. Verify verification email link
    capturedLogs = [];
    await sendVerificationEmail("user@example.com", "raw-verify-token-123");
    const verifyOutput = capturedLogs.join("\n");
    assert.match(verifyOutput, /http:\/\/localhost:5173\/verify-email\/raw-verify-token-123/);

    // 2. Verify password reset email link
    capturedLogs = [];
    await sendPasswordResetEmail("user@example.com", "raw-reset-token-456");
    const resetOutput = capturedLogs.join("\n");
    assert.match(resetOutput, /http:\/\/localhost:5173\/reset-password\/raw-reset-token-456/);

    // 3. Test fallback default when FRONTEND_URL is undefined
    delete process.env.FRONTEND_URL;
    capturedLogs = [];
    await sendVerificationEmail("user@example.com", "raw-fallback-verify");
    assert.match(capturedLogs.join("\n"), /http:\/\/localhost:5173\/verify-email\/raw-fallback-verify/);

    capturedLogs = [];
    await sendPasswordResetEmail("user@example.com", "raw-fallback-reset");
    assert.match(capturedLogs.join("\n"), /http:\/\/localhost:5173\/reset-password\/raw-fallback-reset/);
  } finally {
    console.log = origConsoleLog;
    if (origSmtpHost !== undefined) process.env.SMTP_HOST = origSmtpHost;
    if (origFrontendUrl !== undefined) process.env.FRONTEND_URL = origFrontendUrl;
  }
});

test("Phase 2 Verification: resendVerificationEmail returns 502 when SMTP delivery fails", async () => {
  const { resendVerificationEmail } = require("../controllers/authController");
  const emailService = require("../services/emailService");

  const origSendVerificationEmail = emailService.sendVerificationEmail;
  emailService.sendVerificationEmail = async () => ({ delivered: false, success: false });

  const mockUser = {
    _id: "user_resend_1",
    email: "resend_test@example.com",
    isVerified: false,
    save: async () => {},
  };

  const origFindOne = User.findOne;
  User.findOne = async () => mockUser;

  try {
    const { req, res } = createMockContext({}, {}, { email: "resend_test@example.com" });
    await resendVerificationEmail(req, res);

    assert.equal(res.statusCode, 502);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /failed to deliver verification email/i);
  } finally {
    User.findOne = origFindOne;
    emailService.sendVerificationEmail = origSendVerificationEmail;
  }
});

test("Phase 2 Product & Uploads: static /uploads endpoint responds appropriately", async () => {
  const http = require("node:http");
  const app = require("../app");
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;

  try {
    const res = await fetch(`http://127.0.0.1:${port}/uploads/nonexistent-test-image.jpg`);
    assert.equal(res.status, 404);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("Phase 2 Password Security: changePassword rejects unauthenticated user not found with 404", async () => {
  const { changePassword } = require("../controllers/authController");
  const origFindById = User.findById;
  User.findById = () => ({ select: async () => null });

  try {
    const { req, res } = createMockContext({}, {}, { currentPassword: "OldPassword123!", newPassword: "NewPassword123!" });
    req.user = { _id: "nonexistent_id" };
    await changePassword(req, res);

    assert.equal(res.statusCode, 404);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /user not found/i);
  } finally {
    User.findById = origFindById;
  }
});

test("Phase 2 Password Security: changePassword rejects incorrect current password with 400", async () => {
  const { changePassword } = require("../controllers/authController");
  const bcrypt = require("bcryptjs");
  const origFindById = User.findById;
  const oldHashed = await bcrypt.hash("OldCorrectPassword!", 10);
  const mockUser = {
    _id: "user_test_pwd_1",
    password: oldHashed,
    save: async () => {},
  };
  User.findById = () => ({ select: async () => mockUser });

  try {
    const { req, res } = createMockContext({}, {}, { currentPassword: "WrongPassword!", newPassword: "NewPassword123!" });
    req.user = { _id: mockUser._id };
    await changePassword(req, res);

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /current password is incorrect/i);
  } finally {
    User.findById = origFindById;
  }
});

test("Phase 2 Password Security: changePassword rejects new password shorter than 6 characters with 400", async () => {
  const { changePassword } = require("../controllers/authController");
  const bcrypt = require("bcryptjs");
  const origFindById = User.findById;
  const oldHashed = await bcrypt.hash("OldCorrectPassword!", 10);
  const mockUser = {
    _id: "user_test_pwd_2",
    password: oldHashed,
    save: async () => {},
  };
  User.findById = () => ({ select: async () => mockUser });

  try {
    const { req, res } = createMockContext({}, {}, { currentPassword: "OldCorrectPassword!", newPassword: "123" });
    req.user = { _id: mockUser._id };
    await changePassword(req, res);

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /at least 6 characters/i);
  } finally {
    User.findById = origFindById;
  }
});

test("Phase 2 Password Security: changePassword rejects same password reuse with 400", async () => {
  const { changePassword } = require("../controllers/authController");
  const bcrypt = require("bcryptjs");
  const origFindById = User.findById;
  const oldHashed = await bcrypt.hash("OldCorrectPassword!", 10);
  const mockUser = {
    _id: "user_test_pwd_3",
    password: oldHashed,
    save: async () => {},
  };
  User.findById = () => ({ select: async () => mockUser });

  try {
    const { req, res } = createMockContext({}, {}, { currentPassword: "OldCorrectPassword!", newPassword: "OldCorrectPassword!" });
    req.user = { _id: mockUser._id };
    await changePassword(req, res);

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /cannot be the same/i);
  } finally {
    User.findById = origFindById;
  }
});

test("Phase 2 Password Security: changePassword verifies current password, hashes new password with bcrypt 10 rounds, and updates passwordChangedAt", async () => {
  const { changePassword } = require("../controllers/authController");
  const bcrypt = require("bcryptjs");
  const origFindById = User.findById;
  const oldHashed = await bcrypt.hash("OldCorrectPassword!", 10);
  let saved = false;
  const mockUser = {
    _id: "user_test_pwd_4",
    password: oldHashed,
    passwordChangedAt: null,
    save: async () => { saved = true; },
  };
  User.findById = () => ({ select: async () => mockUser });

  try {
    const beforeChange = Date.now();
    const { req, res } = createMockContext({}, {}, { currentPassword: "OldCorrectPassword!", newPassword: "NewSecurePassword456!" });
    req.user = { _id: mockUser._id };
    await changePassword(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.match(res.body.message, /password changed successfully/i);
    assert.equal(saved, true);
    assert.ok(mockUser.passwordChangedAt >= beforeChange);
    const isNewValid = await bcrypt.compare("NewSecurePassword456!", mockUser.password);
    assert.equal(isNewValid, true);
    const isOldInvalid = await bcrypt.compare("OldCorrectPassword!", mockUser.password);
    assert.equal(isOldInvalid, false);
  } finally {
    User.findById = origFindById;
  }
});



