const database = require("../database");

const mapSale = (row) => {
  if (!row) return null;
  const items = database.all(`SELECT product_upc, product_name, quantity, unit_price, line_total FROM sale_items WHERE sale_id = ? ORDER BY id`, row.id);
  let businessData = {};
  try { businessData = JSON.parse(row.business_data || "{}"); } catch (_) { /* Keep legacy data readable. */ }
  return {
    id: row.id, invoiceNumber: row.invoice_number, customerId: Number(row.customer_number), customerName: row.customer_name,
    status: row.status, paymentStatus: row.payment_status, paymentMethod: row.payment_method, deliveryStatus: row.delivery_status,
    items: items.map((item) => ({ productId: item.product_upc, upc: item.product_upc, name: item.product_name, quantity: Number(item.quantity), unitPrice: Number(item.unit_price), lineTotal: Number(item.line_total) })),
    subtotal: Number(row.subtotal), yardFee: Number(row.yard_fee), tax: Number(row.tax), total: Number(row.total), amountPaid: Number(row.amount_paid), balanceDue: Number(row.balance_due),
    dailyNotice: row.daily_notice, paymentTerms: row.payment_terms, createdAt: row.created_at, dueDate: row.due_date, paidAt: row.paid_at, printedAt: row.printed_at, emailedAt: row.emailed_at,
    ...businessData,
  };
};

const getById = (id) => mapSale(database.get("SELECT * FROM sales WHERE id = ?", id));

const create = (sale) => database.transaction(() => {
  const customerId = Number(sale.customer?.id);
  if (!Number.isInteger(customerId) || customerId <= 0) throw new Error("A valid customer is required.");
  if (!Array.isArray(sale.items) || sale.items.length === 0) throw new Error("At least one item is required.");

  const id = `SALE-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const invoiceRow = database.get("SELECT COUNT(*) AS total FROM sales");
  const invoiceNumber = `INV-${String(Number(invoiceRow.total) + 1).padStart(6, "0")}`;
  const total = Number(sale.total);
  if (!Number.isFinite(total) || total < 0) throw new Error("Sale total is invalid.");
  const businessData = { businessName: String(sale.businessName || "Chiquita Catering"), businessSubtitle: String(sale.businessSubtitle || "Warehouse Management System"), businessLogoPath: String(sale.businessLogoPath || ""), businessLogoUrl: String(sale.businessLogoUrl || ""), businessAddressLine1: String(sale.businessAddressLine1 || ""), businessAddressLine2: String(sale.businessAddressLine2 || ""), businessCity: String(sale.businessCity || ""), businessState: String(sale.businessState || ""), businessZipCode: String(sale.businessZipCode || ""), businessPhone: String(sale.businessPhone || ""), businessPermitNumber: String(sale.businessPermitNumber || ""), businessEmail: String(sale.businessEmail || ""), businessWebsite: String(sale.businessWebsite || "") };
  database.run(`INSERT INTO sales (id, invoice_number, customer_number, customer_name, subtotal, yard_fee, tax, total, balance_due, daily_notice, business_data, payment_terms, due_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`, id, invoiceNumber, customerId, String(sale.customer.name), Number(sale.subtotal) || 0, Number(sale.yardFee) || 0, Number(sale.tax) || 0, total, total, String(sale.dailyNotice || ""), JSON.stringify(businessData), String(sale.paymentTerms || "Due upon receipt"));
  for (const item of sale.items) {
    const upc = String(item.upc || item.productId || "").trim();
    const quantity = Math.floor(Number(item.quantity));
    if (!upc || !Number.isInteger(quantity) || quantity <= 0) throw new Error("Each sale item must have a product and positive quantity.");
    const product = database.get("SELECT upc, stock FROM products WHERE upc = ? AND deleted_at IS NULL", upc);
    if (!product) throw new Error(`Product not found: ${item.name || upc}.`);
    const previousStock = Number(product.stock);
    if (quantity > previousStock) throw new Error(`Not enough stock for ${item.name || upc}. Available: ${previousStock}`);
    const newStock = previousStock - quantity;
    database.run("UPDATE products SET stock = ?, updated_at = CURRENT_TIMESTAMP WHERE upc = ?", newStock, upc);
    database.run("INSERT INTO sale_items (sale_id, product_upc, product_name, quantity, unit_price, line_total) VALUES (?, ?, ?, ?, ?, ?)", id, upc, String(item.name || ""), quantity, Number(item.unitPrice) || 0, Number(item.lineTotal) || 0);
    database.run("INSERT INTO inventory_movements (product_upc, movement_type, quantity_change, previous_stock, new_stock, reason, sale_id) VALUES (?, 'SALE', ?, ?, ?, 'sale', ?)", upc, -quantity, previousStock, newStock, id);
  }
  return getById(id);
})();

const getAll = () => database.all("SELECT * FROM sales ORDER BY created_at DESC, rowid DESC").map(mapSale);
const markAsPaid = (id, paymentMethod) => { const result = database.run("UPDATE sales SET status = 'PAID', payment_status = 'PAID', payment_method = ?, amount_paid = total, balance_due = 0, paid_at = CURRENT_TIMESTAMP WHERE id = ?", String(paymentMethod || ""), id); if (!result.changes) throw new Error("Sale not found."); return getById(id); };
const markAsPrinted = (id) => { const result = database.run("UPDATE sales SET delivery_status = 'PRINTED', printed_at = CURRENT_TIMESTAMP WHERE id = ?", id); if (!result.changes) throw new Error("Sale not found."); return getById(id); };
const markAsEmailed = (id) => { const result = database.run("UPDATE sales SET delivery_status = 'EMAILED', emailed_at = CURRENT_TIMESTAMP WHERE id = ?", id); if (!result.changes) throw new Error("Sale not found."); return getById(id); };

module.exports = { create, getAll, getById, markAsPaid, markAsPrinted, markAsEmailed };
