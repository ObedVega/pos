const getAPI = () => {
  if (!window.electronAPI) {
    throw new Error("Electron API is not available.");
  }

  return window.electronAPI;
};

const saleService = {
  createSale: (sale) => getAPI().createSale(sale),
  saveOpenSale: (sale) => getAPI().saveOpenSale(sale),
  getOpenByCustomer: (customerId) => getAPI().getOpenSaleByCustomer(customerId),
  getAll: () => getAPI().getSales(),
  getPage: (options) => getAPI().getSalesPage(options),
  getReport: (range) => getAPI().getSalesReport(range),
  getById: (id) => getAPI().getSaleById(id),
  markAsPaid: (id, paymentMethod) => getAPI().markSaleAsPaid(id, paymentMethod),
  markAsPrinted: (id) => getAPI().markSaleAsPrinted(id),
  markAsEmailed: (id) => getAPI().markSaleAsEmailed(id),
};

export default saleService;
