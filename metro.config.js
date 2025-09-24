const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable support for backend files
config.resolver.alias = {
'@': __dirname,
};

// Ensure backend files are included in the bundle
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;
