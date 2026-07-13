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

  email = email.trim();
  req.body.email = email; // Update req.body with trimmed value

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

  email = email.trim();
  req.body.email = email; // Update req.body with trimmed value

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

  email = email.trim();
  req.body.email = email; // Update req.body with trimmed value

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

module.exports = {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateChangePassword,
};
