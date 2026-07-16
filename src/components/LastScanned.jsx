import React from "react";
import "./LastScanned.css";

export default function LastScanned({ product }) {
  return (
    <div className="last-product">
      <span className="title">
        Last Scanned Product
      </span>

      {product ? (
        <>
          <div className="product-name">
            📦 {product.name}
          </div>

          <div className="product-info">
            <span>
              UPC: {product.upc}
            </span>

            <span>
              Qty: {product.quantity}
            </span>

            <span className="price">
              ${Number(product.price).toFixed(2)}
            </span>
          </div>
        </>
      ) : (
        <div className="last-product-empty">
          No products scanned yet.
        </div>
      )}
    </div>
  );
}