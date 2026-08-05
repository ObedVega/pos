const fs = require("fs");
const path = require("path");

// List of all migrations in order
const MIGRATIONS = [
  { version: 1, name: "initial_schema" },
  // Add new migrations here as you create them
  // { version: 2, name: "add_new_column" },
  // { version: 3, name: "add_inventory_control" },
];

/**
 * Get the current schema version from the database
 */
const getCurrentSchemaVersion = (database) => {
  try {
    const result = database.prepare(`
      SELECT value FROM app_metadata 
      WHERE key = 'schema_version'
      LIMIT 1
    `).get();
    
    return result ? Number(result.value) : 0;
  } catch (error) {
    // Table doesn't exist yet
    return 0;
  }
};

/**
 * Set the current schema version in the database
 */
const setSchemaVersion = (database, version) => {
  database.prepare(`
    INSERT OR REPLACE INTO app_metadata (key, value, updated_at)
    VALUES ('schema_version', ?, CURRENT_TIMESTAMP)
  `).run(String(version));
};

/**
 * Load and execute a migration file
 */
const executeMigration = (database, migrationPath) => {
  const sql = fs.readFileSync(migrationPath, "utf-8");
  
  // Split by semicolons and filter empty statements
  const statements = sql
    .split(";")
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0);
  
  // Execute each statement
  for (const statement of statements) {
    try {
      database.exec(statement);
    } catch (error) {
      console.error(`Error executing migration statement: ${error.message}`);
      throw error;
    }
  }
};

/**
 * Run pending migrations
 */
const migrateDatabase = (database) => {
  if (!database) {
    throw new Error("A database connection is required.");
  }

  try {
    // Ensure app_metadata table exists (bootstrap)
    database.exec(`
      CREATE TABLE IF NOT EXISTS app_metadata (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const currentVersion = getCurrentSchemaVersion(database);
    console.log(`📊 Current schema version: ${currentVersion}`);

    // Find pending migrations
    const pendingMigrations = MIGRATIONS.filter(
      m => m.version > currentVersion
    );

    if (pendingMigrations.length === 0) {
      console.log("✅ Database schema is up to date");
      return;
    }

    console.log(
      `⏳ Found ${pendingMigrations.length} pending migration(s)`
    );

    // Execute each pending migration in order
    for (const migration of pendingMigrations) {
      console.log(
        `\n🔄 Running migration ${migration.version}: ${migration.name}`
      );

      const migrationPath = path.join(
        __dirname,
        "migrations",
        `${migration.version}_${migration.name}.sql`
      );

      if (!fs.existsSync(migrationPath)) {
        throw new Error(`Migration file not found: ${migrationPath}`);
      }

      executeMigration(database, migrationPath);
      setSchemaVersion(database, migration.version);

      console.log(
        `✅ Migration ${migration.version} completed successfully`
      );
    }

    console.log("\n✅ All migrations completed successfully");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw new Error(`Database migration failed: ${error.message}`);
  }
};

module.exports = migrateDatabase;
