// migrateLocalToAtlas.js
// One-off script: copies every collection from your local MongoDB database
// into your Atlas database, using the native MongoDB driver (via mongoose connections).

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const LOCAL_URI = "mongodb://127.0.0.1:27017/test2"; // your local database
const ATLAS_URI = process.env.MONGOOSE_URL; // reads your Atlas URI from .env

const run = async () => {
  const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
  console.log("Connected to LOCAL database ✅");

  const atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
  console.log("Connected to ATLAS database ✅");

  try {
    // Get list of all collections in the local database
    const collections = await localConn.db.listCollections().toArray();
    console.log(`Found ${collections.length} collections: ${collections.map(c => c.name).join(", ")}`);

    for (const { name } of collections) {
      const localCollection = localConn.db.collection(name);
      const atlasCollection = atlasConn.db.collection(name);

      const docs = await localCollection.find({}).toArray();

      if (docs.length === 0) {
        console.log(`⚠️  Skipping "${name}" — empty collection.`);
        continue;
      }

      // insertMany with ordered:false so one bad doc doesn't stop the rest
      try {
        const result = await atlasCollection.insertMany(docs, { ordered: false });
        console.log(`✅ Migrated "${name}": ${result.insertedCount} documents.`);
      } catch (bulkError) {
        // Duplicate key errors (E11000) mean some docs already exist in Atlas —
        // that's fine on a re-run, just report what actually got inserted vs skipped.
        const inserted = bulkError.result?.insertedCount ?? 0;
        const writeErrors = bulkError.writeErrors || [];
        const duplicates = writeErrors.filter((e) => e.code === 11000).length;
        const otherErrors = writeErrors.length - duplicates;

        console.log(
          `⚠️  "${name}": ${inserted} inserted, ${duplicates} already existed (skipped)` +
            (otherErrors > 0 ? `, ${otherErrors} other errors` : "")
        );

        if (otherErrors > 0) {
          writeErrors
            .filter((e) => e.code !== 11000)
            .forEach((e) => console.log(`   ❌ ${e.errmsg}`));
        }
      }
    }

    console.log("\nMigration complete 🎉");
  } catch (error) {
    console.error("Migration error:", error.message);
  } finally {
    await localConn.close();
    await atlasConn.close();
    process.exit(0);
  }
};

run();