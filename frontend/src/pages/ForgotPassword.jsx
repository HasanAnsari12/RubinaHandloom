import { useState, useEffect, useRef } from "react";
import { forgotPassword } from "../services/authService";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import "./ForgotPassword.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [rateLimitMessage, setRateLimitMessage] = useState("");

  const isSubmittingRef = useRef(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (cooldown <= 0) return;

    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setRateLimitMessage("");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // In-flight submission guard to prevent double submissions
    if (isSubmittingRef.current || loading || cooldown > 0) return;
    isSubmittingRef.current = true;

    setLoading(true);
    setRateLimitMessage("");

    try {
      const res = await forgotPassword(email);
      toast.success(res.message || "Reset link sent successfully!");
      setSuccess(true);
      setCooldown(30); // 30-second frontend cooldown after submitting
    } catch (error) {
      const errMsg =
        error.response?.data?.message || "Something went wrong. Please try again.";
      toast.error(errMsg);

      // If rate limited (HTTP 429), parse remaining time or set 30s frontend cooldown
      if (error.response?.status === 429) {
        setRateLimitMessage(errMsg);
        const match = errMsg.match(/(\d+)\s*(?:seconds|secs)/i);
        setCooldown(match ? parseInt(match[1], 10) : 30);
      } else {
        setCooldown(30);
      }
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <div className="forgot-page">
      <div className="forgot-card">
        <div className="forgot-logo">SRK Handloom</div>

        {!success ? (
          <>
            <h1>Forgot Password</h1>
            <p className="forgot-subtitle">
              Enter your email address below, and we'll send you a secure link to reset your password.
            </p>

            {rateLimitMessage && (
              <div
                className="forgot-rate-limit-notice"
                style={{
                  background: "#fff1f2",
                  border: "1px solid #fecdd3",
                  color: "#9f1239",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  fontSize: "13.5px",
                  marginBottom: "20px",
                  textAlign: "center",
                  lineHeight: "1.4",
                }}
              >
                <strong>Security Protection:</strong> {rateLimitMessage}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group-forgot">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading || cooldown > 0}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="forgot-submit-btn"
                disabled={loading || cooldown > 0}
              >
                {loading
                  ? "Sending..."
                  : cooldown > 0
                  ? `Please wait (${cooldown}s)`
                  : "Send Reset Link"}
              </button>

              {cooldown > 0 && (
                <p style={{ fontSize: "12.5px", color: "#666", textAlign: "center", marginTop: "10px" }}>
                  Please wait <strong>{cooldown}s</strong> before requesting another reset email.
                </p>
              )}

              <div className="back-login">
                <Link to="/login">← Back to Login</Link>
              </div>
            </form>
          </>
        ) : (
          <div className="forgot-success-state">
            <div className="success-icon-wrapper">✓</div>
            <h1>Reset Link Sent</h1>
            <p className="forgot-subtitle">
              If an account is associated with <strong>{email}</strong>, a password reset email has been sent. Please check your inbox and spam folders.
            </p>
            <div className="back-login">
              <Link to="/login" className="proceed-login-btn">Back to Login</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;