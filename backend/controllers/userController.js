const User = require("../models/User");
const mongoose = require("mongoose");

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
      user: typeof user.toJSON === "function" ? user.toJSON() : user,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Audit Trail Helper Placeholder
const logAdminAction = (adminId, action, targetUserId) => {
  console.log(`[AUDIT TRAIL LOG] Admin: ${adminId} performed action: "${action}" on User: ${targetUserId} at ${new Date().toISOString()}`);
  // TODO: Insert record into Audit Logs collection when implemented in future phases.
};

// Admin: Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ isDeleted: { $ne: true } })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Admin: Delete a user by ID (Soft Delete)
const deleteUser = async (req, res) => {
  try {
    const targetId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // 1. Self Protection Check: Prevent deleting own account
    if (req.user._id.toString() === targetId) {
      return res.status(403).json({
        success: false,
        message: "Self protection: You cannot delete your own account.",
      });
    }

    const user = await User.findById(targetId);

    if (!user || user.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 2. Self Protection: Block demoting or deleting other admins
    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Protection: Cannot delete admin accounts",
      });
    }

    // Soft delete mapping
    user.isDeleted = true;
    user.deletedAt = new Date();
    await user.save();

    // Audit Trail placeholder
    logAdminAction(req.user._id, "SOFT_DELETE_USER", targetId);

    res.status(200).json({
      success: true,
      message: "User deleted successfully (soft-deleted)",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Admin: Change User Role
const updateUserRole = async (req, res) => {
  try {
    const targetId = req.params.id;
    const { role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role value. Must be 'user' or 'admin'",
      });
    }

    // 1. Self Protection: Cannot demote yourself
    if (req.user._id.toString() === targetId) {
      return res.status(403).json({
        success: false,
        message: "Self protection: You cannot change your own role.",
      });
    }

    const user = await User.findById(targetId);
    if (!user || user.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    // Audit log
    logAdminAction(req.user._id, `CHANGE_ROLE_FROM_${oldRole.toUpperCase()}_TO_${role.toUpperCase()}`, targetId);

    res.status(200).json({
      success: true,
      message: `User role updated successfully to ${role}`,
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

// Admin: Update User Status (Block/Unblock)
const updateUserStatus = async (req, res) => {
  try {
    const targetId = req.params.id;
    const { isBlocked } = req.body;

    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (typeof isBlocked !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isBlocked parameter must be a boolean",
      });
    }

    // 1. Self Protection: Cannot block yourself
    if (req.user._id.toString() === targetId) {
      return res.status(403).json({
        success: false,
        message: "Self protection: You cannot block or unblock yourself.",
      });
    }

    const user = await User.findById(targetId);
    if (!user || user.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Protection check: Cannot block other Admins
    if (user.role === "admin" && isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Protection: Cannot block admin accounts",
      });
    }

    user.isBlocked = isBlocked;
    await user.save();

    // Audit log
    logAdminAction(req.user._id, isBlocked ? "BLOCK_USER" : "UNBLOCK_USER", targetId);

    res.status(200).json({
      success: true,
      message: `User account has been successfully ${isBlocked ? "blocked" : "unblocked"}`,
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
  getAllUsers,
  deleteUser,
  updateUserRole,
  updateUserStatus,
};