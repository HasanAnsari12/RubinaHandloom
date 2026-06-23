// frontend/src/pages/Login.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import { Link } from "react-router-dom";
import "./Login.css";
function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  return (
  <div className="login-page">

    <div className="login-hero">
      <div className="hero-overlay">
        
      </div>
    </div>

    <div className="login-card">

      <div className="login-logo">
        RUBINA
      </div>

      <h2>Welcome Back</h2>

      <p className="login-subtitle">
        Sign in to access your curated collection.
      </p>

      {error && (
        <p className="login-error">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit}>

        <label>Email Address</label>

        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label>Password</label>

        <input
          type="password"
          name="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <div className="forgot-link">
          <Link to="/forgot-password">
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Signing In..."
            : "SIGN IN"}
        </button>

      </form>

      <div className="register-link">
        Don't have an account?{" "}
        <Link to="/register">
          Sign Up
        </Link>
      </div>

    </div>

  </div>
);
}

export default Login;