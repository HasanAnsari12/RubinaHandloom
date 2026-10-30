// backend/scripts/recoverAdminPassword.js
/**
 * One-Time Local Administrator Password Recovery Tool
 * 
 * Safely recovers admin access for asarik782@gmail.com in srk_handloom_staging.
 * Reuses existing project bcrypt (10 rounds) and Mongoose User model.
 * 
 * Safeguards:
 * 1. Connects strictly to srk_handloom_staging (aborts on any database mismatch).
 * 2. Targets strictly asarik782@gmail.com and verifies role === "admin".
 * 3. Never promotes, modifies, or touches any customer accounts or other records.
 * 4. Strictly prohibits passing passwords via command-line arguments.
 * 5. Securely prompts for new password interactively with masking (*).
 * 6. Hashes with bcrypt (10 rounds) and updates passwordChangedAt.
 * 7. Never prints or logs passwords, hashes, tokens, or connection strings.
 * 
 * Usage:
 *   node scripts/recoverAdminPassword.js
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const readline = require("readline");
const User = require("../models/User");

const TARGET_EMAIL = "asarik782@gmail.com";
const TARGET_DB = "srk_handloom_staging";

// Helper to check CLI arguments
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

const recoverAdmin = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("❌ ABORT: MONGO_URI is not configured in backend/.env.");
    process.exit(1);
  }

  const cliArgs = parseArgs();

  // Guard: Prohibit passwords passed in command line arguments
  if (cliArgs.password || cliArgs.newPassword) {
    console.error("\n❌ Security Policy Violation: Passing passwords via CLI arguments is strictly prohibited.");
    console.error("   Passwords in command-line arguments are exposed to process lists and shell history.");
    console.error("   Please run without password flags to use the secure interactive prompt.\n");
    process.exit(1);
  }

  console.log("=================================================================");
  console.log("SRK Handloom — Administrator Password Recovery Tool");
  console.log(`Target Account:  ${TARGET_EMAIL}`);
  console.log(`Target Database: ${TARGET_DB}`);
  console.log("=================================================================");

  try {
    await mongoose.connect(mongoUri);

    // Guard: Verify connected database name matches target database strictly
    const currentDbName = mongoose.connection.name;
    if (currentDbName !== TARGET_DB) {
      console.error(`\n❌ Database Safety Abort: Connected database is "${currentDbName}", but expected "${TARGET_DB}".`);
      console.error("   Aborting to prevent cross-database modifications.\n");
      process.exit(1);
    }

    // Guard: Find exact administrator document
    const query = User.findOne({ email: TARGET_EMAIL });
    const adminUser = await (typeof query?.select === "function" ? query.select("+password") : query);

    if (!adminUser) {
      console.error(`\n❌ Error: No user account found for "${TARGET_EMAIL}".`);
      process.exit(1);
    }

    // Guard: Strictly ensure the targeted account is an administrator
    if (adminUser.role !== "admin") {
      console.error(`\n❌ Security Policy Violation: Account "${TARGET_EMAIL}" does not have administrator privileges.`);
      console.error("   This recovery script is strictly restricted to administrator accounts.\n");
      process.exit(1);
    }

    // Secure interactive prompt for new password
    const newPassword = await promptInput("Enter New Administrator Password (min 6 characters): ", true);
    if (!newPassword || newPassword.length < 6) {
      console.error("❌ Error: Password must be at least 6 characters long.");
      process.exit(1);
    }

    const confirmPassword = await promptInput("Confirm New Administrator Password: ", true);
    if (newPassword !== confirmPassword) {
      console.error("❌ Error: Passwords do not match. Aborting.");
      process.exit(1);
    }

    // Hash new password using project standard bcrypt (10 rounds)
    const salt = await bcrypt.genSalt(10);
    adminUser.password = await bcrypt.hash(newPassword, salt);
    adminUser.passwordChangedAt = Date.now();

    await adminUser.save();

    console.log("\n=================================================");
    console.log("✅ Administrator Password Recovered Successfully");
    console.log("=================================================");
    console.log(`- Database:          ${TARGET_DB}`);
    console.log(`- ID:                ${adminUser._id}`);
    console.log(`- Email:             ${adminUser.email}`);
    console.log(`- Role:              ${adminUser.role}`);
    console.log(`- Verified:          ${adminUser.isVerified}`);
    console.log(`- Active:            ${!adminUser.isBlocked && !adminUser.isDeleted}`);
    console.log(`- Password Changed:  ${new Date(adminUser.passwordChangedAt).toISOString()}`);
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

recoverAdmin();
