// SQL schemas embedded as strings to work with webpack bundling
const INITIAL_SCHEMA = `
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  upc TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  price REAL NOT NULL DEFAULT 0.00,
  stock INTEGER NOT NULL DEFAULT 0,
  category TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_number INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER,
  total_amount REAL NOT NULL DEFAULT 0.00,
  payment_method TEXT,
  paid_at TEXT,
  printed INTEGER DEFAULT 0,
  emailed INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE IF NOT EXISTS sale_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sale_id INTEGER NOT NULL,
  product_id INTEGER,
  upc TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price REAL NOT NULL DEFAULT 0.00,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sale_id) REFERENCES sales(id)
);

CREATE TABLE IF NOT EXISTS business_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  name TEXT DEFAULT 'Chiquita Catering',
  phone TEXT,
  email TEXT,
  address TEXT,
  logo_path TEXT,
  enableInventoryControl INTEGER DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS daily_notice (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  notice TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_metadata (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_upc ON products(upc);
CREATE INDEX IF NOT EXISTS idx_products_deleted ON products(deleted_at);
CREATE INDEX IF NOT EXISTS idx_customers_number ON customers(customer_number);
CREATE INDEX IF NOT EXISTS idx_customers_deleted ON customers(deleted_at);
CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(sale_id);
`;

// List of all migrations in order
const MIGRATIONS = [
  { version: 1, name: "initial_schema", sql: INITIAL_SCHEMA },
  // Add new migrations here as you create them
  // { version: 2, name: "add_new_column", sql: "..." },
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
 * Load and execute a migration SQL string
 */
const executeMigration = (database, sql) => {
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

      if (!migration.sql) {
        throw new Error(`No SQL found for migration ${migration.version}`);
      }

      executeMigration(database, migration.sql);
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
