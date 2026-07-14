import products from "../data/products";

export const productService = {
  async getAll() {
    return products;
  },

  async getByUPC(upc) {
    const normalizedUPC = String(upc ?? "").trim();

    return (
      products.find(
        (product) => product.upc === normalizedUPC
      ) ?? null
    );
  },

  async getById(id) {
    return (
      products.find(
        (product) => String(product.id) === String(id)
      ) ?? null
    );
  },
};