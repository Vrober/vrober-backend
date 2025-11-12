import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import connectDB from '../db/index.db.js';
import User from '../models/user.models.js';
import Vendor from '../models/vendor.models.js';
import Service from '../models/services.models.js';

async function seed() {
  try {
    await connectDB();

    // No admin or demo user seeding per project scope

    // Create vendor
    let vendor = await Vendor.findOne({ email: 'vendor@vrober.com' });
    if (!vendor) {
      vendor = await Vendor.create({
        name: 'Prime Vendor',
        mobileNo: '9999222222',
        email: 'vendor@vrober.com',
        password: 'temp_vendor_pass',
        toolsAvailable: ['Drill', 'Vacuum', 'Brush'],
        experience: 5,
        isVerify: true
      });
      console.log('✅ Vendor created');
    }

    // Seed services across categories
    const baseServices = [
      {
        serviceName: 'Premium Home Cleaning',
        serviceType: 'cleaning',
        category: 'Cleaning',
        price: 1499,
        duration: '2 hrs',
        description: 'Deep cleaning with eco-friendly supplies.',
        isPopular: true,
        bookingCount: 42
      },
      {
        serviceName: 'Air Conditioner Repair',
        serviceType: 'repair',
        category: 'Repair',
        price: 899,
        duration: '1.5 hrs',
        description: 'Professional AC diagnostics and fix.',
        isPopular: true,
        isPremium: true,
        bookingCount: 58
      },
      {
        serviceName: 'Men Hair Grooming Deluxe',
        serviceType: 'grooming',
        category: 'Grooming',
        price: 499,
        duration: '45 mins',
        description: 'Premium grooming experience at home.',
        isPremium: true,
        bookingCount: 31
      }
    ];

    let upserted = 0;
    for (const svc of baseServices) {
      const update = {
        $set: {
          serviceType: svc.serviceType,
          category: svc.category || '',
          price: svc.price ?? 0,
          duration: svc.duration || '',
          description: svc.description || '',
          isPopular: !!svc.isPopular,
          isPremium: !!svc.isPremium,
          bookingCount: svc.bookingCount ?? 0,
          vendorId: vendor._id,
          toolsRequired: [],
        }
      };
      const res = await Service.findOneAndUpdate(
        { serviceName: svc.serviceName },
        update,
        { new: true, upsert: true }
      );
      if (res) upserted++;
    }
    console.log(`✅ Services upserted (${upserted})`);

    console.log('🎉 Seeding complete');
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seed();