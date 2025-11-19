const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { resolve: metroResolve } = require("metro-resolver");

const config = getDefaultConfig(__dirname);

// Enable support for backend files without dropping Expo's defaults
config.resolver.alias = {
  ...(config.resolver.alias ?? {}),
  "@": __dirname,
  "react-async-hook": path.resolve(__dirname, "node_modules/react-async-hook"),
};

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules ?? {}),
  "react-async-hook": path.resolve(__dirname, "node_modules/react-async-hook"),
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "react-async-hook") {
    return {
      type: "sourceFile",
      filePath: path.resolve(
        __dirname,
        "node_modules/react-async-hook/dist/index.js"
      ),
    };
  }

  return metroResolve(context, moduleName, platform);
};

// Ensure backend files are included in the bundle
config.resolver.platforms = Array.from(
  new Set([...(config.resolver.platforms ?? []), "web"])
);

module.exports = config;
