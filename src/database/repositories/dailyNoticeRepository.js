const database = require("../database");

const mapDailyNoticeRow = (row) => {
  if (!row) {
    return {
      id: 1,
      notice: "",
      updatedAt: null,
    };
  }

  return {
    id: Number(row.id),
    notice: row.notice ?? "",
    updatedAt: row.updated_at,
  };
};

const dailyNoticeRepository = {
  get() {
    const row = database.get(`
      SELECT
        id,
        notice,
        updated_at
      FROM daily_notice
      WHERE id = 1
    `);

    return mapDailyNoticeRow(row);
  },

  save(noticeText) {
    const notice = String(noticeText ?? "").trim();

    database.run(
      `
      INSERT INTO daily_notice (
        id,
        notice,
        updated_at
      )
      VALUES (
        1,
        ?,
        CURRENT_TIMESTAMP
      )
      ON CONFLICT(id)
      DO UPDATE SET
        notice = excluded.notice,
        updated_at = CURRENT_TIMESTAMP
      `,
      notice
    );

    return this.get();
  },

  seed(seedNotice) {
    if (!seedNotice) {
      return;
    }

    database.run(
      `
      INSERT OR IGNORE INTO daily_notice (
        id,
        notice
      )
      VALUES (?, ?)
      `,
      1,
      String(seedNotice.notice ?? "")
    );
  },
};

module.exports = dailyNoticeRepository;