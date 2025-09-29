import app from './hono';

// Re-export the app for deployment compatibility
export default app;
export { app };

// For CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = app;
  module.exports.default = app;
}