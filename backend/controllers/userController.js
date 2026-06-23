const User = require("../models/User");

// Update Profile
const updateProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      gender,
      dob,
      profileImage,
    } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.gender = gender || user.gender;
    user.dob = dob || user.dob;
    user.profileImage =
      profileImage || user.profileImage;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  updateProfile,
};