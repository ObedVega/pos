import React, { useState } from "react";
import "./UPCInput.css";

export default function UPCInput() {
  const [activeTab, setActiveTab] = useState("upc");

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

              <select id="product" className="product-select">
                <option value="">
                  Select item only if UPC is unavailable
                </option>
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
            <label htmlFor="price-check-upc">Barcode / UPC</label>

            <input
              id="price-check-upc"
              className="upc-input"
              placeholder="Scan an item to check its price..."
              autoFocus
            />
          </div>

          <div className="price-check-result">
            <span className="price-check-label">
              Product price
            </span>

            <strong className="price-check-value">
              $0.00
            </strong>

            <span className="price-check-help">
              Scan or enter a UPC to view the current price.
            </span>
          </div>

          <button
            type="button"
            className="price-check-clear"
          >
            Clear
          </button>
        </div>
      )}

    </div>
  );
}