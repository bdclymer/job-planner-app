// Job Planner Website - Server Test
// Simple test to verify server functionality

const http = require('http');

const PORT = process.env.PORT || 3000;
const HOST = 'localhost';

function testServer() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: HOST,
      port: PORT,
      path: '/health',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            console.log('✅ Server is running');
            console.log('📊 Health check response:', json);
            resolve(true);
          } catch (error) {
            console.error('❌ Failed to parse health check response');
            reject(error);
          }
        } else {
          console.error(`❌ Server returned status code: ${res.statusCode}`);
          reject(new Error(`Status code: ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Failed to connect to server:', error.message);
      reject(error);
    });

    req.on('timeout', () => {
      console.error('❌ Request timeout');
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

function testRoutes() {
  const routes = [
    { path: '/', name: 'Dashboard' },
    { path: '/projects', name: 'Projects' },
    { path: '/jobs', name: 'Jobs' },
    { path: '/schedule', name: 'Schedule' },
    { path: '/resources', name: 'Resources' },
    { path: '/api/status', name: 'API Status' }
  ];

  const tests = routes.map(route => {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: HOST,
        port: PORT,
        path: route.path,
        method: 'GET',
        timeout: 5000
      };

      const req = http.request(options, (res) => {
        if (res.statusCode === 200 || res.statusCode === 404) {
          console.log(`✅ ${route.name} route: ${res.statusCode}`);
          resolve(true);
        } else {
          console.log(`⚠️  ${route.name} route: ${res.statusCode}`);
          resolve(false);
        }
      });

      req.on('error', () => {
        console.log(`❌ ${route.name} route: Connection failed`);
        resolve(false);
      });

      req.on('timeout', () => {
        console.log(`❌ ${route.name} route: Timeout`);
        req.destroy();
        resolve(false);
      });

      req.end();
    });
  });

  return Promise.all(tests);
}

async function runTests() {
  console.log('🚀 Starting Job Planner Website tests...');
  console.log('========================================');

  try {
    // Test server health
    await testServer();
    
    // Test routes
    const routeResults = await testRoutes();
    const successfulRoutes = routeResults.filter(result => result).length;
    
    console.log('========================================');
    console.log(`📊 Test Summary:`);
    console.log(`   Health check: ✅ Passed`);
    console.log(`   Routes tested: ${routeResults.length}`);
    console.log(`   Successful routes: ${successfulRoutes}`);
    
    if (successfulRoutes === routeResults.length) {
      console.log('🎉 All tests passed!');
      process.exit(0);
    } else {
      console.log('⚠️  Some routes failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Tests failed:', error.message);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  testServer,
  testRoutes,
  runTests
};