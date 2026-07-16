import products from "../data/products";

const normalizeUPC = (upc) => String(upc ?? "").trim();

const productService = {
  async getAll() {
    return [...products];
  },

  async getByUPC(upc) {
    const normalizedUPC = normalizeUPC(upc);

    if (!normalizedUPC) {
      return null;
    }

    return (
      products.find(
        (product) => product.upc === normalizedUPC
      ) ?? null
    );
  },
};

export default productService;