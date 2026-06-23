import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./ChangePassword.css";
function ChangePassword() {

  const navigate = useNavigate();

  const [currentPassword,
    setCurrentPassword] = useState("");

  const [newPassword,
    setNewPassword] = useState("");

  const [confirmPassword,
    setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      newPassword !== confirmPassword
    ) {
      return toast.error(
        "Passwords do not match"
      );
    }

    try {

      const token =
        localStorage.getItem("token");

      const { data } = await axios.put(
        "http://localhost:5000/api/auth/change-password",
        {
          currentPassword,
          newPassword,
        },
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      toast.success(data.message);

      navigate("/account");

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        "Password change failed"
      );

    }
  };

  return (
  <div className="change-password-page">

    <button
      className="back-btn"
      onClick={() => navigate("/account")}
    >
      ← My Account
    </button>

    <div className="password-card">

      <h1>🔒 Change Password</h1>

      <form onSubmit={handleSubmit}>

        <input
          type="password"
          placeholder="Current Password"
          value={currentPassword}
          onChange={(e) =>
            setCurrentPassword(
              e.target.value
            )
          }
        />

        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) =>
            setNewPassword(
              e.target.value
            )
          }
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) =>
            setConfirmPassword(
              e.target.value
            )
          }
        />

        <button type="submit">
          Update Password
        </button>

      </form>

    </div>

  </div>
);
}

export default ChangePassword;