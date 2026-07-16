import React, { useEffect, useRef, useState } from "react";

import "./UPCInput.css";
import productService from "../services/productService";

export default function UPCInput({
  itemCount,
  onAddItem,
  onRemoveItem,
  onClearSale,
  onShowAlert,
}) {
  const [activeTab, setActiveTab] = useState("upc");
  const [products, setProducts] = useState([]);

  const [quantity, setQuantity] = useState(1);
  const [upc, setUPC] = useState("");
  const [selectedProductUPC, setSelectedProductUPC] =
    useState("");

 

  const [priceCheckUPC, setPriceCheckUPC] = useState("");
  const [priceCheckProduct, setPriceCheckProduct] =
    useState(null);

  const [priceCheckMessage, setPriceCheckMessage] =
    useState(
      "Scan or enter a UPC to view the current price."
    );

  const upcInputRef = useRef(null);
  const priceInputRef = useRef(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const result = await productService.getAll();
        setProducts(result);
      } catch (error) {
        console.error("Could not load products:", error);
        onShowAlert({
          type: "error",
          title: "Products unavailable",
          message: "Could not load the product list.",
        });
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    if (activeTab === "upc") {
      window.setTimeout(() => {
        upcInputRef.current?.focus();
      }, 0);
    }

    if (activeTab === "price") {
      window.setTimeout(() => {
        priceInputRef.current?.focus();
      }, 0);
    }
  }, [activeTab]);

  const clearProductInputs = () => {
    setUPC("");
    setSelectedProductUPC("");
    setQuantity(1);

    window.setTimeout(() => {
      upcInputRef.current?.focus();
    }, 0);
  };

  const findSelectedProduct = async () => {
    const normalizedUPC = upc.trim();

    if (normalizedUPC) {
      return productService.getByUPC(normalizedUPC);
    }

    if (selectedProductUPC) {
      return productService.getByUPC(
        selectedProductUPC
      );
    }

    return null;
  };

const handleAdd = async () => {
  const hasUPC = upc.trim() !== "";
  const hasSelectedProduct =
    selectedProductUPC !== "";

  if (!hasUPC && !hasSelectedProduct) {
    onShowAlert({
      type: "warning",
      title: "Item required",
      message: "Select item.",
    });

    return;
  }

  const safeQuantity = Math.max(
    1,
    Math.floor(Number(quantity) || 1)
  );

  const product = await findSelectedProduct();

  if (!product) {
    onShowAlert({
      type: "error",
      title: "Product not found",
      message: hasUPC
        ? "No product was found for that UPC."
        : "Select item.",
    });

    return;
  }

  const wasAdded = onAddItem(
    product,
    safeQuantity
  );

  if (!wasAdded) {
    return;
  }

  clearProductInputs();
};
  const handleUPCKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAdd();
    }
  };

const handleRemove = () => {
  const removed = onRemoveItem();

  if (!removed) {
    onShowAlert({
      type: "warning",
      title: "Item required",
      message:
        "Select an item in the cart before removing it.",
    });
  }
};

const handleClearSale = () => {
  if (itemCount === 0) {
    clearProductInputs();
    return;
  }

  const confirmed = window.confirm(
    "Clear every item from the current sale?"
  );

  if (!confirmed) {
    return;
  }

  onClearSale();
  clearProductInputs();
};

  const handlePriceCheck = async (value) => {
    setPriceCheckUPC(value);

    const normalizedUPC = value.trim();

    if (!normalizedUPC) {
      setPriceCheckProduct(null);
      setPriceCheckMessage(
        "Scan or enter a UPC to view the current price."
      );

      return;
    }

    const product =
      await productService.getByUPC(normalizedUPC);

    if (product) {
      setPriceCheckProduct(product);
      setPriceCheckMessage("Product found.");
      return;
    }

    setPriceCheckProduct(null);
    setPriceCheckMessage(
      "No product was found for this UPC."
    );
  };

  const clearPriceCheck = () => {
    setPriceCheckUPC("");
    setPriceCheckProduct(null);

    setPriceCheckMessage(
      "Scan or enter a UPC to view the current price."
    );

    window.setTimeout(() => {
      priceInputRef.current?.focus();
    }, 0);
  };

  return (
    <div className="upc-card">
      <div className="upc-tabs">
        <button
          type="button"
          className={`upc-tab ${
            activeTab === "upc" ? "active" : ""
          }`}
          onClick={() => setActiveTab("upc")}
        >
          UPC Input
        </button>

        <button
          type="button"
          className={`upc-tab ${
            activeTab === "price" ? "active" : ""
          }`}
          onClick={() => setActiveTab("price")}
        >
          Price Check
        </button>
      </div>

      {activeTab === "upc" && (
        <div className="tab-content">
          <div className="quantity-section">
            <div>
              <label htmlFor="quantity">
                Quantity
              </label>

              <input
                id="quantity"
                className="qty-input"
                type="number"
                value={quantity}
                min="1"
                step="1"
                onChange={(event) =>
                  setQuantity(event.target.value)
                }
              />
            </div>
          </div>

          <fieldset className="select-item-group">
            <legend>Select Item</legend>

            <div className="field">
              <label htmlFor="upc">
                Barcode / UPC
              </label>

              <input
                ref={upcInputRef}
                id="upc"
                className="upc-input"
                placeholder="Scan or type UPC..."
                value={upc}
                onChange={(event) => {
                  setUPC(event.target.value);
                }}
                onKeyDown={handleUPCKeyDown}
              />
            </div>

            <div className="divider">
              <span>OR</span>
            </div>

            <div className="field">
              <label htmlFor="product">
                Product
              </label>

              <select
                id="product"
                className="product-select"
                value={selectedProductUPC}
                onChange={(event) => {
                  setSelectedProductUPC(
                    event.target.value
                  );

                  setUPC("");
                }}
              >
                <option value="">
                  Select item only if UPC is unavailable
                </option>

                {products.map((product) => (
                  <option
                    key={product.upc}
                    value={product.upc}
                  >
                    {product.name} - $
                    {product.price.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
          </fieldset>

          <div className="upc-buttons">
<button
  type="button"
  className="primary"
  onClick={handleAdd}
>
  Add Item
</button>

            <button
              type="button"
              onClick={handleRemove}
            >
              Remove
            </button>

            <button
              type="button"
              onClick={handleClearSale}
            >
              Clear
            </button>
          </div>


          <div className="item-count">
            Item Count: <strong>{itemCount}</strong>
          </div>
        </div>
      )}

      {activeTab === "price" && (
        <div className="tab-content price-check-content">
          <div className="field">
            <label htmlFor="price-check-upc">
              Barcode / UPC
            </label>

            <input
              ref={priceInputRef}
              id="price-check-upc"
              className="upc-input"
              placeholder="Scan an item to check its price..."
              value={priceCheckUPC}
              onChange={(event) =>
                handlePriceCheck(event.target.value)
              }
            />
          </div>

          <div className="price-check-result">
            <span className="price-check-label">
              Product price
            </span>

            {priceCheckProduct ? (
              <>
                <strong className="price-check-product-name">
                  {priceCheckProduct.name}
                </strong>

                <strong className="price-check-value">
                  $
                  {priceCheckProduct.price.toFixed(2)}
                </strong>

                <span className="price-check-upc-value">
                  UPC: {priceCheckProduct.upc}
                </span>
              </>
            ) : (
              <strong className="price-check-value">
                $0.00
              </strong>
            )}

            <span className="price-check-help">
              {priceCheckMessage}
            </span>
          </div>

          <button
            type="button"
            className="price-check-clear"
            onClick={clearPriceCheck}
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}