import { useState } from "react";
import { forgotPassword } from "../services/authService";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import "./ForgotPassword.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await forgotPassword(email);
      toast.success(res.message || "Reset link sent successfully!");
      setSuccess(true);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-page">
      <div className="forgot-card">
        <div className="forgot-logo">RUBINA</div>

        {!success ? (
          <>
            <h1>Forgot Password</h1>
            <p className="forgot-subtitle">
              Enter your email address below, and we'll send you a secure link to reset your password.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="form-group-forgot">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="forgot-submit-btn"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>

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