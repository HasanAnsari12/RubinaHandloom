const nodemailer = require("nodemailer");

/**
 * Send an email using configured SMTP transporter, or fall back to console logging in development.
 * 
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content
 */
let cachedTransporter = null;

const getTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) return null;
  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT, 10) || 465,
      secure: parseInt(SMTP_PORT, 10) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }
  return cachedTransporter;
};

/**
 * Send an email using configured SMTP transporter, or fall back to console logging in development.
 * 
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content
 */
const sendEmail = async (options) => {
  const { SMTP_USER, SMTP_FROM } = process.env;
  const transporter = getTransporter();

  if (transporter) {
    try {
      const mailOptions = {
        from: SMTP_FROM || `"SRK Handloom" <${SMTP_USER || "ansarihasan1062@gmail.com"}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`Email successfully sent to ${options.to}. Message ID: ${info.messageId}`);
      return { ...info, delivered: true, success: true };
    } catch (err) {
      console.error(`Failed to send email via SMTP to ${options.to}:`, err.message);
      console.log("Falling back to console email output.");
    }
  }

  // Fallback: Console Logging Box
  const border = "=".repeat(60);
  console.log(`
${border}
✉️  OUTGOING EMAIL (SMTP Not Configured or Failed)
${border}
TO:      ${options.to}
FROM:    ${SMTP_FROM || `"SRK Handloom" <${SMTP_USER || "ansarihasan1062@gmail.com"}>`}
SUBJECT: ${options.subject}
TEXT:    ${options.text}
${border}
`);
  return { delivered: false, success: false, fallbackLogged: true };
};

/**
 * Send a verification email to the user.
 * 
 * @param {string} email - Recipient email address
 * @param {string} rawToken - Plaintext verification token
 */
const sendVerificationEmail = async (email, rawToken) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const verifyUrl = `${frontendUrl}/verify-email/${rawToken}`;

  const subject = "Verify Your SRK Handloom Account";
  const text = `Welcome to SRK Handloom!\n\nPlease verify your email by clicking the following link:\n${verifyUrl}\n\nThis link will expire in 24 hours.`;
  const html = `
    <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #800020; text-align: center; border-bottom: 2px solid #800020; padding-bottom: 10px;">SRK HANDLOOM</h2>
      <p>Dear Customer,</p>
      <p>Thank you for registering with SRK Handloom. Please verify your email address to activate your account and start shopping.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verifyUrl}" style="background-color: #800020; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Verify Email Address</a>
      </div>
      <p>Or copy and paste this URL into your browser:</p>
      <p style="word-break: break-all; color: #555;"><a href="${verifyUrl}">${verifyUrl}</a></p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #888; text-align: center;">This link will expire in 24 hours. If you did not register for this account, you can safely ignore this email.</p>
    </div>
  `;

  return await sendEmail({ to: email, subject, text, html });
};

/**
 * Send a password reset email to the user.
 * 
 * @param {string} email - Recipient email address
 * @param {string} rawToken - Plaintext reset token
 */
const sendPasswordResetEmail = async (email, rawToken) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const resetUrl = `${frontendUrl}/reset-password/${rawToken}`;

  const subject = "Reset Your SRK Handloom Password";
  const text = `Dear Customer,\n\nYou have requested to reset your password. Please click the following link to create a new password:\n${resetUrl}\n\nThis link will expire in 15 minutes.\n\nIf you did not request this, you can safely ignore this email.`;
  const html = `
    <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #800020; text-align: center; border-bottom: 2px solid #800020; padding-bottom: 10px; font-family: 'Playfair Display', serif; letter-spacing: 2px;">SRK HANDLOOM</h2>
      <p>Dear Customer,</p>
      <p>We received a request to reset the password for your account. Please click the button below to choose a new password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #800020; color: white; padding: 12px 28px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block; font-size: 15px; letter-spacing: 0.5px;">Reset Password</a>
      </div>
      <p>Or copy and paste this URL into your browser:</p>
      <p style="word-break: break-all; color: #555;"><a href="${resetUrl}">${resetUrl}</a></p>
      <p style="font-size: 13px; color: #666; font-style: italic; margin-top: 15px;">Please note: This link will expire in <strong>15 minutes</strong> for your security.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #888; text-align: center;">If you did not request this password reset, simply ignore this email. Your password will remain unchanged.</p>
    </div>
  `;

  return await sendEmail({ to: email, subject, text, html });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
};
