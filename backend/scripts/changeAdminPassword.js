// backend/scripts/changeAdminPassword.js
/**
 * Secure Administrator Password Change Script
 * 
 * Safely changes the password for an existing administrator in srk_handloom_staging.
 * Reuses existing project bcrypt (10 rounds) and Mongoose User model.
 * 
 * Security Policy:
 * 1. Strictly prohibits passing passwords via command-line arguments.
 * 2. Prompts for current and new passwords interactively via stdin.
 * 3. Verifies the current password against stored bcrypt hash before making changes.
 * 4. Only targets accounts with role: "admin" (strictly prohibits modifying non-admin accounts).
 * 5. Requires new password to be at least 6 characters and distinct from current password.
 * 6. Sets user.passwordChangedAt to invalidate previous JWT sessions.
 * 7. Never prints passwords, hashes, tokens, database URIs, or secrets.
 * 
 * Usage:
 *   node scripts/changeAdminPassword.js --email="admin@example.com"
 * Or run interactively:
 *   node scripts/changeAdminPassword.js
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const readline = require("readline");
const User = require("../models/User");

// Helper to parse CLI arguments in the format --key=value or --key value
const parseArgs = () => {
  const args = {};
  const rawArgs = process.argv.slice(2);
  for (let i = 0; i < rawArgs.length; i++) {
    const arg = rawArgs[i];
    if (arg.startsWith("--")) {
      const equalIndex = arg.indexOf("=");
      if (equalIndex !== -1) {
        const key = arg.slice(2, equalIndex);
        const value = arg.slice(equalIndex + 1);
        args[key] = value;
      } else {
        const key = arg.slice(2);
        const nextVal = rawArgs[i + 1];
        if (nextVal && !nextVal.startsWith("--")) {
          args[key] = nextVal;
          i++;
        } else {
          args[key] = true;
        }
      }
    }
  }
  return args;
};

let sharedRl = null;
const linesQueue = [];
const lineResolvers = [];

const getReadline = () => {
  if (!sharedRl) {
    sharedRl = readline.createInterface({
      input: process.stdin,
      terminal: false,
    });
    sharedRl.on("line", (line) => {
      if (lineResolvers.length > 0) {
        const resolve = lineResolvers.shift();
        resolve(line);
      } else {
        linesQueue.push(line);
      }
    });
    sharedRl.on("close", () => {
      while (lineResolvers.length > 0) {
        const resolve = lineResolvers.shift();
        resolve(linesQueue.shift() || "");
      }
    });
  }
  return sharedRl;
};

// Interactive prompt helper
const promptInput = (question, isPassword = false) => {
  return new Promise((resolve) => {
    if (isPassword && process.stdin.isTTY) {
      process.stdout.write(question);
      let pass = "";
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.setEncoding("utf8");

      const onData = (char) => {
        if (char === "\n" || char === "\r" || char === "\u0004") {
          process.stdin.setRawMode(false);
          process.stdin.removeListener("data", onData);
          process.stdout.write("\n");
          resolve(pass);
        } else if (char === "\u0003") {
          process.exit(1);
        } else if (char === "\u007f" || char === "\b") {
          if (pass.length > 0) {
            pass = pass.slice(0, -1);
            process.stdout.write("\b \b");
          }
        } else {
          pass += char;
          process.stdout.write("*");
        }
      };

      process.stdin.on("data", onData);
    } else {
      process.stdout.write(question);
      getReadline();
      if (linesQueue.length > 0) {
        resolve(linesQueue.shift().trim());
      } else {
        lineResolvers.push((line) => resolve(line.trim()));
      }
    }
  });
};

const changeAdminPassword = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("❌ ABORT: MONGO_URI is not configured in backend/.env.");
    process.exit(1);
  }

  const cliArgs = parseArgs();

  // Guard: Prohibit passwords passed in command line arguments
  if (cliArgs.password || cliArgs.currentPassword || cliArgs.newPassword) {
    console.error("\n❌ Security Policy Violation: Passing passwords via CLI arguments is strictly prohibited.");
    console.error("   Passwords in command-line arguments are exposed to process lists and shell history.");
    console.error("   Please run without password flags to use the secure interactive prompt.\n");
    process.exit(1);
  }

  let email = cliArgs.email || process.env.ADMIN_EMAIL;

  console.log("=================================================================");
  console.log("SRK Handloom — Secure Administrator Password Change Tool");
  console.log("Database Target: srk_handloom_staging");
  console.log("=================================================================");

  // Prompt interactively for email if missing
  if (!email) {
    email = await promptInput("Enter Administrator Email: ");
  }

  if (!email) {
    console.error("❌ Error: Administrator email is required.");
    console.error('Usage: node scripts/changeAdminPassword.js --email="admin@example.com"');
    process.exit(1);
  }

  const cleanEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    console.error("❌ Error: Invalid email address format.");
    process.exit(1);
  }

  // Prompt for current password
  const currentPassword = await promptInput("Enter Current Administrator Password: ", true);
  if (!currentPassword) {
    console.error("❌ Error: Current password is required.");
    process.exit(1);
  }

  // Prompt for new password
  const newPassword = await promptInput("Enter New Administrator Password (min 6 characters): ", true);
  if (!newPassword || newPassword.length < 6) {
    console.error("❌ Error: New password must be at least 6 characters long.");
    process.exit(1);
  }

  if (currentPassword === newPassword) {
    console.error("❌ Error: New password cannot be the same as your current password.");
    process.exit(1);
  }

  // Confirm new password
  const confirmNewPassword = await promptInput("Confirm New Administrator Password: ", true);
  if (newPassword !== confirmNewPassword) {
    console.error("❌ Error: New passwords do not match. Aborting.");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);

    // Look up administrator account (explicitly selecting password field)
    const query = User.findOne({ email: cleanEmail });
    const adminUser = await (typeof query?.select === "function" ? query.select("+password") : query);

    if (!adminUser) {
      console.error(`\n❌ Error: No user account found for "${cleanEmail}".`);
      process.exit(1);
    }

    // Guard: strictly ensure account has role: "admin"
    if (adminUser.role !== "admin") {
      console.error(`\n❌ Security Policy: Account "${cleanEmail}" does not have administrator privileges.`);
      console.error("   This tool is restricted exclusively to administrator accounts.\n");
      process.exit(1);
    }

    // Verify current password against stored hash
    const isCurrentMatch = await bcrypt.compare(currentPassword, adminUser.password);
    if (!isCurrentMatch) {
      console.error("\n❌ Authentication Error: Current password is incorrect. Verification failed.");
      process.exit(1);
    }

    // Hash new password using project bcrypt (10 rounds)
    const salt = await bcrypt.genSalt(10);
    adminUser.password = await bcrypt.hash(newPassword, salt);

    // Update password changed timestamp to invalidate earlier JWTs
    adminUser.passwordChangedAt = Date.now();

    await adminUser.save();

    console.log("\n=================================================");
    console.log("✅ Administrator Password Changed Successfully");
    console.log("=================================================");
    console.log(`- ID:                ${adminUser._id}`);
    console.log(`- Email:             ${adminUser.email}`);
    console.log(`- Role:              ${adminUser.role}`);
    console.log(`- Password Changed:  ${new Date(adminUser.passwordChangedAt).toISOString()}`);
    console.log(`- Previous Sessions: Invalidated`);
    console.log("=================================================");
    console.log("You can now log in to the Admin Portal (port 5174) with your new password.\n");
  } catch (error) {
    console.error(`\n❌ Execution error: ${error.message}`);
    process.exitCode = 1;
  } finally {
    if (sharedRl) sharedRl.close();
    await mongoose.disconnect();
  }
};

changeAdminPassword();
