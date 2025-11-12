// Quick test script to verify admin login
import fetch from 'node-fetch';

async function testAdminLogin() {
  try {
    console.log('🧪 Testing Admin Login...\n');
    
    // Step 1: Send OTP
    console.log('📤 Step 1: Sending OTP...');
    const otpResponse = await fetch('http://localhost:8000/api/v1/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber: '9999999999' })
    });
    const otpData = await otpResponse.json();
    console.log('✅ OTP Response:', otpData);
    console.log('📱 OTP Code:', otpData.data?.otp, '\n');
    
    // Step 2: Authenticate with OTP
    console.log('🔐 Step 2: Authenticating with OTP 6969...');
    const authResponse = await fetch('http://localhost:8000/api/v1/auth/authenticate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        phoneNumber: '9999999999',
        otp: '6969'
      })
    });
    
    const authData = await authResponse.json();
    console.log('✅ Auth Response:', JSON.stringify(authData, null, 2));
    
    if (authData.success) {
      console.log('\n🎉 Login successful!');
      console.log('👤 User:', authData.data.user.name);
      console.log('🔑 Role:', authData.data.user.role);
      console.log('📧 Email:', authData.data.user.email);
      console.log('🎫 Token:', authData.data.accessToken ? 'Generated ✓' : 'Missing ✗');
      
      if (authData.data.user.role === 'admin') {
        console.log('\n✅ Admin access confirmed!');
      } else {
        console.log('\n❌ Not an admin user!');
      }
    } else {
      console.log('\n❌ Login failed:', authData.message);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testAdminLogin();
