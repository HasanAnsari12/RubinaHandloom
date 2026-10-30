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
      select: false,
    },
    resetToken: {
      type: String,
      select: false,
    },
    resetTokenExpire: Date,
    passwordChangedAt: Date,

    emailVerificationToken: {
      type: String,
      select: false,
    },
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
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent sensitive fields from leaking in JSON / Object serialization
const sanitizeUser = (doc, ret) => {
  delete ret.password;
  delete ret.resetToken;
  delete ret.emailVerificationToken;
  return ret;
};

userSchema.set("toJSON", { transform: sanitizeUser });
userSchema.set("toObject", { transform: sanitizeUser });

module.exports = mongoose.model("User", userSchema);