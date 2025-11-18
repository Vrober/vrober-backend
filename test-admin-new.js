// Test new admin authentication flow

async function testAdminAuth() {
  try {
    console.log('🔍 Testing new admin authentication...\n');

    // Test admin login
    const loginResponse = await fetch('http://localhost:8000/api/v1/auth/admin-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: '9999999999',
        otp: '123456'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status} ${loginResponse.statusText}`);
    }

    const loginData = await loginResponse.json();
    console.log('✅ Admin login response:', JSON.stringify(loginData, null, 2));

    if (loginData.success && loginData.data.token) {
      const token = loginData.data.token;
      console.log('\n🔑 Admin token received:', token.substring(0, 50) + '...');

      // Test admin bookings API
      const bookingsResponse = await fetch('http://localhost:8000/api/v1/admin/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!bookingsResponse.ok) {
        throw new Error(`Bookings API failed: ${bookingsResponse.status} ${bookingsResponse.statusText}`);
      }

      const bookingsData = await bookingsResponse.json();
      console.log('\n📊 Admin bookings response:', JSON.stringify(bookingsData, null, 2));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAdminAuth();