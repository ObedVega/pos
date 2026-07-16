const inventoryService = {
  validateStock(products, cartItems) {
    for (const cartItem of cartItems) {
      const product = products.find(
        (item) => item.upc === cartItem.upc
      );

      if (!product) {
        throw new Error(
          `Product not found: ${cartItem.name}`
        );
      }

      const availableStock = Number(product.stock ?? 0);

      if (cartItem.quantity > availableStock) {
        throw new Error(
          `Not enough stock for ${cartItem.name}. Available: ${availableStock}`
        );
      }
    }

    return true;
  },

  deductStock(products, cartItems) {
    return products.map((product) => {
      const soldItem = cartItems.find(
        (item) => item.upc === product.upc
      );

      if (!soldItem) {
        return product;
      }

      return {
        ...product,
        stock:
          Number(product.stock ?? 0) -
          Number(soldItem.quantity),
      };
    });
  },
};

export default inventoryService;