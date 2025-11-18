// Simple booking check and creation script
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import models
import User from './src/models/user.models.js';
import Vendor from './src/models/vendor.models.js';
import Service from './src/models/services.models.js';
import Booking from './src/models/booking.models.js';

async function checkAndCreateBookings() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/vrober');
        console.log('✅ Connected to MongoDB');

        // Check existing data
        const userCount = await User.countDocuments();
        const vendorCount = await Vendor.countDocuments();
        const serviceCount = await Service.countDocuments();
        const bookingCount = await Booking.countDocuments();

        console.log(`📊 Database status:`);
        console.log(`   Users: ${userCount}`);
        console.log(`   Vendors: ${vendorCount}`);
        console.log(`   Services: ${serviceCount}`);
        console.log(`   Bookings: ${bookingCount}`);

        if (bookingCount > 0) {
            console.log('✅ Bookings exist! Checking first booking...');
            const booking = await Booking.findOne()
                .populate('userId', 'name email mobileNo')
                .populate('vendorId', 'name email mobileNo')
                .populate('serviceId', 'serviceName price');
            
            console.log('📋 Sample booking data:');
            console.log('   User:', booking.userId?.name || 'N/A');
            console.log('   Vendor:', booking.vendorId?.name || 'N/A'); 
            console.log('   Service:', booking.serviceId?.serviceName || 'N/A');
            console.log('   Status:', booking.status);
            
            await mongoose.disconnect();
            return;
        }

        // Create test users if none exist
        if (userCount === 0) {
            console.log('🏗️ Creating test users...');
            await User.create([
                {
                    name: 'John Doe',
                    mobileNo: '9876543210',
                    email: 'john@example.com',
                    password: 'password123',
                    role: 'user'
                },
                {
                    name: 'Jane Smith',
                    mobileNo: '9876543211',
                    email: 'jane@example.com',
                    password: 'password123',
                    role: 'user'
                }
            ]);
            console.log('✅ Test users created');
        }

        // Create test vendors if none exist
        if (vendorCount === 0) {
            console.log('🏗️ Creating test vendors...');
            await Vendor.create([
                {
                    name: 'Best Beauty Salon',
                    mobileNo: '9999999999',
                    email: 'salon@vrober.com',
                    password: 'password123',
                    address: 'Beauty Center, Main Street',
                    role: 'vendor',
                    isVerify: true
                },
                {
                    name: 'Pro Service Provider',
                    mobileNo: '8888888888',
                    email: 'provider@vrober.com',
                    password: 'password123',
                    address: 'Service Hub, City Center',
                    role: 'vendor',
                    isVerify: true
                }
            ]);
            console.log('✅ Test vendors created');
        }

        // Now create test bookings
        console.log('🏗️ Creating test bookings...');
        const users = await User.find().limit(2);
        const vendors = await Vendor.find().limit(2);
        const services = await Service.find().limit(3);

        if (services.length === 0) {
            console.log('❌ No services found. Creating a test service...');
            const testService = await Service.create({
                serviceName: 'Test Cleaning Service',
                vendorId: vendors[0]._id,
                serviceType: 'cleaning',
                category: 'Cleaning',
                price: 500,
                duration: '1 hour',
                description: 'Basic cleaning service for testing'
            });
            services.push(testService);
            console.log('✅ Test service created');
        }

        const bookings = [];
        for (let i = 0; i < 5; i++) {
            const user = users[i % users.length];
            const vendor = vendors[i % vendors.length];
            const service = services[i % services.length];
            
            bookings.push({
                userId: user._id,
                vendorId: vendor._id,
                serviceId: service._id,
                bookingDate: new Date(Date.now() - i * 24 * 60 * 60 * 1000), // Past dates
                serviceDate: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000), // Future dates
                serviceTime: ['9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM', '6:00 PM'][i],
                address: `${123 + i} Test Street, Test City`,
                price: service.price || (500 + i * 100),
                status: ['pending', 'confirmed', 'in-progress', 'completed', 'assigned'][i],
                paymentMethod: 'cash',
                description: `Test booking ${i + 1} for ${service.serviceName}`
            });
        }

        await Booking.insertMany(bookings);
        console.log(`✅ Created ${bookings.length} test bookings!`);
        console.log('\n🎯 Admin panel should now show bookings at http://localhost:3001/bookings');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

checkAndCreateBookings();