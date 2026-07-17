import sales from "../data/sales";

const generateInvoiceNumber = () => {
  const nextNumber = sales.length + 1;

  return `INV-${String(nextNumber).padStart(6, "0")}`;
};

const generateSaleId = () => {
  return `SALE-${Date.now()}`;
};

const saleService = {
async createSale({
  customer,
  items,
  subtotal,
  yardFee,
  tax,
  total,
  dailyNotice,

  businessName,
  businessSubtitle,
  businessLogoPath,
  businessLogoUrl,

  businessAddressLine1,
  businessAddressLine2,
  businessCity,
  businessState,
  businessZipCode,
  businessPhone,
  businessPermitNumber,
  businessEmail,
  businessWebsite,
  paymentTerms,
}) {
    if (!customer) {
      throw new Error("Customer is required.");
    }

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("At least one item is required.");
    }
const sale = {
  id: generateSaleId(),
  invoiceNumber: generateInvoiceNumber(),

  customerId: customer.id,
  customerName: customer.name,

  status: "PENDING",
  paymentStatus: "PENDING",
  deliveryStatus: "NOT_SENT",

  items: items.map((item) => ({
    productId: item.productId,
    upc: item.upc,
    name: item.name,
    quantity: item.quantity,
    unitPrice: Number(item.unitPrice),
    lineTotal: Number(item.lineTotal),
  })),

  subtotal: Number(subtotal),
  yardFee: Number(yardFee),
  tax: Number(tax),
  total: Number(total),

  dailyNotice: String(dailyNotice ?? ""),

  businessName: String(
    businessName || "Chiquita Catering"
  ),

  businessSubtitle: String(
    businessSubtitle ||
    "Warehouse Management System"
  ),

  businessLogoPath: String(
    businessLogoPath || ""
  ),

  businessLogoUrl: String(
    businessLogoUrl || ""
  ),
businessAddressLine1: String(
  businessAddressLine1 || ""
),

businessAddressLine2: String(
  businessAddressLine2 || ""
),

businessCity: String(
  businessCity || ""
),

businessState: String(
  businessState || ""
),

businessZipCode: String(
  businessZipCode || ""
),

businessPhone: String(
  businessPhone || ""
),
businessPermitNumber: String(
  businessPermitNumber || ""
),
businessEmail: String(
  businessEmail || ""
),

businessWebsite: String(
  businessWebsite || ""
),

paymentTerms: String(
  paymentTerms || "Due upon receipt"
),
  amountPaid: 0,
  balanceDue: Number(total),

  createdAt: new Date().toISOString(),
  dueDate: new Date().toISOString(),
  paidAt: null,
};
    sales.push(sale);

    return sale;
  },

  async getAll() {
    return [...sales];
  },

  async getById(id) {
    return sales.find((sale) => sale.id === id) ?? null;
  },

async markAsPaid(id, paymentMethod) {
  const sale = sales.find(
    (currentSale) => currentSale.id === id
  );

  if (!sale) {
    throw new Error("Sale not found.");
  }

  sale.status = "PAID";
  sale.paymentStatus = "PAID";
  sale.paymentMethod = paymentMethod;
  sale.amountPaid = Number(sale.total);
  sale.balanceDue = 0;
  sale.paidAt = new Date().toISOString();

  return { ...sale };
},

  async markAsPrinted(id) {
    const sale = sales.find((item) => item.id === id);

    if (!sale) {
      throw new Error("Sale not found.");
    }

    sale.deliveryStatus = "PRINTED";

    return sale;
  },

  async markAsEmailed(id) {
    const sale = sales.find((item) => item.id === id);

    if (!sale) {
      throw new Error("Sale not found.");
    }

    sale.deliveryStatus = "EMAILED";

    return sale;
  },
};

export default saleService;