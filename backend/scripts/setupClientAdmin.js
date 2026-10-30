// backend/scripts/setupClientAdmin.js
/**
 * Secure Administrator Provisioning Script
 * 
 * Safely provisions a dedicated administrator in srk_handloom_staging.
 * Reuses existing project bcrypt (10 rounds) and Mongoose User model.
 * 
 * Security Policy:
 * 1. Strictly prohibits passing passwords via command-line arguments.
 * 2. Prompts for password interactively via stdin with confirmation.
 * 3. Prohibits modifying or promoting existing regular users.
 * 4. Sets role: "admin", isVerified: true, isBlocked: false, isDeleted: false.
 * 5. Never prints passwords, hashes, tokens, database URIs, or secrets.
 * 
 * Usage:
 *   node scripts/setupClientAdmin.js --email="admin@example.com" --name="SRK Admin"
 * Or run interactively:
 *   node scripts/setupClientAdmin.js
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

const setupAdmin = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("❌ ABORT: MONGO_URI is not configured in backend/.env.");
    process.exit(1);
  }

  const cliArgs = parseArgs();

  // Guard: Prohibit passwords passed in command line arguments (process list & history leakage prevention)
  if (cliArgs.password) {
    console.error("\n❌ Security Policy Violation: Passing passwords via CLI arguments is strictly prohibited.");
    console.error("   Passwords in command-line arguments are exposed to process lists and shell history.");
    console.error("   Please run without the --password flag to use the secure interactive password prompt.\n");
    process.exit(1);
  }

  let email = cliArgs.email || process.env.ADMIN_EMAIL;
  let name = cliArgs.name || process.env.ADMIN_NAME || "SRK Admin";

  console.log("=================================================================");
  console.log("SRK Handloom — Secure Administrator Provisioning Tool");
  console.log("Database Target: srk_handloom_staging");
  console.log("=================================================================");

  // Prompt interactively for email if missing and in terminal
  if (!email) {
    email = await promptInput("Enter Administrator Email: ");
  }

  if (!email) {
    console.error("❌ Error: Administrator email is required.");
    console.error('Usage: node scripts/setupClientAdmin.js --email="admin@example.com" --name="SRK Admin"');
    process.exit(1);
  }

  const cleanEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    console.error("❌ Error: Invalid email address format.");
    process.exit(1);
  }

  // Prompt for password interactively via stdin
  const password = await promptInput("Enter Administrator Password (min 6 characters): ", true);
  if (!password || password.length < 6) {
    console.error("❌ Error: Password must be at least 6 characters long.");
    process.exit(1);
  }

  const confirmPassword = await promptInput("Confirm Administrator Password: ", true);
  if (password !== confirmPassword) {
    console.error("❌ Error: Passwords do not match. Aborting.");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);

    // Guard: Do not modify or promote existing regular users
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      console.error(`\n❌ Security Policy: An account for "${cleanEmail}" already exists in the database.`);
      console.error("   Modifying or promoting existing regular user accounts is strictly prohibited.");
      console.error("   Please specify a dedicated administrator email address.\n");
      process.exit(1);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = await User.create({
      name: name || "SRK Admin",
      email: cleanEmail,
      password: hashedPassword,
      role: "admin",
      isVerified: true,
      isBlocked: false,
      isDeleted: false,
    });

    console.log("\n=================================================");
    console.log("✅ Dedicated Administrator Provisioned Successfully");
    console.log("=================================================");
    console.log(`- ID:       ${newAdmin._id}`);
    console.log(`- Email:    ${newAdmin.email}`);
    console.log(`- Name:     ${newAdmin.name}`);
    console.log(`- Role:     ${newAdmin.role}`);
    console.log(`- Verified: ${newAdmin.isVerified}`);
    console.log(`- Active:   ${!newAdmin.isBlocked && !newAdmin.isDeleted}`);
    console.log("=================================================");
    console.log("You can now log in to the Admin Portal at port 5174.\n");
  } catch (error) {
    console.error(`\n❌ Execution error: ${error.message}`);
    process.exitCode = 1;
  } finally {
    if (sharedRl) sharedRl.close();
    await mongoose.disconnect();
  }
};

setupAdmin();
