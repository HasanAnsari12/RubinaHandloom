import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { verifyEmail } from "../services/authService";
import "./ForgotPassword.css";

function VerifyEmail() {
  const { token } = useParams();
  const [verifying, setVerifying] = useState(Boolean(token));
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState(() => (token ? "" : "No verification token was provided."));

  useEffect(() => {
    if (!token) return;

    let isMounted = true;

    const executeVerification = async () => {
      try {
        const res = await verifyEmail(token);
        if (isMounted) {
          setSuccess(true);
          setMessage(
            res.message ||
              "Your email has been verified successfully. You can now log in."
          );
        }
      } catch (err) {
        if (isMounted) {
          setSuccess(false);
          setMessage(
            err.response?.data?.message ||
              "The verification link is invalid, has expired, or has already been used."
          );
        }
      } finally {
        if (isMounted) {
          setVerifying(false);
        }
      }
    };

    executeVerification();

    return () => {
      isMounted = false;
    };
  }, [token]);

  if (verifying) {
    return (
      <div className="forgot-page">
        <div className="forgot-card">
          <div className="forgot-logo">SRK Handloom</div>
          <p className="forgot-subtitle" style={{ marginTop: "24px" }}>
            Verifying your security credentials...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-page">
      <div className="forgot-card">
        <div className="forgot-logo">SRK Handloom</div>

        {success ? (
          <div className="forgot-success-state" style={{ marginTop: "24px" }}>
            <div className="success-icon-wrapper">✓</div>
            <h1>Email Verified!</h1>
            <p className="forgot-subtitle">{message}</p>
            <div className="back-login">
              <Link to="/login" className="proceed-login-btn">
                Proceed to Login
              </Link>
            </div>
          </div>
        ) : (
          <div className="forgot-error-state" style={{ marginTop: "24px" }}>
            <div className="error-icon-wrapper">✗</div>
            <h1>Verification Failed</h1>
            <p className="forgot-subtitle">{message}</p>
            <div className="back-login">
              <Link to="/login" className="proceed-login-btn">
                Go to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;
