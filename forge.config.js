const { FusesPlugin } = require("@electron-forge/plugin-fuses");
const { FuseV1Options, FuseVersion } = require("@electron/fuses");
const fs = require("node:fs");
const path = require("node:path");

// WiX may be installed correctly without its bin directory being present in
// PATH (for example, when compiling from a terminal opened before install).
// Ensure Forge can always find candle.exe and light.exe on Windows.
if (process.platform === "win32") {
  const wixBinDirectories = [
    "C:\\Program Files (x86)\\WiX Toolset v3.14\\bin",
    "C:\\Program Files (x86)\\WiX Toolset v3.11\\bin",
  ];
  const wixBinDirectory = wixBinDirectories.find((directory) =>
    fs.existsSync(path.join(directory, "candle.exe"))
  );

  if (wixBinDirectory) {
    const pathDirectories = (process.env.PATH || "").split(path.delimiter);
    if (!pathDirectories.includes(wixBinDirectory)) {
      process.env.PATH = `${wixBinDirectory}${path.delimiter}${process.env.PATH || ""}`;
    }
  }
}

module.exports = {
  packagerConfig: {
    asar: true,
    icon: "./assets/favicon",
  },

  rebuildConfig: {},

  makers: [
    {
      name: "@electron-forge/maker-wix",
      config: {
        language: 1033,
        manufacturer: "POS Chiquita",
        // Keep this UUID unchanged between releases so Windows treats each
        // newer MSI as an upgrade instead of installing another application.
        upgradeCode: "263D640E-A2DA-464C-A96A-E1ED05EDA6CD",
        ui: {
          chooseDirectory: true,
        },
      },
    },
    {
      name: "@electron-forge/maker-dmg",
      config: {
        format: "ULFO",
        icon: "./assets/icon.icns",
      },
    },
    {
      name: "@electron-forge/maker-deb",
      config: {},
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {},
    },
  ],

  plugins: [
    {
      name: "@electron-forge/plugin-webpack",
      config: {
        mainConfig: "./webpack.main.config.js",

        renderer: {
          config: "./webpack.renderer.config.js",

          entryPoints: [
            {
              html: "./src/index.html",
              js: "./src/renderer.js",
              name: "main_window",
               preload: {
                js: "./src/preload.js",
              },
            },
          ],
        },
      },
    },
    {
      name:
        "@electron-forge/plugin-auto-unpack-natives",
      config: {},
    },

    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};
