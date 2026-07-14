import React, { useState } from "react";
import "./UPCInput.css";
import products from "../data/products";

export default function UPCInput() {
  const [activeTab, setActiveTab] = useState("upc");

  const [priceCheckUPC, setPriceCheckUPC] = useState("");
  const [priceCheckProduct, setPriceCheckProduct] = useState(null);
  const [priceCheckMessage, setPriceCheckMessage] = useState(
    "Scan or enter a UPC to view the current price."
  );

  const handlePriceCheck = (value) => {
    const normalizedUPC = value.trim();

    setPriceCheckUPC(value);

    if (!normalizedUPC) {
      setPriceCheckProduct(null);
      setPriceCheckMessage(
        "Scan or enter a UPC to view the current price."
      );
      return;
    }

    const foundProduct = products.find(
      (product) => product.upc === normalizedUPC
    );

    if (foundProduct) {
      setPriceCheckProduct(foundProduct);
      setPriceCheckMessage("Product found.");
    } else {
      setPriceCheckProduct(null);
      setPriceCheckMessage("No product was found for this UPC.");
    }
  };

  const handlePriceCheckKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handlePriceCheck(priceCheckUPC);
    }
  };

  const clearPriceCheck = () => {
    setPriceCheckUPC("");
    setPriceCheckProduct(null);
    setPriceCheckMessage(
      "Scan or enter a UPC to view the current price."
    );
  };

  return (
    <div className="upc-card">
      <div className="upc-tabs">
        <button
          type="button"
          className={`upc-tab ${activeTab === "upc" ? "active" : ""}`}
          onClick={() => setActiveTab("upc")}
        >
          UPC Input
        </button>

        <button
          type="button"
          className={`upc-tab ${activeTab === "price" ? "active" : ""}`}
          onClick={() => setActiveTab("price")}
        >
          Price Check
        </button>
      </div>

      {activeTab === "upc" && (
        <div className="tab-content">
          <div className="quantity-section">
            <label htmlFor="quantity">Quantity</label>

            <input
              id="quantity"
              className="qty-input"
              type="number"
              defaultValue="1"
              min="1"
            />
          </div>

          <fieldset className="select-item-group">
            <legend>Select Item</legend>

            <div className="field">
              <label htmlFor="upc">Barcode / UPC</label>

              <input
                id="upc"
                className="upc-input"
                placeholder="Scan or type UPC..."
                autoFocus
              />
            </div>

            <div className="divider">
              <span>OR</span>
            </div>

            <div className="field">
              <label htmlFor="product">Product</label>

              <select
                id="product"
                className="product-select"
              >
                <option value="">
                  Select item only if UPC is unavailable
                </option>

                {products.map((product) => (
                  <option
                    key={product.upc}
                    value={product.upc}
                  >
                    {product.name} - ${product.price.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
          </fieldset>

          <div className="upc-buttons">
            <button type="button" className="primary">
              Add Item
            </button>

            <button type="button">
              Remove
            </button>

            <button type="button">
              Clear
            </button>
          </div>

          <div className="item-count">
            Item Count: <strong>0</strong>
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
              id="price-check-upc"
              className="upc-input"
              placeholder="Scan an item to check its price..."
              value={priceCheckUPC}
              onChange={(event) =>
                handlePriceCheck(event.target.value)
              }
              onKeyDown={handlePriceCheckKeyDown}
              autoFocus
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
                  ${priceCheckProduct.price.toFixed(2)}
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