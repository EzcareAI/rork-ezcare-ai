import app from './hono';

// Re-export the app for deployment compatibility
export default app;
export { app };

// For CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = app;
  module.exports.default = app;
}

// For Rork deployment - ensure the app is properly exported
console.log('🚀 Backend index.ts loaded, app exported:', typeof app);

// Handle Rork deployment entry point
if (typeof globalThis !== 'undefined') {
  (globalThis as any).app = app;
}

// Ensure fetch handler is available
if (typeof app.fetch === 'function') {
  console.log('✅ App fetch handler is available');
} else {
  console.error('❌ App fetch handler is missing!');
}