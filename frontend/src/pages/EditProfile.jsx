import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./EditProfile.css";

function EditProfile() {
  const navigate = useNavigate();

  const user =
    JSON.parse(localStorage.getItem("user")) || {};

  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [gender, setGender] = useState(user.gender || "");
  const [dob, setDob] = useState(user.dob || "");
  const [profileImage, setProfileImage] = useState(
    user.profileImage || ""
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token =
        localStorage.getItem("token");

      const { data } = await axios.put(
        "http://localhost:5000/api/users/profile",
        {
          name,
          phone,
          gender,
          dob,
          profileImage,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      toast.success(
        "Profile Updated Successfully"
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Update Failed"
      );
    }
  };

  return (
    <div className="profile-page">

      <div className="profile-wrapper">

        {/* LEFT SIDE */}

        <div className="profile-preview">

          <button
            className="back-btn"
            onClick={() =>
              navigate("/account")
            }
          >
            ← My Account
          </button>

          <div className="profile-image">

            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
              />
            ) : (
              <span>
                {name?.charAt(0)?.toUpperCase()}
              </span>
            )}

          </div>

          <h2>{name || "Your Name"}</h2>

          <p>{user.email}</p>

          <div className="premium-badge">
            Premium Member
          </div>

        </div>

        {/* RIGHT SIDE */}

        <div className="profile-form">

          <h1>Edit Profile</h1>

          <form onSubmit={handleSubmit}>

            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
            />

            <input
              type="text"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value)
              }
            />

            <input
              type="text"
              placeholder="Profile Image URL"
              value={profileImage}
              onChange={(e) =>
                setProfileImage(
                  e.target.value
                )
              }
            />

            <select
              value={gender}
              onChange={(e) =>
                setGender(e.target.value)
              }
            >
              <option value="">
                Select Gender
              </option>

              <option value="Male">
                Male
              </option>

              <option value="Female">
                Female
              </option>

              <option value="Other">
                Other
              </option>
            </select>

            <input
              type="date"
              value={dob}
              onChange={(e) =>
                setDob(e.target.value)
              }
            />

            <button type="submit">
              Save Changes
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}

export default EditProfile;