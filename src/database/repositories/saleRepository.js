const database = require("../database");

let openSaleSchemaReady = false;
const ensureOpenSaleSchema = () => {
  if (openSaleSchemaReady) return;
  const saleColumns = database.all("PRAGMA table_info(sales)");
  const itemColumns = database.all("PRAGMA table_info(sale_items)");
  if (!saleColumns.some((column) => column.name === "closed_at")) {
    database.run("ALTER TABLE sales ADD COLUMN closed_at TEXT");
  }
  if (!itemColumns.some((column) => column.name === "added_at")) {
    database.run("ALTER TABLE sale_items ADD COLUMN added_at TEXT");
    database.run(`UPDATE sale_items SET added_at = COALESCE(
      (SELECT created_at FROM sales WHERE sales.id = sale_items.sale_id),
      CURRENT_TIMESTAMP
    ) WHERE added_at IS NULL`);
  }
  openSaleSchemaReady = true;
};

const isInventoryControlEnabled = () => {
  const row = database.get(
    "SELECT settings_json FROM business_settings WHERE id = 1"
  );

  if (!row) return true;

  try {
    const settings = JSON.parse(row.settings_json || "{}");
    return settings.enableInventoryControl !== false;
  } catch (_) {
    // Keep inventory protection enabled if the saved settings cannot be read.
    return true;
  }
};

const mapSale = (row) => {
  if (!row) return null;
  ensureOpenSaleSchema();
  const items = database.all(`SELECT id, product_upc, product_name, quantity, unit_price, line_total, added_at FROM sale_items WHERE sale_id = ? ORDER BY id`, row.id);
  let businessData = {};
  try { businessData = JSON.parse(row.business_data || "{}"); } catch (_) { /* Keep legacy data readable. */ }
  return {
    id: row.id, invoiceNumber: row.invoice_number, customerId: Number(row.customer_number), customerName: row.customer_name,
    status: row.status, paymentStatus: row.payment_status, paymentMethod: row.payment_method, deliveryStatus: row.delivery_status,
    items: items.map((item) => ({ id: `sale-item-${item.id}`, saleItemId: Number(item.id), productId: item.product_upc, upc: item.product_upc, name: item.product_name, quantity: Number(item.quantity), unitPrice: Number(item.unit_price), lineTotal: Number(item.line_total), addedAt: item.added_at })),
    subtotal: Number(row.subtotal), yardFee: Number(row.yard_fee), tax: Number(row.tax), total: Number(row.total), amountPaid: Number(row.amount_paid), balanceDue: Number(row.balance_due),
    dailyNotice: row.daily_notice, paymentTerms: row.payment_terms, createdAt: row.created_at, closedAt: row.closed_at, dueDate: row.due_date, paidAt: row.paid_at, printedAt: row.printed_at, emailedAt: row.emailed_at,
    ...businessData,
  };
};

const getById = (id) => mapSale(database.get("SELECT * FROM sales WHERE id = ?", id));

const getOpenByCustomer = (customerNumber) => {
  ensureOpenSaleSchema();
  return mapSale(database.get(
    "SELECT * FROM sales WHERE customer_number = ? AND status = 'OPEN' ORDER BY created_at DESC LIMIT 1",
    Number(customerNumber)
  ));
};

const applyInventoryDelta = (upc, name, quantityDelta, saleId) => {
  if (!quantityDelta || !isInventoryControlEnabled()) return;
  const product = database.get(
    "SELECT upc, stock FROM products WHERE upc = ? AND deleted_at IS NULL",
    upc
  );
  if (!product) throw new Error(`Product not found: ${name || upc}.`);
  const previousStock = Number(product.stock);
  if (quantityDelta > previousStock) {
    throw new Error(`Not enough stock for ${name || upc}. Available: ${previousStock}`);
  }
  const newStock = previousStock - quantityDelta;
  database.run(
    "UPDATE products SET stock = ?, updated_at = CURRENT_TIMESTAMP WHERE upc = ?",
    newStock,
    upc
  );
  database.run(
    "INSERT INTO inventory_movements (product_upc, movement_type, quantity_change, previous_stock, new_stock, reason, sale_id) VALUES (?, 'SALE', ?, ?, ?, 'sale', ?)",
    upc,
    -quantityDelta,
    previousStock,
    newStock,
    saleId
  );
};

const save = (sale, closeSale = false) => database.transaction(() => {
  ensureOpenSaleSchema();
  const customerId = Number(sale.customer?.id);
  if (!Number.isInteger(customerId) || customerId <= 0) throw new Error("A valid customer is required.");
  if (!Array.isArray(sale.items) || sale.items.length === 0) throw new Error("At least one item is required.");

  let saleRow = database.get(
    "SELECT * FROM sales WHERE customer_number = ? AND status = 'OPEN' ORDER BY created_at DESC LIMIT 1",
    customerId
  );
  const total = Number(sale.total);
  if (!Number.isFinite(total) || total < 0) throw new Error("Sale total is invalid.");
  const dueDate = String(sale.dueDate || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    throw new Error("A valid collection date is required.");
  }
  const businessData = { businessName: String(sale.businessName || "Chiquita Catering"), businessSubtitle: String(sale.businessSubtitle || "Warehouse Management System"), businessLogoPath: String(sale.businessLogoPath || ""), businessLogoUrl: String(sale.businessLogoUrl || ""), businessAddressLine1: String(sale.businessAddressLine1 || ""), businessAddressLine2: String(sale.businessAddressLine2 || ""), businessCity: String(sale.businessCity || ""), businessState: String(sale.businessState || ""), businessZipCode: String(sale.businessZipCode || ""), businessPhone: String(sale.businessPhone || ""), businessPermitNumber: String(sale.businessPermitNumber || ""), businessEmail: String(sale.businessEmail || ""), businessWebsite: String(sale.businessWebsite || "") };

  if (!saleRow) {
    const id = `SALE-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const invoiceRow = database.get("SELECT COUNT(*) AS total FROM sales");
    const invoiceNumber = `INV-${String(Number(invoiceRow.total) + 1).padStart(6, "0")}`;
    database.run(`INSERT INTO sales (id, invoice_number, customer_number, customer_name, status, subtotal, yard_fee, tax, total, balance_due, daily_notice, business_data, payment_terms, due_date, closed_at)
      VALUES (?, ?, ?, ?, 'OPEN', 0, 0, 0, 0, 0, ?, ?, ?, ?, NULL)`,
      id, invoiceNumber, customerId, String(sale.customer.name), String(sale.dailyNotice || ""), JSON.stringify(businessData), String(sale.paymentTerms || "Due upon receipt"), dueDate);
    saleRow = database.get("SELECT * FROM sales WHERE id = ?", id);
  }

  const existingItems = database.all("SELECT * FROM sale_items WHERE sale_id = ?", saleRow.id);
  const existingById = new Map(existingItems.map((item) => [Number(item.id), item]));
  const retainedIds = new Set();

  for (const item of sale.items) {
    const upc = String(item.upc || item.productId || "").trim();
    const quantity = Math.floor(Number(item.quantity));
    if (!upc || !Number.isInteger(quantity) || quantity <= 0) throw new Error("Each sale item must have a product and positive quantity.");
    const existing = item.saleItemId ? existingById.get(Number(item.saleItemId)) : null;
    if (existing) {
      retainedIds.add(Number(existing.id));
      if (String(existing.product_upc) !== upc) throw new Error("A saved sale item cannot change products.");
      applyInventoryDelta(upc, item.name, quantity - Number(existing.quantity), saleRow.id);
      database.run("UPDATE sale_items SET product_name = ?, quantity = ?, unit_price = ?, line_total = ? WHERE id = ? AND sale_id = ?",
        String(item.name || ""), quantity, Number(item.unitPrice) || 0, Number(item.lineTotal) || 0, existing.id, saleRow.id);
    } else {
      const product = database.get("SELECT upc FROM products WHERE upc = ? AND deleted_at IS NULL", upc);
      if (!product) throw new Error(`Product not found: ${item.name || upc}.`);
      applyInventoryDelta(upc, item.name, quantity, saleRow.id);
      database.run("INSERT INTO sale_items (sale_id, product_upc, product_name, quantity, unit_price, line_total, added_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        saleRow.id, upc, String(item.name || ""), quantity, Number(item.unitPrice) || 0, Number(item.lineTotal) || 0, String(item.addedAt || new Date().toISOString()));
    }
  }

  for (const existing of existingItems) {
    if (!retainedIds.has(Number(existing.id)) && sale.items.some((item) => Number(item.saleItemId) === Number(existing.id)) === false) {
      applyInventoryDelta(existing.product_upc, existing.product_name, -Number(existing.quantity), saleRow.id);
      database.run("DELETE FROM sale_items WHERE id = ? AND sale_id = ?", existing.id, saleRow.id);
    }
  }

  database.run(`UPDATE sales SET customer_name = ?, status = ?, subtotal = ?, yard_fee = ?, tax = ?, total = ?, balance_due = ?, daily_notice = ?, business_data = ?, payment_terms = ?, closed_at = ?, due_date = ? WHERE id = ?`,
    String(sale.customer.name), closeSale ? "PENDING" : "OPEN", Number(sale.subtotal) || 0, Number(sale.yardFee) || 0, Number(sale.tax) || 0, total, total, String(sale.dailyNotice || ""), JSON.stringify(businessData), String(sale.paymentTerms || "Due upon receipt"), closeSale ? new Date().toISOString() : null, dueDate, saleRow.id);
  return getById(saleRow.id);
})();

const create = (sale) => save(sale, true);
const saveOpen = (sale) => save(sale, false);

const getAll = () => database.all("SELECT * FROM sales ORDER BY created_at DESC, rowid DESC").map(mapSale);
// Return lightweight rows for the Sales screen. Do not load every invoice's
// items up front: mapSale performs a second query per sale and the synchronous
// main process can become unresponsive as the history grows.
const getPage = ({ search = "", date = "", offset = 0, limit = 100 } = {}) => {
  ensureOpenSaleSchema();
  const safeOffset = Math.max(0, Math.floor(Number(offset) || 0));
  const safeLimit = Math.min(100, Math.max(1, Math.floor(Number(limit) || 100)));
  const query = String(search || "").trim().toLowerCase();
  const dateKey = String(date || "").trim();
  const conditions = [];
  const params = [];

  if (query) {
    conditions.push("(LOWER(invoice_number) LIKE ? OR LOWER(customer_name) LIKE ?)");
    params.push(`%${query}%`, `%${query}%`);
  }
  if (dateKey) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) throw new Error("Invalid sales date.");
    conditions.push("DATE(COALESCE(closed_at, created_at), 'localtime') = ?");
    params.push(dateKey);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const rows = database.all(`
    SELECT id, invoice_number, customer_name, status, total, balance_due,
           created_at, closed_at, due_date
    FROM sales ${where}
    ORDER BY created_at DESC, rowid DESC
    LIMIT ? OFFSET ?
  `, ...params, safeLimit + 1, safeOffset);

  return {
    sales: rows.slice(0, safeLimit).map((row) => ({
      id: row.id,
      invoiceNumber: row.invoice_number,
      customerName: row.customer_name,
      status: row.status,
      total: Number(row.total),
      balanceDue: Number(row.balance_due),
      createdAt: row.created_at,
      closedAt: row.closed_at,
      dueDate: row.due_date,
    })),
    hasMore: rows.length > safeLimit,
  };
};
const getReport = ({ startDate, endDate } = {}) => {
  ensureOpenSaleSchema();
  const start = String(startDate || "");
  const end = String(endDate || start);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end) || end < start) {
    throw new Error("A valid report date range is required.");
  }
  return database.all(`
    SELECT id, invoice_number, customer_name, status, payment_method,
           subtotal, yard_fee, tax, total, balance_due, created_at, closed_at
    FROM sales
    WHERE status <> 'OPEN'
      AND DATE(COALESCE(closed_at, created_at), 'localtime') BETWEEN ? AND ?
    ORDER BY created_at DESC, rowid DESC
  `, start, end).map((row) => ({
    id: row.id,
    invoiceNumber: row.invoice_number,
    customerName: row.customer_name,
    status: row.status,
    paymentMethod: row.payment_method,
    subtotal: Number(row.subtotal),
    yardFee: Number(row.yard_fee),
    tax: Number(row.tax),
    total: Number(row.total),
    balanceDue: Number(row.balance_due),
    createdAt: row.created_at,
    closedAt: row.closed_at,
  }));
};
const markAsPaid = (id, paymentMethod) => {
  const result = database.run(
    "UPDATE sales SET status = 'PAID', payment_status = 'PAID', payment_method = ?, amount_paid = total, balance_due = 0, paid_at = ? WHERE id = ?",
    String(paymentMethod || ""),
    new Date().toISOString(),
    id
  );
  if (!result.changes) throw new Error("Sale not found.");
  return getById(id);
};
const markAsPrinted = (id) => { const result = database.run("UPDATE sales SET delivery_status = 'PRINTED', printed_at = CURRENT_TIMESTAMP WHERE id = ?", id); if (!result.changes) throw new Error("Sale not found."); return getById(id); };
const markAsEmailed = (id) => { const result = database.run("UPDATE sales SET delivery_status = 'EMAILED', emailed_at = CURRENT_TIMESTAMP WHERE id = ?", id); if (!result.changes) throw new Error("Sale not found."); return getById(id); };

module.exports = { create, saveOpen, getOpenByCustomer, getAll, getPage, getReport, getById, markAsPaid, markAsPrinted, markAsEmailed };
