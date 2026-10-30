import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { checkResetToken, resetPassword } from "../services/authService";
import { toast } from "react-toastify";
import "./ForgotPassword.css";

function ResetPassword() {
  const { token } = useParams();

  const [checkingToken, setCheckingToken] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Password rules validation
  const rules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    specialChar: /[^A-Za-z0-9]/.test(password),
  };

  const satisfiedCount = Object.values(rules).filter(Boolean).length;
  const isFormValid = satisfiedCount === 5 && password === confirmPassword;

  let strengthLabel = "Weak";
  let strengthColor = "#dc2626"; // Red
  if (satisfiedCount === 5) {
    strengthLabel = "Strong";
    strengthColor = "#0f5132"; // Green
  } else if (satisfiedCount >= 3) {
    strengthLabel = "Medium";
    strengthColor = "#d97706"; // Orange
  }

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      try {
        await checkResetToken(token);
        setIsTokenValid(true);
      } catch {
        setIsTokenValid(false);
      } finally {
        setCheckingToken(false);
      }
    };
    validateToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);

    try {
      await resetPassword(token, password);
      toast.success("Password reset successfully!");
      setSuccess(true);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (checkingToken) {
    return (
      <div className="forgot-page">
        <div className="forgot-card">
          <div className="forgot-logo">SRK Handloom</div>
          <p className="forgot-subtitle" style={{ marginTop: "20px" }}>
            Validating security token...
          </p>
        </div>
      </div>
    );
  }

  if (!isTokenValid) {
    return (
      <div className="forgot-page">
        <div className="forgot-card">
          <div className="forgot-logo">SRK Handloom</div>
          <div className="forgot-error-state" style={{ marginTop: "24px" }}>
            <div className="error-icon-wrapper">✗</div>
            <h1>Verification Failed</h1>
            <p className="forgot-subtitle">
              This password reset link is invalid, has expired, or has already been used. Please request a new link.
            </p>
            <div className="back-login">
              <Link to="/forgot-password" className="proceed-login-btn">Request New Link</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-page">
      <div className="forgot-card">
        <div className="forgot-logo">SRK Handloom</div>

        {!success ? (
          <>
            <h1>Reset Password</h1>
            <p className="forgot-subtitle">
              Create a new secure password for your account.
            </p>

            <form onSubmit={handleSubmit}>
              {/* New Password */}
              <div className="form-group-forgot">
                <label htmlFor="password">New Password</label>
                <div className="password-wrapper-forgot">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="New password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn-forgot"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="form-group-forgot">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="password-wrapper-forgot">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn-forgot"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Password Match Status */}
              {password && confirmPassword && (
                <p 
                  className="password-match-status" 
                  style={{ color: password === confirmPassword ? "#0f5132" : "#dc2626" }}
                >
                  {password === confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                </p>
              )}

              {/* Password Strength Indicator */}
              {password && (
                <div className="password-strength-indicator">
                  <div className="strength-header">
                    <span>Password Strength:</span>
                    <strong style={{ color: strengthColor }}>{strengthLabel}</strong>
                  </div>
                  <div className="strength-bar-bg">
                    <div 
                      className="strength-bar-fill" 
                      style={{ 
                        width: `${(satisfiedCount / 5) * 100}%`, 
                        backgroundColor: strengthColor 
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Rules Checklist */}
              <div className="password-rules-checklist">
                <p className="checklist-title">Password must contain:</p>
                <ul>
                  <li className={rules.length ? "rule-passed" : "rule-failed"}>
                    <span className="rule-icon">{rules.length ? "✔" : "✗"}</span> Minimum 8 characters
                  </li>
                  <li className={rules.uppercase ? "rule-passed" : "rule-failed"}>
                    <span className="rule-icon">{rules.uppercase ? "✔" : "✗"}</span> At least one uppercase letter
                  </li>
                  <li className={rules.lowercase ? "rule-passed" : "rule-failed"}>
                    <span className="rule-icon">{rules.lowercase ? "✔" : "✗"}</span> At least one lowercase letter
                  </li>
                  <li className={rules.number ? "rule-passed" : "rule-failed"}>
                    <span className="rule-icon">{rules.number ? "✔" : "✗"}</span> At least one number
                  </li>
                  <li className={rules.specialChar ? "rule-passed" : "rule-failed"}>
                    <span className="rule-icon">{rules.specialChar ? "✔" : "✗"}</span> At least one special character
                  </li>
                </ul>
              </div>

              <button 
                type="submit" 
                className="forgot-submit-btn"
                disabled={loading || !isFormValid}
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </>
        ) : (
          <div className="forgot-success-state">
            <div className="success-icon-wrapper">✓</div>
            <h1>Password Updated Successfully</h1>
            <p className="forgot-subtitle">
              Your password has been changed successfully. You can now log in with your new credentials.
            </p>
            <div className="back-login">
              <Link to="/login" className="proceed-login-btn">Go to Login</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;