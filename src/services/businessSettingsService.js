import businessSettingsData from "../data/businessSettings";

const getAPI = () => {
  if (!window.electronAPI?.getBusinessSettings) {
    throw new Error("Business settings API is not available.");
  }
  return window.electronAPI;
};

const mergeWithDefaults = (settings) => ({
  ...businessSettingsData,
  ...(settings || {}),
});

const businessSettingsService = {
  async get() {
    return mergeWithDefaults(await getAPI().getBusinessSettings());
  },

  async selectLogo() {
    const selectedLogo = await getAPI().selectBusinessLogo();
    if (!selectedLogo) return null;
    return { logoPath: selectedLogo.path, logoUrl: selectedLogo.url };
  },

  async save(settings) {
    const savedSettings = mergeWithDefaults(
      await getAPI().saveBusinessSettings(settings)
    );
    window.dispatchEvent(
      new CustomEvent("business-settings-updated", {
        detail: savedSettings,
      })
    );
    return savedSettings;
  },
};

export default businessSettingsService;
