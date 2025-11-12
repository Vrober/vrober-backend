import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import connectDB from '../db/index.db.js';
import User from '../models/user.models.js';

async function seedAdmin() {
  try {
    await connectDB();

    // Check if admin exists
    let admin = await User.findOne({ mobileNo: '9999999999' });
    
    if (!admin) {
      admin = await User.create({
        name: 'Admin User',
        mobileNo: '9999999999',
        email: 'admin@vrober.com',
        password: 'admin123', // This will be hashed by the model pre-save hook
        role: 'admin'
      });
      console.log('✅ Admin user created');
      console.log('📱 Phone: 9999999999');
      console.log('🔐 OTP (dev): 6969');
      console.log('👤 Role: admin');
    } else {
      // Update role to admin if not already
      if (admin.role !== 'admin') {
        admin.role = 'admin';
        await admin.save();
        console.log('✅ User updated to admin role');
      } else {
        console.log('ℹ️  Admin user already exists');
      }
      console.log('📱 Phone: 9999999999');
      console.log('🔐 OTP (dev): 6969');
      console.log('👤 Role:', admin.role);
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed admin error:', err);
    process.exit(1);
  }
}

seedAdmin();
