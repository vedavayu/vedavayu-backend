// CORS Health Check Script
// Run this to verify CORS configuration is working correctly

async function checkCorsConfig() {
  const baseUrl = 'https://vedavayu-backend.onrender.com';
  const endpoints = [
    '/api/health',
    '/api/auth/login',
    '/api/services',
    '/api/doctors',
    '/api/banners',
    '/api/gallery',
    '/api/partners',
    '/api/statistics',
    '/api/about'
  ];
  
  console.log('Testing CORS configuration for Vedavayu API...');
  console.log('=============================================');
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing endpoint: ${endpoint}`);
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'https://vedavayu.vercel.app',
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });
      
      console.log(`Status: ${response.status}`);
      console.log('Headers:');
      for (const [key, value] of response.headers.entries()) {
        if (key.toLowerCase().includes('access-control')) {
          console.log(`  ${key}: ${value}`);
        }
      }
      
      if (response.status === 204 || response.status === 200) {
        console.log('✅ CORS is properly configured for this endpoint');
      } else {
        console.log('❌ CORS might not be properly configured for this endpoint');
      }
    } catch (error) {
      console.error(`❌ Error testing ${endpoint}:`, error.message);
    }
    console.log('---------------------------------------------');
  }
  
  console.log('CORS test complete.');
  console.log('If some endpoints failed, please check the server configuration.');
  console.log('Remember to deploy your changes to the server before expecting them to take effect.');
}

checkCorsConfig();
