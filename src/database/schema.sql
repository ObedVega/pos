PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS products (
  upc TEXT PRIMARY KEY,

  name TEXT NOT NULL,

  price REAL NOT NULL DEFAULT 0
    CHECK (price >= 0),

  stock INTEGER NOT NULL DEFAULT 0
    CHECK (stock >= 0),

  minimum_stock INTEGER NOT NULL DEFAULT 0
    CHECK (minimum_stock >= 0),

  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT,
  deleted_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_products_name
ON products(name);

CREATE INDEX IF NOT EXISTS idx_products_deleted_at
ON products(deleted_at);


CREATE TABLE IF NOT EXISTS customers (
  customer_number INTEGER PRIMARY KEY,

  name TEXT NOT NULL,

  permit_number TEXT NOT NULL DEFAULT '',

  truck_number TEXT NOT NULL DEFAULT '',

  phone TEXT NOT NULL DEFAULT '',

  email TEXT NOT NULL DEFAULT '',

  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT,
  deleted_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_customers_name
ON customers(name);

CREATE INDEX IF NOT EXISTS idx_customers_permit_number
ON customers(permit_number);

CREATE INDEX IF NOT EXISTS idx_customers_truck_number
ON customers(truck_number);

CREATE INDEX IF NOT EXISTS idx_customers_deleted_at
ON customers(deleted_at);

-- daily notice

CREATE TABLE IF NOT EXISTS daily_notice (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  notice TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT
);