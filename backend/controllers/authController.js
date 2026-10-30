const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const crypto = require("crypto");
const { sendVerificationEmail, sendPasswordResetEmail } = require("../services/emailService");
// Register User
const registerUser = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      password,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all fields",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanPhone = phone ? phone.trim() : "";

    const existingUser = await User.findOne({ email: cleanEmail });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate secure random verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Hash the token before storing it
    const hashedVerificationToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    const user = await User.create({
      name: cleanName,
      phone: cleanPhone,
      email: cleanEmail,
      password: hashedPassword,
      isVerified: false,
      emailVerificationToken: hashedVerificationToken,
      emailVerificationTokenExpire: Date.now() + 24 * 60 * 60 * 1000, // 24 hours expiry
      lastVerificationEmailSentAt: Date.now(),
    });

    // Send verification email with the raw token
    let emailDelivery = null;
    try {
      emailDelivery = await sendVerificationEmail(user.email, verificationToken);
    } catch (err) {
      console.error("Failed to send verification email in background:", err.message);
    }

    const emailSent = Boolean(emailDelivery && emailDelivery.delivered);

    res.status(201).json({
      success: true,
      message: emailSent
        ? "User registered successfully. Please check your email to verify your account."
        : "User registered successfully. However, verification email delivery via SMTP failed. Please check your email settings or request a verification resend.",
      emailDelivered: emailSent,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const query = User.findOne({ email: cleanEmail });
    const user = await (typeof query?.select === "function" ? query.select("+password") : query);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Prevent login if account is deactivated/deleted
    if (user.isDeleted) {
      return res.status(401).json({
        success: false,
        message: "This account has been deactivated. Please contact support.",
      });
    }

    // Prevent login if email is not verified
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: "Please verify your email address to log in.",
      });
    }

    // Prevent login if account is blocked
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked. Please contact support.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    // Prevent account enumeration: return success even if user does not exist
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If an account exists for this email, a password reset link has been sent.",
      });
    }

    // Only allow verified users to reset password
    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Please verify your email address before resetting your password.",
      });
    }

    // Generate secure random reset token (32 bytes)
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash the token using SHA256 before saving to database
    const hashedResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetToken = hashedResetToken;
    user.resetTokenExpire = Date.now() + 15 * 60 * 1000; // 15 minutes expiry

    await user.save();

    // Send reset email
    let emailDelivery = null;
    try {
      emailDelivery = await sendPasswordResetEmail(user.email, resetToken);
    } catch (err) {
      console.error("Failed to send password reset email in background:", err.message);
    }

    if (!emailDelivery || !emailDelivery.delivered) {
      return res.status(502).json({
        success: false,
        message: "Failed to dispatch password reset email via SMTP. Please try again later or contact support.",
      });
    }

    res.status(200).json({
      success: true,
      message: "If an account exists for this email, a password reset link has been sent.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Check if password reset token is valid
// @route   GET /api/auth/reset-password/:token
// @access  Public
const checkResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    // Hash the token using SHA256 to match database
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset token or it has expired.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Reset token is valid.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Reset user password using token
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Hash token to query database
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const query = User.findOne({
      resetToken: hashedToken,
      resetTokenExpire: { $gt: Date.now() },
    });
    const user = await (typeof query?.select === "function" ? query.select("+password") : query);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset token or it has expired.",
      });
    }

    // Prevent Same Password Reuse
    const isSamePassword = await bcrypt.compare(password, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be the same as your current password.",
      });
    }

    // Hash new password using bcrypt
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Track password change for JWT session invalidation
    user.passwordChangedAt = Date.now();

    // Clear reset token fields immediately (One-time use)
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

// chnge pass
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } =
      req.body;

    const query = User.findById(req.user._id);
    const user = await (typeof query?.select === "function" ? query.select("+password") : query);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message:
          "Current password is incorrect",
      });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be the same as your current password.",
      });
    }

    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(
      newPassword,
      salt
    );

    // Track password change for JWT session invalidation
    user.passwordChangedAt = Date.now();

    await user.save();

    res.status(200).json({
      success: true,
      message:
        "Password changed successfully",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
const renderVerificationPage = (success, message, redirectUrl) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${success ? 'Email Verified Successfully' : 'Verification Failed'} | SRK Handloom</title>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          font-family: 'Poppins', sans-serif;
          background: linear-gradient(135deg, #f9f5f6 0%, #eae3e5 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .container {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.4);
          border-radius: 20px;
          padding: 40px;
          max-width: 480px;
          width: 100%;
          text-align: center;
          box-shadow: 0 20px 40px rgba(128, 0, 32, 0.05);
          animation: fadeInUp 0.8s ease-out;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .brand-header {
          font-family: 'Playfair Display', serif;
          color: #800020;
          font-size: 32px;
          font-weight: 800;
          letter-spacing: 4px;
          margin-bottom: 30px;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.05);
        }
        .icon-wrapper {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          margin: 0 auto 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          box-shadow: 0 10px 20px rgba(0,0,0,0.05);
          transition: all 0.3s ease;
        }
        .icon-success {
          background-color: #d1e7dd;
          color: #0f5132;
          border: 2px solid #a3cfbb;
        }
        .icon-error {
          background-color: #f8d7da;
          color: #842029;
          border: 2px solid #f5c2c7;
        }
        h2 {
          font-family: 'Playfair Display', serif;
          font-size: 26px;
          font-weight: 700;
          color: #333;
          margin-bottom: 12px;
        }
        p {
          color: #666;
          font-size: 15px;
          line-height: 1.6;
          margin-bottom: 32px;
        }
        .cta-btn {
          display: inline-block;
          background-color: #800020;
          color: white !important;
          text-decoration: none;
          padding: 14px 36px;
          border-radius: 30px;
          font-weight: 600;
          font-size: 15px;
          letter-spacing: 1px;
          transition: all 0.3s ease;
          box-shadow: 0 10px 20px rgba(128, 0, 32, 0.2);
        }
        .cta-btn:hover {
          background-color: #600018;
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(128, 0, 32, 0.3);
        }
        .cta-btn:active {
          transform: translateY(0);
        }
        .footer {
          margin-top: 40px;
          font-size: 11px;
          color: #999;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="brand-header">SRK HANDLOOM</div>
        
        <div class="icon-wrapper ${success ? 'icon-success' : 'icon-error'}">
          ${success ? '✓' : '✗'}
        </div>
        
        <h2>${success ? 'Email Verified!' : 'Verification Failed'}</h2>
        <p>${message}</p>
        
        <a href="${redirectUrl}" class="cta-btn">
          ${success ? 'Proceed to Login' : 'Back to Homepage'}
        </a>
        
        <div class="footer">
          Handloom Sarees Woven with Heritage &copy; 2026
        </div>
      </div>
    </body>
    </html>
  `;
};

// Verify Email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    // Hash the raw token to match the database value
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with matching token
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
    });

    const wantsJson = req.headers.accept && req.headers.accept.includes("application/json");

    if (!user) {
      if (wantsJson) {
        return res.status(400).json({
          success: false,
          message: "The verification link is invalid or has already been used. Please try logging in or request a new verification email.",
        });
      }
      const html = renderVerificationPage(
        false,
        "The verification link is invalid or has already been used. Please try logging in or request a new verification email.",
        `${frontendUrl}/login`
      );
      res.setHeader("Content-Type", "text/html");
      return res.status(400).send(html);
    }

    // Check if expired
    if (user.emailVerificationTokenExpire < Date.now()) {
      if (wantsJson) {
        return res.status(400).json({
          success: false,
          message: "This verification link has expired. Please request a new one by trying to log in.",
        });
      }
      const html = renderVerificationPage(
        false,
        "This verification link has expired. Please request a new one by trying to log in.",
        `${frontendUrl}/login`
      );
      res.setHeader("Content-Type", "text/html");
      return res.status(400).send(html);
    }

    // Mark as verified and clear verification fields
    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpire = undefined;
    user.lastVerificationEmailSentAt = undefined;

    await user.save();

    if (wantsJson) {
      return res.status(200).json({
        success: true,
        message: "Your email has been verified successfully. You can now log in.",
      });
    }

    const html = renderVerificationPage(
      true,
      "Your email has been verified successfully. You can now log in to explore our collection of premium handloom sarees.",
      `${frontendUrl}/login`
    );
    res.setHeader("Content-Type", "text/html");
    return res.status(200).send(html);
  } catch (error) {
    if (req.headers.accept && req.headers.accept.includes("application/json")) {
      return res.status(500).json({
        success: false,
        message: `An internal error occurred: ${error.message}`,
      });
    }
    const html = renderVerificationPage(
      false,
      `An internal error occurred: ${error.message}`,
      `${process.env.FRONTEND_URL || "http://localhost:5173"}/`
    );
    res.setHeader("Content-Type", "text/html");
    return res.status(500).send(html);
  }
};

// Resend Verification Email
const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // If already verified, return a friendly response
    if (user.isVerified) {
      return res.status(200).json({
        success: true,
        message: "This account is already verified. Please log in.",
      });
    }

    // Cooldown check (30 seconds)
    if (user.lastVerificationEmailSentAt && (Date.now() - user.lastVerificationEmailSentAt < 30000)) {
      const secondsLeft = Math.ceil((30000 - (Date.now() - user.lastVerificationEmailSentAt)) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${secondsLeft} seconds before requesting another verification email.`,
      });
    }

    // Generate secure random verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Hash the token before storing it
    const hashedVerificationToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    user.emailVerificationToken = hashedVerificationToken;
    user.emailVerificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000;
    user.lastVerificationEmailSentAt = Date.now();

    await user.save();

    // Send verification email
    let emailDelivery = null;
    try {
      emailDelivery = await sendVerificationEmail(user.email, verificationToken);
    } catch (err) {
      console.error("Failed to send verification email in background:", err.message);
    }

    if (!emailDelivery || !emailDelivery.delivered) {
      return res.status(502).json({
        success: false,
        message: "Failed to deliver verification email via SMTP. Please verify SMTP settings or try again later.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Verification email resent successfully. Please check your inbox.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
  changePassword,
  verifyEmail,
  resendVerificationEmail,
  checkResetToken,
  resetPassword,
};
