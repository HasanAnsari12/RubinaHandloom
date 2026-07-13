const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      default: "",
    },

    gender: {
  type: String,
  default: "",
},

dob: {
  type: String,
  default: "",
},

profileImage: {
  type: String,
  default: "",
},
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    resetToken: String,
    resetTokenExpire: Date,
    passwordChangedAt: Date,

    emailVerificationToken: String,
    emailVerificationTokenExpire: Date,
    lastVerificationEmailSentAt: Date,

    isVerified: {
      type: Boolean,
      default: false,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);