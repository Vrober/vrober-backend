import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import connectDB from '../db/index.db.js';
import User from '../models/user.models.js';
import Service from '../models/services.models.js';

async function cleanup() {
  try {
    await connectDB();

    // Remove unnecessary seeded users (admin/demo)
    const userResult = await User.deleteMany({
      email: { $in: ['admin@vrober.com', 'demo@vrober.com'] },
    });

  // Keep only curated demo services we seed
  const keepNames = ['Premium Home Cleaning', 'Air Conditioner Repair', 'Men Hair Grooming Deluxe'];
    const svcResult = await Service.deleteMany({
      serviceName: { $nin: keepNames },
    });

    console.log(
      `🧹 Cleanup complete: users deleted=${userResult.deletedCount}, extra services deleted=${svcResult.deletedCount}`
    );

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Cleanup error:', err);
    process.exit(1);
  }
}

cleanup();