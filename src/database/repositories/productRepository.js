const database = require("../database");

const mapProductRow = (row) => {
  if (!row) {
    return null;
  }

  return {
    upc: row.upc,
    name: row.name,
    price: Number(row.price),
    stock: Number(row.stock),
    minimumStock: Number(
      row.minimum_stock
    ),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};
const getAll = () => {
  const rows = database.all(`
    SELECT
      upc,
      name,
      price,
      stock,
      minimum_stock,
      created_at,
      updated_at
    FROM products
    WHERE deleted_at IS NULL
    ORDER BY name ASC
  `);

  return rows.map(mapProductRow);
};

const getByUPC = (upc) => {
  const normalizedUPC =
    String(upc ?? "").trim();

  if (!normalizedUPC) {
    return null;
  }

const row = database.get(`
      SELECT
        upc,
        name,
        price,
        stock,
        minimum_stock,
        created_at,
        updated_at
      FROM products
      WHERE upc = ?
        AND deleted_at IS NULL
`, normalizedUPC);

  return mapProductRow(row);
};

const calculateCheckDigit = (firstElevenDigits) => {
  const sum = String(firstElevenDigits)
    .split("")
    .reduce((total, digit, index) =>
      total + Number(digit) * (index % 2 === 0 ? 3 : 1), 0);

  return String((10 - (sum % 10)) % 10);
};

const generateInternalUPC = () => {
  const last = database.get(`
    SELECT upc FROM products
    WHERE upc GLOB '200?????????'
    ORDER BY upc DESC LIMIT 1
  `);
  const nextSequence = Math.max(
    1,
    Number(String(last?.upc ?? "200000000000").slice(3, 11)) + 1
  );
  const firstElevenDigits = `200${String(nextSequence).padStart(8, "0")}`;
  return firstElevenDigits + calculateCheckDigit(firstElevenDigits);
};

const create = (product) => {
  const suppliedUPC = String(product?.upc ?? "").trim();
  const upc = suppliedUPC || generateInternalUPC();

  const name = String(
    product?.name ?? ""
  ).trim();

  const price = Number(product?.price ?? 0);

  const stock = Math.max(
    0,
    Math.floor(Number(product?.stock ?? 0))
  );

  const minimumStock = Math.max(
    0,
    Math.floor(
      Number(product?.minimumStock ?? 0)
    )
  );

  if (!name) {
    throw new Error(
      "Product name is required."
    );
  }

  if (!Number.isFinite(price) || price < 0) {
    throw new Error(
      "Product price is invalid."
    );
  }

database.run(`
      INSERT INTO products (
        upc,
        name,
        price,
        stock,
        minimum_stock
      )
      VALUES (?, ?, ?, ?, ?)
`,
  upc,
  name,
  price,
  stock,
  minimumStock
);

  return getByUPC(upc);
};

const update = (originalUPC, product) => {
  const currentUPC = String(
    originalUPC ?? ""
  ).trim();

  const newUPC = String(
    product?.upc ?? currentUPC
  ).trim();

  const name = String(
    product?.name ?? ""
  ).trim();

  const price = Number(product?.price ?? 0);

  const stock = Math.max(
    0,
    Math.floor(Number(product?.stock ?? 0))
  );

  const minimumStock = Math.max(
    0,
    Math.floor(
      Number(product?.minimumStock ?? 0)
    )
  );

  if (!currentUPC || !newUPC) {
    throw new Error("UPC is required.");
  }

  if (!name) {
    throw new Error(
      "Product name is required."
    );
  }

const result = database.run(`
      UPDATE products
      SET
        upc = ?,
        name = ?,
        price = ?,
        stock = ?,
        minimum_stock = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE upc = ?
        AND deleted_at IS NULL
`,
  newUPC,
  name,
  price,
  stock,
  minimumStock,
  currentUPC
);

  if (result.changes === 0) {
    throw new Error(
      "Product was not found."
    );
  }

  return getByUPC(newUPC);
};

const updateStock = (upc, newStock) => {
  const normalizedStock = Math.max(
    0,
    Math.floor(Number(newStock) || 0)
  );

const result = database.run(`
      UPDATE products
      SET
        stock = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE upc = ?
        AND deleted_at IS NULL
`,
  normalizedStock,
  String(upc).trim()
);

  if (result.changes === 0) {
    throw new Error(
      "Product was not found."
    );
  }

  return getByUPC(upc);
};

const remove = (upc) => {
const result = database.run(`
      UPDATE products
      SET
        deleted_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE upc = ?
        AND deleted_at IS NULL
`,
  String(upc).trim()
);

  return result.changes > 0;
};

const adjustStock = (upc, adjustment) => {
  const product = getByUPC(upc);
  const newStock = Number(adjustment?.newStock);
  if (!product) throw new Error("Product was not found.");
  if (!Number.isInteger(newStock) || newStock < 0) throw new Error("Stock must be a non-negative whole number.");

  return database.transaction(() => {
    database.run("UPDATE products SET stock = ?, updated_at = CURRENT_TIMESTAMP WHERE upc = ?", newStock, product.upc);
    database.run("INSERT INTO inventory_movements (product_upc, movement_type, quantity_change, previous_stock, new_stock, reason, notes) VALUES (?, 'ADJUSTMENT', ?, ?, ?, ?, ?)", product.upc, newStock - product.stock, product.stock, newStock, String(adjustment?.reason ?? "adjustment"), String(adjustment?.notes ?? ""));
    return getByUPC(product.upc);
  })();
};

const seed = (products) => {
  if (!Array.isArray(products)) {
    return;
  }

  const insertProduct = database.prepare(`
    INSERT OR IGNORE INTO products (
      upc,
      name,
      price,
      stock,
      minimum_stock
    )
    VALUES (?, ?, ?, ?, ?)
  `);

  products.forEach((product) => {
    insertProduct.run(
      String(product.upc),
      String(product.name),
      Number(product.price ?? 0),
      Math.max(0, Math.floor(Number(product.stock ?? 0))),
      Math.max(0, Math.floor(Number(product.minimumStock ?? 0)))
    );
  });
};

// The first inventory release replaces the previous demo catalog once. From
// then on SQLite remains the source of truth for stock changes and sales.
const synchronizeInitialInventory = (products) => {
  const migrationKey = "initial_inventory_catalog_v2";
  const migration = database.get(
    "SELECT value FROM app_metadata WHERE key = ?",
    migrationKey
  );

  if (migration?.value === "complete" || !Array.isArray(products)) {
    return;
  }

  database.transaction(() => {
    const upsertProduct = database.prepare(`
      INSERT INTO products (upc, name, price, stock, minimum_stock, updated_at)
      VALUES (?, ?, ?, 0, 0, CURRENT_TIMESTAMP)
      ON CONFLICT(upc) DO UPDATE SET
        name = excluded.name,
        price = excluded.price,
        stock = 0,
        minimum_stock = 0,
        deleted_at = NULL,
        updated_at = CURRENT_TIMESTAMP
    `);

    products.forEach((product) => {
      upsertProduct.run(
        String(product.upc),
        String(product.name),
        Number(product.price ?? 0)
      );
    });

    database.run(
      `INSERT INTO app_metadata (key, value, updated_at)
       VALUES (?, 'complete', CURRENT_TIMESTAMP)
       ON CONFLICT(key) DO UPDATE SET
         value = excluded.value,
         updated_at = CURRENT_TIMESTAMP`,
      migrationKey
    );
  })();
};

module.exports = {
  getAll,
  getByUPC,
  create,
  update,
  updateStock,
  adjustStock,
  remove,
  seed,
  synchronizeInitialInventory,
};
