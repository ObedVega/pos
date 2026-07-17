import businessSettingsData from "../data/businessSettings";

let currentSettings = {
  ...businessSettingsData,
};

const businessSettingsService = {
  async get() {
    return {
      ...currentSettings,
    };
  },

  async selectLogo() {
    if (!window.electronAPI?.selectBusinessLogo) {
      throw new Error(
        "The logo selector is not available."
      );
    }

    const selectedLogo =
      await window.electronAPI.selectBusinessLogo();

    if (!selectedLogo) {
      return null;
    }

    currentSettings = {
      ...currentSettings,
      logoPath: selectedLogo.path,
      logoUrl: selectedLogo.url,
      updatedAt: new Date().toISOString(),
    };

    return {
      ...currentSettings,
    };
  },

  async save(settings) {
    currentSettings = {
      ...currentSettings,
      ...settings,
      updatedAt: new Date().toISOString(),
    };

    return {
      ...currentSettings,
    };
  },
};

export default businessSettingsService;