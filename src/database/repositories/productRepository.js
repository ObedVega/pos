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

const create = (product) => {
  const upc = String(
    product?.upc ?? ""
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

  if (!upc) {
    throw new Error("UPC is required.");
  }

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

module.exports = {
  getAll,
  getByUPC,
  create,
  update,
  updateStock,
  remove,
  seed,
};