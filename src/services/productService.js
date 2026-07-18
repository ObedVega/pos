const ensureElectronAPI = () => {
  if (!window.electronAPI) {
    throw new Error(
      "Electron API is not available."
    );
  }

  return window.electronAPI;
};

const productService = {
  async getAll() {
    return ensureElectronAPI().getProducts();
  },

  async getByUPC(upc) {
    return ensureElectronAPI()
      .getProductByUPC(upc);
  },

  async create(product) {
    return ensureElectronAPI()
      .createProduct(product);
  },

  async update(originalUPC, product) {
    return ensureElectronAPI()
      .updateProduct(
        originalUPC,
        product
      );
  },

  async updateStock(upc, newStock) {
    return ensureElectronAPI()
      .updateProductStock(
        upc,
        newStock
      );
  },

  async remove(upc) {
    return ensureElectronAPI()
      .deleteProduct(upc);
  },
};

export default productService;