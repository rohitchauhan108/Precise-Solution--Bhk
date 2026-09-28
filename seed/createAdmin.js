// Creates (or updates the password of) the single admin account,
// using ADMIN_EMAIL / ADMIN_PASSWORD from your .env file.
//
// Run with:  npm run seed:admin

require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Admin = require("../models/Admin");

const run = async () => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD in your .env file first.");
    process.exit(1);
  }

  await connectDB();

  let admin = await Admin.findOne({ email: email.toLowerCase().trim() });

  if (admin) {
    admin.password = password; // pre-save hook re-hashes it
    await admin.save();
    console.log(`Existing admin "${email}" password updated.`);
  } else {
    admin = await Admin.create({ email: email.toLowerCase().trim(), password });
    console.log(`Admin account created for "${email}".`);
  }

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((error) => {
  console.error("Failed to seed admin:", error);
  process.exit(1);
});
