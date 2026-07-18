const schemaSql = require("./schema.sql");

const migrateDatabase = (database) => {
  if (!database) {
    throw new Error(
      "A database connection is required."
    );
  }

  database.exec(schemaSql);
};

module.exports = migrateDatabase;