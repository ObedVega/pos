const {
  contextBridge,
  ipcRenderer,
} = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  onOpenCustomerManager: (callback) => {
    const handler = () => callback();

    ipcRenderer.on(
      "open-customer-manager",
      handler
    );

    return () => {
      ipcRenderer.removeListener(
        "open-customer-manager",
        handler
      );
    };
  },

  onNewSale: (callback) => {
    const handler = () => callback();

    ipcRenderer.on(
      "new-sale",
      handler
    );

    return () => {
      ipcRenderer.removeListener(
        "new-sale",
        handler
      );
    };
  },

  selectBusinessLogo: () => {
    return ipcRenderer.invoke(
      "business-logo:select"
    );
  },
  getBusinessSettings: () =>
    ipcRenderer.invoke("business-settings:get"),
  saveBusinessSettings: (settings) =>
    ipcRenderer.invoke("business-settings:save", settings),
  saveInvoicePdf: (invoiceNumber) => {
    return ipcRenderer.invoke(
      "invoice:save-pdf",
      invoiceNumber
    );
  },
    getProducts: () => {
    return ipcRenderer.invoke(
      "products:get-all"
    );
  },

  getProductByUPC: (upc) => {
    return ipcRenderer.invoke(
      "products:get-by-upc",
      upc
    );
  },

  createProduct: (product) => {
    return ipcRenderer.invoke(
      "products:create",
      product
    );
  },

  updateProduct: (
    originalUPC,
    product
  ) => {
    return ipcRenderer.invoke(
      "products:update",
      originalUPC,
      product
    );
  },

  updateProductStock: (
    upc,
    newStock
  ) => {
    return ipcRenderer.invoke(
      "products:update-stock",
      upc,
      newStock
    );
  },

  adjustInventory: (upc, adjustment) =>
    ipcRenderer.invoke("inventory:adjust", upc, adjustment),

  deleteProduct: (upc) => {
    return ipcRenderer.invoke(
      "products:delete",
      upc
    );
  },

  createSale: (sale) => ipcRenderer.invoke("sales:create", sale),
  getSales: () => ipcRenderer.invoke("sales:get-all"),
  getSaleById: (id) => ipcRenderer.invoke("sales:get-by-id", id),
  markSaleAsPaid: (id, paymentMethod) => ipcRenderer.invoke("sales:mark-paid", id, paymentMethod),
  markSaleAsPrinted: (id) => ipcRenderer.invoke("sales:mark-printed", id),
  markSaleAsEmailed: (id) => ipcRenderer.invoke("sales:mark-emailed", id),
  exportSalesReport: (range) =>
    ipcRenderer.invoke("reports:export-sales-xlsx", range),
    getCustomers: () => {
    return ipcRenderer.invoke(
      "customers:get-all"
    );
  },

  getCustomerById: (customerId) => {
    return ipcRenderer.invoke(
      "customers:get-by-id",
      customerId
    );
  },

  searchCustomers: (searchTerm) => {
    return ipcRenderer.invoke(
      "customers:search",
      searchTerm
    );
  },

  createCustomer: (customer) => {
    return ipcRenderer.invoke(
      "customers:create",
      customer
    );
  },

  updateCustomer: (
    customerId,
    customer
  ) => {
    return ipcRenderer.invoke(
      "customers:update",
      customerId,
      customer
    );
  },

  deleteCustomer: (customerId) => {
    return ipcRenderer.invoke(
      "customers:delete",
      customerId
    );
  },
  getDailyNotice: () =>
  ipcRenderer.invoke("daily-notice:get"),

saveDailyNotice: (notice) =>
  ipcRenderer.invoke(
    "daily-notice:save",
    notice
  ),

  printBarcodeLabels: () =>
    ipcRenderer.invoke("print:barcode-labels"),
});
