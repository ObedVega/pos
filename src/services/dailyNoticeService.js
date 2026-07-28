const dailyNoticeService = {
  async get() {
    if (!window.electronAPI?.getDailyNotice) {
      throw new Error(
        "Daily notice API is not available."
      );
    }

    return window.electronAPI.getDailyNotice();
  },

  async save(noticeText) {
    if (!window.electronAPI?.saveDailyNotice) {
      throw new Error(
        "Daily notice API is not available."
      );
    }

    const savedNotice = await window.electronAPI.saveDailyNotice(
      noticeText
    );
    window.dispatchEvent(
      new CustomEvent("daily-notice-updated", {
        detail: savedNotice,
      })
    );
    return savedNotice;
  },
};

export default dailyNoticeService;
