import React, { useMemo, useState } from "react";
import "./Totals.css";

const formatMoney = (value) => `$${Number(value).toFixed(2)}`;

export default function Totals({
  items,
  yardFee = 0,
  isYardFeeWaived = false,
  onYardFeeOverride,
  onCompleteSale,
}) {
  const [isEditingYardFee, setIsEditingYardFee] = useState(false);
  const [yardFeeInput, setYardFeeInput] = useState("");

  const totals = useMemo(() => {
    const itemCount = items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    const subtotal = items.reduce(
      (sum, item) => sum + item.lineTotal,
      0
    );

    const tax = 0;

    const safeYardFee =
      items.length > 0 ? Number(yardFee) || 0 : 0;

    const total = subtotal + tax + safeYardFee;

    return {
      itemCount,
      subtotal,
      tax,
      yardFee: safeYardFee,
      total,
    };
  }, [items, yardFee]);

  const startEditingYardFee = () => {
    setYardFeeInput(totals.yardFee.toFixed(2));
    setIsEditingYardFee(true);
  };

  const cancelEditingYardFee = () => {
    setIsEditingYardFee(false);
  };

  const applyYardFeeInput = () => {
    const parsed = Number(yardFeeInput);
    const safeValue = Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
    onYardFeeOverride(safeValue);
    setIsEditingYardFee(false);
  };

  const handleEditKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      applyYardFeeInput();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      cancelEditingYardFee();
    }
  };

  const handleWaiveYardFee = () => {
    onYardFeeOverride(0);
    setIsEditingYardFee(false);
  };

  const handleResetYardFee = () => {
    // null le indica al padre que vuelva a calcular el yard fee
    // automaticamente segun las reglas normales.
    onYardFeeOverride(null);
    setIsEditingYardFee(false);
  };

  return (
    <div className="totals-card">
      <div className="totals-header">
        <h2>Sale Summary</h2>
      </div>

      <div className="total-row">
        <span>Items</span>
        <strong>{totals.itemCount}</strong>
      </div>

      <div className="total-row">
        <span>Subtotal</span>
        <strong>{formatMoney(totals.subtotal)}</strong>
      </div>

      <div className="total-row">
        <span>Tax</span>
        <strong>{formatMoney(totals.tax)}</strong>
      </div>

      <div className="total-row yard-fee-row">
        <span>
          Yard Fee
          {isYardFeeWaived && (
            <em className="yard-fee-waived-tag">Waived</em>
          )}
        </span>

        {isEditingYardFee ? (
          <div className="yard-fee-edit">
            <input
              type="number"
              min="0"
              step="0.01"
              className="yard-fee-input"
              value={yardFeeInput}
              onChange={(event) => setYardFeeInput(event.target.value)}
              onKeyDown={handleEditKeyDown}
              autoFocus
            />
            <button type="button" onClick={applyYardFeeInput}>
              Save
            </button>
            <button type="button" onClick={cancelEditingYardFee}>
              Cancel
            </button>
          </div>
        ) : (
          <strong>{formatMoney(totals.yardFee)}</strong>
        )}
      </div>

      {!isEditingYardFee && (
        <div className="yard-fee-actions">
          <button
            type="button"
            className="yard-fee-trigger"
            onClick={startEditingYardFee}
          >
            Edit Yard Fee
          </button>

          {totals.yardFee > 0 ? (
            <button
              type="button"
              className="yard-fee-trigger"
              onClick={handleWaiveYardFee}
            >
              Waive
            </button>
          ) : (
            <button
              type="button"
              className="yard-fee-trigger"
              onClick={handleResetYardFee}
            >
              Auto
            </button>
          )}
        </div>
      )}

      <div className="grand-total">
        <span>Total</span>
        <h1>{formatMoney(totals.total)}</h1>
      </div>

      <button
        type="button"
        className="complete-sale-button"
        onClick={onCompleteSale}
      >
        Complete Sale
      </button>
    </div>
  );
}