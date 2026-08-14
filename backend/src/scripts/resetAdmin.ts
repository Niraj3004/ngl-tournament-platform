/**
 * Admin Reset Script
 * ------------------
 * Yeh script admin@gmail.com ka password reset karke
 * MongoDB mein upsert karti hai (create or update).
 *
 * Run: npx tsx src/scripts/resetAdmin.ts
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ngl-tournament';

const ADMIN_EMAIL    = 'admin@gmail.com';
const ADMIN_PASSWORD = 'admin@123';
const ADMIN_NAME     = 'Admin';

async function resetAdmin() {
  console.log('🔌 Connecting to MongoDB:', MONGO_URI);
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Inline schema so we don't import the compiled model
  const UserSchema = new mongoose.Schema(
    {
      uid:               { type: String, required: true, unique: true },
      email:             { type: String, required: true, unique: true },
      password:          { type: String },
      displayName:       { type: String },
      role:              { type: String, enum: ['player', 'admin'], default: 'player' },
      status:            { type: String, enum: ['active', 'blocked'], default: 'active' },
      eligibilityStatus: { type: String, enum: ['pending', 'eligible', 'ineligible'], default: 'pending' },
      ageVerified:       { type: Boolean, default: false },
      kycStatus:         { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'none' },
      referralCode:      { type: String, unique: true, sparse: true },
    },
    { timestamps: true }
  );

  // Use existing model if already registered (avoids OverwriteModelError)
  const User = mongoose.models.User || mongoose.model('User', UserSchema);

  const salt           = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

  const existing = await User.findOne({ email: ADMIN_EMAIL });

  if (existing) {
    // Update existing user → set role=admin and reset password
    existing.password    = hashedPassword;
    existing.role        = 'admin';
    existing.status      = 'active';
    existing.displayName = existing.displayName || ADMIN_NAME;
    await existing.save();
    console.log(`\n✅ Admin password reset successfully!`);
    console.log(`   Email : ${ADMIN_EMAIL}`);
    console.log(`   Pass  : ${ADMIN_PASSWORD}`);
    console.log(`   Role  : admin\n`);
  } else {
    // Create brand-new admin user
    await User.create({
      uid:               uuidv4(),
      email:             ADMIN_EMAIL,
      password:          hashedPassword,
      displayName:       ADMIN_NAME,
      role:              'admin',
      status:            'active',
      eligibilityStatus: 'eligible',
      ageVerified:       true,
      kycStatus:         'approved',
    });
    console.log(`\n✅ New admin user created!`);
    console.log(`   Email : ${ADMIN_EMAIL}`);
    console.log(`   Pass  : ${ADMIN_PASSWORD}`);
    console.log(`   Role  : admin\n`);
  }

  await mongoose.disconnect();
  console.log('🔌 Disconnected from MongoDB. Done!');
}

resetAdmin().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
