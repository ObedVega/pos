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

    return window.electronAPI.saveDailyNotice(
      noticeText
    );
  },
};

export default dailyNoticeService;