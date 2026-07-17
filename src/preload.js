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
});