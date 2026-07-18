const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");

const migrateDatabase = require("../migrate");
const BaseDriver = require("./BaseDriver");

class NodeSqliteDriver extends BaseDriver {
  constructor() {
    super();

    this.db = null;
    this.dbPath = null;
  }

  async initialize(app) {
    if (this.db) {
      return this.db;
    }

    const userDataPath = app.getPath("userData");

    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }

    this.dbPath = path.join(
      userDataPath,
      "chiquita-pos.sqlite"
    );

    this.db = new DatabaseSync(this.dbPath);

    this.db.exec(`
      PRAGMA journal_mode=WAL;
      PRAGMA foreign_keys=ON;
    `);

    migrateDatabase(this.db);

    return this.db;
  }

  getDatabase() {
    if (!this.db) {
      throw new Error(
        "Database has not been initialized."
      );
    }

    return this.db;
  }

  getDatabasePath() {
    return this.dbPath;
  }

  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

    run(sql, ...params) {
    const stmt = this.getDatabase().prepare(sql);

    const result = stmt.run(...params);

    return {
      changes: result.changes,
      lastInsertRowid: result.lastInsertRowid,
    };
  }

  get(sql, ...params) {
    const stmt = this.getDatabase().prepare(sql);

    return stmt.get(...params) ?? null;
  }

  all(sql, ...params) {
    const stmt = this.getDatabase().prepare(sql);

    return stmt.all(...params);
  }

  prepare(sql) {
    const stmt = this.getDatabase().prepare(sql);

    return {
      run: (...params) => stmt.run(...params),

      get: (...params) => stmt.get(...params),

      all: (...params) => stmt.all(...params),
    };
  }

  transaction(callback) {
    return (...args) => {
      this.db.exec("BEGIN");

      try {
        const result = callback(...args);

        this.db.exec("COMMIT");

        return result;
      } catch (err) {
        this.db.exec("ROLLBACK");
        throw err;
      }
    };
  }
}

module.exports = NodeSqliteDriver;