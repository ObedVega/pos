import dailyNoticeData from "../data/dailyNotice";

let currentDailyNotice = {
  ...dailyNoticeData,
};

const dailyNoticeService = {
  async get() {
    return {
      ...currentDailyNotice,
    };
  },

  async save(noticeText) {
    const normalizedNotice = String(
      noticeText ?? ""
    ).trim();

    currentDailyNotice = {
      ...currentDailyNotice,
      notice: normalizedNotice,
      updatedAt: new Date().toISOString(),
    };

    return {
      ...currentDailyNotice,
    };
  },
};

export default dailyNoticeService;