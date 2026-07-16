import React, { useEffect, useMemo, useState } from "react";
import "./AdjustInventory.css";

export default function AdjustInventory({
  open,
  product,
  onClose,
  onSave,
}) {
  const [newStock, setNewStock] = useState("");
  const [reason, setReason] = useState("inventory-count");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !product) {
      return;
    }

    setNewStock(String(product.stock ?? 0));
    setReason("inventory-count");
    setNotes("");
    setError("");
  }, [open, product]);

  const currentStock = Number(product?.stock ?? 0);

  const parsedNewStock =
    newStock === ""
      ? null
      : Number(newStock);

  const difference = useMemo(() => {
    if (
      parsedNewStock === null ||
      Number.isNaN(parsedNewStock)
    ) {
      return 0;
    }

    return parsedNewStock - currentStock;
  }, [parsedNewStock, currentStock]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!product) {
      return;
    }

    if (
      parsedNewStock === null ||
      Number.isNaN(parsedNewStock)
    ) {
      setError("Enter a valid stock quantity.");
      return;
    }

    if (parsedNewStock < 0) {
      setError("Stock cannot be less than zero.");
      return;
    }

    if (!Number.isInteger(parsedNewStock)) {
      setError("Stock must be a whole number.");
      return;
    }

    if (!reason) {
      setError("Select a reason.");
      return;
    }

    onSave({
      productId: product.upc,
      upc: product.upc,
      productName: product.name,
      previousStock: currentStock,
      newStock: parsedNewStock,
      difference,
      reason,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    });
  };

  if (!open || !product) {
    return null;
  }

  const differenceLabel =
    difference > 0
      ? `+${difference}`
      : String(difference);

  const differenceClass =
    difference > 0
      ? "positive"
      : difference < 0
        ? "negative"
        : "neutral";

  return (
    <div className="adjust-inventory-overlay">
      <section
        className="adjust-inventory-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="adjust-inventory-title"
      >
        <header className="adjust-inventory-header">
          <div>
            <span className="adjust-inventory-eyebrow">
              Inventory management
            </span>

            <h2 id="adjust-inventory-title">
              Adjust Inventory
            </h2>
          </div>

          <button
            type="button"
            className="adjust-inventory-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <form
          className="adjust-inventory-form"
          onSubmit={handleSubmit}
        >
          <div className="adjust-product-summary">
            <div>
              <span>Product</span>
              <strong>{product.name}</strong>
              <small>UPC: {product.upc}</small>
            </div>

            <div className="adjust-current-stock">
              <span>Physical Count</span>
              <strong>{currentStock}</strong>
            </div>
          </div>

          <div className="adjust-stock-grid">
            <div className="adjust-field">
              <label htmlFor="adjust-new-stock">
                New stock
              </label>

              <input
                id="adjust-new-stock"
                type="number"
                min="0"
                step="1"
                value={newStock}
                onChange={(event) => {
                  setNewStock(event.target.value);
                  setError("");
                }}
                autoFocus
              />
            </div>

            <div className="adjust-difference-card">
              <span>Difference</span>

              <strong
                className={`adjust-difference-value ${differenceClass}`}
              >
                {differenceLabel}
              </strong>

              <small>units</small>
            </div>
          </div>

          <div className="adjust-field">
            <label htmlFor="adjust-reason">
              Reason
            </label>

            <select
              id="adjust-reason"
              value={reason}
              onChange={(event) => {
                setReason(event.target.value);
                setError("");
              }}
            >
              <option value="inventory-count">
                Inventory Count
              </option>

              <option value="damaged">
                Damaged
              </option>

              <option value="lost">
                Lost
              </option>

              <option value="correction">
                Correction
              </option>

              <option value="other">
                Other
              </option>
            </select>
          </div>

          <div className="adjust-field">
            <label htmlFor="adjust-notes">
              Notes
            </label>

            <textarea
              id="adjust-notes"
              rows="4"
              value={notes}
              placeholder="Add an optional note..."
              onChange={(event) =>
                setNotes(event.target.value)
              }
            />
          </div>

          {error && (
            <div
              className="adjust-inventory-error"
              role="alert"
            >
              {error}
            </div>
          )}

          <footer className="adjust-inventory-actions">
            <button
              type="button"
              className="adjust-secondary-button"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="adjust-primary-button"
            >
              Save Adjustment
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}