// frontend/src/pages/Login.jsx

import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { loginUser, resendVerification } from "../services/authService";
import { useAppContext } from "../context/AppContext";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAppContext();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (cooldown > 0) {
      timerRef.current = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [cooldown]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await loginUser(formData);

      // Save token and user in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Update application context state
      login(data.user);

      // Redirect to Home page
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    try {
      setLoading(true);
      await resendVerification(formData.email);
      toast.success("Verification email resent successfully! Please check your inbox.");
      setCooldown(30); // 30 seconds timer!
    } catch (err) {
      const errMsg = err.response?.data?.message || "Failed to resend verification email.";
      toast.error(errMsg);

      // Smart Sync: Extract remaining seconds from backend cooldown message if present
      const match = errMsg.match(/please wait (\d+) seconds/i);
      if (match) {
        const seconds = parseInt(match[1], 10);
        setCooldown(seconds);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-split-container">
        {/* 45% Branding Panel */}
        <div className="login-branding-panel">
          <div className="hero-overlay"></div>
        </div>

        {/* 55% Login Form Section */}
        <div className="login-form-panel">
          <div className="login-card">
            <div className="login-logo-mobile">SRK Handloom</div>
            <h2>Welcome Back</h2>
            <p className="login-subtitle">
              Sign in to access your account.
            </p>

            {error && (
              <div className="login-error-container">
                <span className="login-error">{error}</span>
                {error.toLowerCase().includes("verify your email") && (
                  <button
                    type="button"
                    className="login-resend-btn"
                    onClick={handleResend}
                    disabled={loading || cooldown > 0}
                  >
                    {cooldown > 0
                      ? `Resend Email (${cooldown}s)`
                      : "Resend Verification Email"
                    }
                  </button>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    disabled={loading}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="forgot-link">
                <Link to="/forgot-password">
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                className="login-submit-btn"
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </form>

            {/* Trust Row */}
            <div className="login-trust-row">
              <div className="trust-cell">
                <span className="trust-icon">🔒</span> Secure Login
              </div>
              <div className="trust-cell">
                <span className="trust-icon">🚚</span> Pan India Delivery
              </div>
              <div className="trust-cell">
                <span className="trust-icon">🧵</span> Authentic Handloom
              </div>
            </div>

            <div className="register-link">
              Don't have an account?{" "}
              <Link to="/register">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;