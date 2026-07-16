import React, { useMemo } from "react";
import "./Totals.css";

const formatMoney = (value) =>
  `$${Number(value).toFixed(2)}`;

export default function Totals({
  items,
  yardFee = 0,
}) {
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
      items.length > 0
        ? Number(yardFee) || 0
        : 0;

    const total =
      subtotal +
      tax +
      safeYardFee;

    return {
      itemCount,
      subtotal,
      tax,
      yardFee: safeYardFee,
      total,
    };
  }, [items, yardFee]);

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

        <strong>
          {formatMoney(totals.subtotal)}
        </strong>
      </div>

      <div className="total-row">
        <span>Tax</span>

        <strong>
          {formatMoney(totals.tax)}
        </strong>
      </div>

      <div className="total-row">
        <span>Yard Fee</span>

        <strong>
          {formatMoney(totals.yardFee)}
        </strong>
      </div>

      <div className="grand-total">
        <span>Total</span>

        <h1>
          {formatMoney(totals.total)}
        </h1>
      </div>
    </div>
  );
}