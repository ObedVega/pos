import React from "react";
import "./Cart.css";

const formatMoney = (value) =>
  `$${Number(value).toFixed(2)}`;

export default function Cart({
  items,
  selectedItemId,
  onSelectItem,
  onUpdateQuantity,
  onRemoveItem,
}) {
  return (
    <div className="cart-card">
      <div className="cart-header">
        <span>Qty</span>
        <span>Item</span>
        <span>Price</span>
        <span>Total</span>
        <span>Actions</span>
      </div>

      {items.length === 0 ? (
        <div className="cart-empty">
          Waiting for scanned items...
        </div>
      ) : (
        <div className="cart-body">
          {items.map((item) => (
            <div
              key={item.id}
              className={`cart-row ${
                selectedItemId === item.id
                  ? "selected"
                  : ""
              }`}
              onClick={() => onSelectItem(item.id)}
            >
              <span className="cart-quantity-controls">
                <button
                  type="button"
                  aria-label={`Decrease ${item.name}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onUpdateQuantity(item.id, item.quantity - 1);
                  }}
                >−</button>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  aria-label={`Quantity for ${item.name}`}
                  onClick={(event) => event.stopPropagation()}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (value !== "") onUpdateQuantity(item.id, value);
                  }}
                />
                <button
                  type="button"
                  aria-label={`Increase ${item.name}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onUpdateQuantity(item.id, item.quantity + 1);
                  }}
                >+</button>
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
              <button
                type="button"
                className="cart-remove-button"
                onClick={(event) => {
                  event.stopPropagation();
                  onRemoveItem(item.id);
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
