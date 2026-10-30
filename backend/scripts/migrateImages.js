const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load backend environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("Error: MONGO_URI is not defined in backend/.env");
  process.exit(1);
}

async function runMigration() {
  let connection;
  try {
    console.log("Connecting to MongoDB Atlas for database migration...");
    connection = await mongoose.connect(MONGO_URI);
    console.log("Connected successfully to MongoDB Atlas!");

    // Get the dynamic Product model (disable strict schema mapping to read raw documents)
    const ProductSchema = new mongoose.Schema({}, { strict: false, collection: "products" });
    const Product = mongoose.model("ProductMigration", ProductSchema);

    const products = await Product.find({});
    console.log(`Found ${products.length} products to audit/migrate.`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const product of products) {
      const rawImages = product.get("images");

      if (!rawImages || !Array.isArray(rawImages)) {
        skippedCount++;
        continue;
      }

      // Check if the array contains strings instead of objects
      const needsMigration = rawImages.some((img) => typeof img === "string");

      if (needsMigration) {
        // Map strings to { url, public_id: "legacy" } objects
        const migratedImages = rawImages.map((img) => {
          if (typeof img === "string") {
            return {
              url: img,
              public_id: "legacy",
            };
          }
          return img; // Keep already-migrated objects intact
        });

        // Update the document in database directly using mongo driver to bypass schema locks
        await Product.updateOne(
          { _id: product._id },
          { $set: { images: migratedImages } }
        );

        console.log(`Migrated product: "${product.get("title")}" (ID: ${product._id})`);
        migratedCount++;
      } else {
        skippedCount++;
      }
    }

    console.log("\nMigration completed successfully! 🎉");
    console.log(`Total Products: ${products.length}`);
    console.log(`Migrated: ${migratedCount}`);
    console.log(`Skipped (already correct or empty): ${skippedCount}`);

  } catch (error) {
    console.error("Migration failed with error:", error.message);
  } finally {
    if (connection) {
      await mongoose.connection.close();
      console.log("Database connection closed.");
    }
    process.exit(0);
  }
}

runMigration();
