import { useState } from "react";
import { forgotPassword } from "../services/authService";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import "./ForgotPassword.css";
function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    await forgotPassword(email);

    toast.success(
      "Reset link sent successfully!"
    );
  } catch (error) {
    toast.error(
      error.response?.data?.message ||
      "Something went wrong"
    );
  }
};

  return (
    <div className="forgot-page">

      <div className="forgot-card">

        <h1>Forgot Password</h1>

        <p>
          Enter your email address and
          we'll send you a password reset
          link.
        </p>

        <form onSubmit={handleSubmit}>

          <input
            type="email"
            placeholder="Enter Email Address"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />

          <button type="submit">
            Send Reset Link
          </button>
      
      <div className="back-login">
  <Link to="/login">
    Back to Login
  </Link>
</div>
        </form>

      </div>

    </div>
  );
}

export default ForgotPassword;