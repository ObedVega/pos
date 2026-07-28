const getAPI = () => {
  if (!window.electronAPI) {
    throw new Error("Electron API is not available.");
  }

  return window.electronAPI;
};

const saleService = {
  createSale: (sale) => getAPI().createSale(sale),
  getAll: () => getAPI().getSales(),
  getById: (id) => getAPI().getSaleById(id),
  markAsPaid: (id, paymentMethod) => getAPI().markSaleAsPaid(id, paymentMethod),
  markAsPrinted: (id) => getAPI().markSaleAsPrinted(id),
  markAsEmailed: (id) => getAPI().markSaleAsEmailed(id),
};

export default saleService;
