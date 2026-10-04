const http = require('http');

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch(e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function main() {
  console.log('1. Logging in to backend...');
  const loginPayload = JSON.stringify({ username: 'admin', password: 'admin123' });
  const loginRes = await makeRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginPayload)
    }
  }, loginPayload);

  console.log('Login status:', loginRes.status);
  const token = loginRes.body?.data?.token;
  if (!token) {
    console.error('Failed to get token:', loginRes.body);
    return;
  }
  console.log('Token acquired successfully.');

  console.log('\n2. Fetching /api/reports/dashboard...');
  const dashRes = await makeRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/reports/dashboard',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('Dashboard Data:', JSON.stringify(dashRes.body, null, 2));

  console.log('\n3. Fetching /api/vendors...');
  const vendorRes = await makeRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/vendors',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('Vendors Count:', vendorRes.body?.data?.length);
  console.log('Vendors Data:', JSON.stringify(vendorRes.body?.data, null, 2));
}

main().catch(console.error);
