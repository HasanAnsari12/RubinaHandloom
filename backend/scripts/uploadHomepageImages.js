/**
 * One-off script to upload the two homepage hero images to Cloudinary.
 * Run: node scripts/uploadHomepageImages.js
 */
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const images = [
  {
    localPath: "C:\\Users\\ansar\\.gemini\\antigravity-ide\\brain\\88e5dd36-888f-48b2-96a1-6d34409b508e\\media__1793359248807.png",
    folder: "srk-handloom/homepage",
    filename: "hero-blue-chanderi-saree",
    label: "Hero Blue Chanderi Saree (Image 1)",
  },
  {
    localPath: "C:\\Users\\ansar\\.gemini\\antigravity-ide\\brain\\88e5dd36-888f-48b2-96a1-6d34409b508e\\media__1793359265204.jpg",
    folder: "srk-handloom/homepage",
    filename: "bridal-red-saree-pallu",
    label: "Bridal Red Saree Pallu (Image 2)",
  },
];

async function upload() {
  for (const img of images) {
    console.log(`\nUploading: ${img.label}`);
    console.log(`  Source: ${img.localPath}`);

    if (!fs.existsSync(img.localPath)) {
      console.error(`  ERROR: File not found at ${img.localPath}`);
      continue;
    }

    try {
      const result = await cloudinary.uploader.upload(img.localPath, {
        folder: img.folder,
        public_id: img.filename,
        overwrite: true,
        secure: true,
        resource_type: "image",
        quality: "auto",
        fetch_format: "auto",
      });

      console.log(`  SUCCESS!`);
      console.log(`  URL: ${result.secure_url}`);
      console.log(`  Public ID: ${result.public_id}`);
      console.log(`  Dimensions: ${result.width}x${result.height}`);
    } catch (err) {
      console.error(`  FAILED: ${err.message}`);
      if (err.http_code) console.error(`  HTTP Code: ${err.http_code}`);
      if (err.error) console.error(`  Error detail:`, JSON.stringify(err.error));
    }
  }
}

upload().then(() => {
  console.log("\nDone.");
});
