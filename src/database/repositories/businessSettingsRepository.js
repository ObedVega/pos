const database = require("../database");

const get = () => {
  const row = database.get(
    "SELECT settings_json, updated_at FROM business_settings WHERE id = 1"
  );
  if (!row) return { updatedAt: null };

  try {
    return { ...JSON.parse(row.settings_json || "{}"), updatedAt: row.updated_at };
  } catch (_) {
    return { updatedAt: row.updated_at };
  }
};

const save = (settings) => {
  const safeSettings = { ...settings };
  delete safeSettings.id;
  delete safeSettings.updatedAt;
  database.run(
    `INSERT INTO business_settings (id, settings_json, updated_at)
     VALUES (1, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(id) DO UPDATE SET
       settings_json = excluded.settings_json,
       updated_at = CURRENT_TIMESTAMP`,
    JSON.stringify(safeSettings)
  );
  return get();
};

module.exports = { get, save };
