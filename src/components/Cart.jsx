import React from "react";
import "./Cart.css";

const formatMoney = (value) =>
  `$${Number(value).toFixed(2)}`;

export default function Cart({
  items,
  selectedItemId,
  onSelectItem,
}) {
  return (
    <div className="cart-card">
      <div className="cart-header">
        <span>Qty</span>
        <span>Item</span>
        <span>Price</span>
        <span>Total</span>
      </div>

      {items.length === 0 ? (
        <div className="cart-empty">
          Waiting for scanned items...
        </div>
      ) : (
        <div className="cart-body">
          {items.map((item) => (
            <button
              type="button"
              key={item.id}
              className={`cart-row ${
                selectedItemId === item.id
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                onSelectItem(item.id)
              }
            >
              <span className="cart-quantity">
                {item.quantity}
              </span>

              <span className="cart-item-details">
                <strong>{item.name}</strong>
                <small>UPC: {item.upc}</small>
              </span>

              <span>
                {formatMoney(item.unitPrice)}
              </span>

              <strong>
                {formatMoney(item.lineTotal)}
              </strong>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}