-- Migration 1: Initial schema
-- This migration creates all base tables for the POS system

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS app_metadata (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS business_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  settings_json TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

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

CREATE TABLE IF NOT EXISTS inventory_movements (
  id INTEGER PRIMARY KEY,
  product_upc TEXT NOT NULL,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('SALE', 'ADJUSTMENT')),
  quantity_change INTEGER NOT NULL,
  previous_stock INTEGER NOT NULL CHECK (previous_stock >= 0),
  new_stock INTEGER NOT NULL CHECK (new_stock >= 0),
  reason TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  sale_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inventory_movements_product_created
ON inventory_movements(product_upc, created_at DESC);

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

CREATE TABLE IF NOT EXISTS sales (
  id TEXT PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  customer_number INTEGER NOT NULL,
  customer_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  payment_status TEXT NOT NULL DEFAULT 'PENDING',
  payment_method TEXT,
  delivery_status TEXT NOT NULL DEFAULT 'NOT_SENT',
  subtotal REAL NOT NULL CHECK (subtotal >= 0),
  yard_fee REAL NOT NULL DEFAULT 0 CHECK (yard_fee >= 0),
  tax REAL NOT NULL DEFAULT 0 CHECK (tax >= 0),
  total REAL NOT NULL CHECK (total >= 0),
  amount_paid REAL NOT NULL DEFAULT 0 CHECK (amount_paid >= 0),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT,
  deleted_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_sales_invoice_number
ON sales(invoice_number);

CREATE INDEX IF NOT EXISTS idx_sales_customer_number
ON sales(customer_number);

CREATE INDEX IF NOT EXISTS idx_sales_created_at
ON sales(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sales_deleted_at
ON sales(deleted_at);

CREATE TABLE IF NOT EXISTS sale_items (
  id TEXT PRIMARY KEY,
  sale_id TEXT NOT NULL,
  product_upc TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price REAL NOT NULL CHECK (unit_price >= 0),
  total_price REAL NOT NULL CHECK (total_price >= 0),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id
ON sale_items(sale_id);

CREATE TABLE IF NOT EXISTS yard_fees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  amount REAL NOT NULL CHECK (amount >= 0),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT,
  deleted_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_yard_fees_name
ON yard_fees(name);

CREATE INDEX IF NOT EXISTS idx_yard_fees_deleted_at
ON yard_fees(deleted_at);

CREATE TABLE IF NOT EXISTS daily_notices (
  id INTEGER PRIMARY KEY,
  notice TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
