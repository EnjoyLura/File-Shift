const { execSync } = require('child_process');

const ssh = (cmd) => {
  return execSync(`ssh -o StrictHostKeyChecking=no ubuntu@122.51.235.145 ${JSON.stringify(cmd)}`, {
    encoding: 'utf8',
    timeout: 30000,
  }).trim();
};

// Step 1: Login and get token
const loginResult = ssh(`printf '{"email":"flowtest@example.com","password":"Test123456!"}' | curl -s -X POST http://localhost:3001/api/v1/auth/login -H 'Content-Type: application/json' -d @-`);
console.log('Login:', loginResult);

const loginData = JSON.parse(loginResult);
const token = loginData.data.accessToken;
console.log('Token:', token ? token.substring(0, 20) + '...' : 'NONE');

// Step 2: GET profile with token
const getProfile = ssh(`curl -s -H 'Authorization: Bearer ${token}' http://localhost:3001/api/v1/user/profile`);
console.log('GET profile:', getProfile);

// Step 3: PATCH profile with token
const patchProfile = ssh(`printf '{"nickname":"CurlTest"}' | curl -s -X PATCH -H 'Authorization: Bearer ${token}' -H 'Content-Type: application/json' -d @- http://localhost:3001/api/v1/user/profile`);
console.log('PATCH profile:', patchProfile);

// Step 4: Test PATCH via Nginx (port 80)
const patchViaNginx = ssh(`printf '{"nickname":"NginxTest"}' | curl -s -X PATCH -H 'Authorization: Bearer ${token}' -H 'Content-Type: application/json' -d @- http://localhost/api/v1/user/profile`);
console.log('PATCH via Nginx:', patchViaNginx);
