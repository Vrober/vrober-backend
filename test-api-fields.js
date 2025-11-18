// Test API response structure to verify field mappings

async function testAPIStructure() {
  try {
    console.log('🔍 Testing API field structure...\n');

    // Login to get admin token
    const loginResponse = await fetch('http://localhost:8000/api/admin/auth/admin-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: '9999999999',
        otp: '123456'
      })
    });

    const loginData = await loginResponse.json();
    const token = loginData.data.token;
    console.log('✅ Login successful');

    // Get bookings with admin token
    const bookingsResponse = await fetch('http://localhost:8000/api/admin/bookings', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const bookingsData = await bookingsResponse.json();
    const bookings = bookingsData.data;
    console.log(`📊 Total bookings: ${bookings.length}\n`);

    if (bookings.length > 0) {
      const booking = bookings[0];
      console.log('🏗️ Booking Structure Analysis:');
      console.log('================================');
      
      // Check booking fields
      console.log('📋 Booking ID:', booking._id);
      console.log('📅 Date:', booking.bookingDate);
      console.log('🏷️ Status:', booking.status);
      console.log('💰 Total:', booking.totalAmount);
      
      // Check user fields
      console.log('\n👤 User Structure:');
      if (booking.userId) {
        console.log('- Field name: userId (✅)');
        console.log('- User name:', booking.userId.name);
        console.log('- User email:', booking.userId.email);
        console.log('- User mobile:', booking.userId.mobileNo);
      } else if (booking.user) {
        console.log('- Field name: user');
      } else {
        console.log('- No user data found');
      }
      
      // Check vendor fields
      console.log('\n🔧 Vendor Structure:');
      if (booking.vendorId) {
        console.log('- Field name: vendorId (✅)');
        if (booking.vendorId) {
          console.log('- Vendor name:', booking.vendorId.name);
          console.log('- Vendor mobile:', booking.vendorId.mobileNo);
          console.log('- Vendor verified:', booking.vendorId.isVerify);
        } else {
          console.log('- No vendor assigned');
        }
      } else if (booking.vendor) {
        console.log('- Field name: vendor');
      } else {
        console.log('- No vendor data found');
      }
      
      // Check service fields
      console.log('\n🛠️ Service Structure:');
      if (booking.serviceId) {
        console.log('- Field name: serviceId (✅)');
        if (booking.serviceId.serviceName) {
          console.log('- Service name:', booking.serviceId.serviceName);
          console.log('- Service type:', booking.serviceId.serviceType);
          console.log('- Service category:', booking.serviceId.category);
        } else {
          console.log('- Service not populated');
        }
      } else if (booking.service) {
        console.log('- Field name: service');
      } else {
        console.log('- No service data found');
      }

      console.log('\n📝 Full booking object keys:', Object.keys(booking));
      
    } else {
      console.log('❌ No bookings found');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('Unexpected token')) {
      console.log('\n💡 Tip: Backend might be returning HTML error page instead of JSON');
      console.log('   Check if backend is running on port 8000');
    }
  }
}

testAPIStructure();