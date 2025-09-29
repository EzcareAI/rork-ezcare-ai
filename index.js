// Main entry point for Rork deployment
// This file ensures the backend is properly accessible

try {
  // Try to import the backend app
  const { app } = require('./backend/index.ts');
  
  if (!app || typeof app.fetch !== 'function') {
    throw new Error('Invalid app export - missing fetch handler');
  }
  
  console.log('🚀 Backend loaded successfully from backend/index.ts');
  console.log('✅ App fetch handler available:', typeof app.fetch);
  
  // Export for Rork platform
  module.exports = app;
  module.exports.default = app;
  
  // For ES modules compatibility
  if (typeof exports !== 'undefined') {
    exports.default = app;
  }
  
} catch (error) {
  console.error('❌ Failed to load backend:', error);
  
  // Fallback: try direct import
  try {
    const honoApp = require('./backend/hono.ts').default;
    console.log('🔄 Fallback: loaded backend/hono.ts directly');
    
    module.exports = honoApp;
    module.exports.default = honoApp;
    
    if (typeof exports !== 'undefined') {
      exports.default = honoApp;
    }
  } catch (fallbackError) {
    console.error('❌ Fallback also failed:', fallbackError);
    throw fallbackError;
  }
}