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

  deleteProduct: (upc) => {
    return ipcRenderer.invoke(
      "products:delete",
      upc
    );
  },
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
});