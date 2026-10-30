// @desc    Validate user registration data
const validateRegister = (req, res, next) => {
  let { name, email, password } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: "Name is required",
    });
  }

  name = name.trim();
  req.body.name = name; // Update req.body with trimmed value

  if (name.length < 2) {
    return res.status(400).json({
      success: false,
      message: "Name must be at least 2 characters long",
    });
  }

  if (name.length > 50) {
    return res.status(400).json({
      success: false,
      message: "Name cannot exceed 50 characters",
    });
  }

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  email = email.trim().toLowerCase();
  req.body.email = email; // Update req.body with trimmed and lowercased value

  if (email.length > 100) {
    return res.status(400).json({
      success: false,
      message: "Email cannot exceed 100 characters",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid email address",
    });
  }

  if (!password) {
    return res.status(400).json({
      success: false,
      message: "Password is required",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters long",
    });
  }

  next();
};

// @desc    Validate user login data
const validateLogin = (req, res, next) => {
  let { email, password } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  email = email.trim().toLowerCase();
  req.body.email = email; // Update req.body with trimmed and lowercased value

  if (email.length > 100) {
    return res.status(400).json({
      success: false,
      message: "Email cannot exceed 100 characters",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid email address",
    });
  }

  if (!password) {
    return res.status(400).json({
      success: false,
      message: "Password is required",
    });
  }

  next();
};

// @desc    Validate forgot password request
const validateForgotPassword = (req, res, next) => {
  let { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  email = email.trim().toLowerCase();
  req.body.email = email; // Update req.body with trimmed and lowercased value

  if (email.length > 100) {
    return res.status(400).json({
      success: false,
      message: "Email cannot exceed 100 characters",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid email address",
    });
  }

  next();
};

// @desc    Validate change password data
const validateChangePassword = (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword) {
    return res.status(400).json({
      success: false,
      message: "Current password is required",
    });
  }

  if (!newPassword) {
    return res.status(400).json({
      success: false,
      message: "New password is required",
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: "New password must be at least 6 characters long",
    });
  }

  if (currentPassword === newPassword) {
    return res.status(400).json({
      success: false,
      message: "New password cannot be the same as current password",
    });
  }

  next();
};

// @desc    Validate reset password data
const validateResetPassword = (req, res, next) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({
      success: false,
      message: "Password is required",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters long",
    });
  }

  const uppercaseRegex = /[A-Z]/;
  const lowercaseRegex = /[a-z]/;
  const numberRegex = /[0-9]/;
  const specialCharRegex = /[^A-Za-z0-9]/;

  if (!uppercaseRegex.test(password)) {
    return res.status(400).json({
      success: false,
      message: "Password must contain at least one uppercase letter",
    });
  }

  if (!lowercaseRegex.test(password)) {
    return res.status(400).json({
      success: false,
      message: "Password must contain at least one lowercase letter",
    });
  }

  if (!numberRegex.test(password)) {
    return res.status(400).json({
      success: false,
      message: "Password must contain at least one number",
    });
  }

  if (!specialCharRegex.test(password)) {
    return res.status(400).json({
      success: false,
      message: "Password must contain at least one special character",
    });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateChangePassword,
  validateResetPassword,
};
