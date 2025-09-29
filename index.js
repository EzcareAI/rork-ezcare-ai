// Rork deployment entry point
// Import the Hono app from backend
const app = require('./backend/hono.ts').default || require('./backend/hono.ts');

// Ensure we have the app
if (!app) {
  console.error('❌ Failed to import Hono app');
  process.exit(1);
}

// Export the Hono app for Rork deployment
module.exports = app;
module.exports.default = app;

// Ensure the app has a fetch handler
if (typeof app.fetch === 'function') {
  console.log('✅ Rork entry point: App fetch handler is available');
} else {
  console.error('❌ Rork entry point: App fetch handler is missing!');
}

console.log('🚀 Rork entry point loaded successfully');