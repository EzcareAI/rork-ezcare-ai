// Simple test to verify backend structure
console.log('🧪 Testing backend structure...');

try {
  // Test 1: Import backend/hono.ts
  console.log('📦 Testing backend/hono.ts import...');
  const honoApp = require('./backend/hono.ts');
  console.log('✅ backend/hono.ts imported successfully');
  console.log('📋 Hono app type:', typeof honoApp.default);
  console.log('📋 Has fetch method:', typeof honoApp.default?.fetch);
  
  // Test 2: Import backend/index.ts
  console.log('📦 Testing backend/index.ts import...');
  const indexApp = require('./backend/index.ts');
  console.log('✅ backend/index.ts imported successfully');
  console.log('📋 Index app type:', typeof indexApp.default);
  console.log('📋 Has fetch method:', typeof indexApp.default?.fetch);
  
  // Test 3: Test root index.js
  console.log('📦 Testing root index.js import...');
  const rootApp = require('./index.js');
  console.log('✅ Root index.js imported successfully');
  console.log('📋 Root app type:', typeof rootApp);
  console.log('📋 Has fetch method:', typeof rootApp?.fetch);
  
  console.log('🎉 All backend structure tests passed!');
  
} catch (error) {
  console.error('❌ Backend structure test failed:', error);
  console.error('📋 Error details:', error.message);
  console.error('📋 Stack trace:', error.stack);
}