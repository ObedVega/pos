import React, { useEffect, useState } from "react";
import "./ReceivePayment.css";

export default function ReceivePayment({
  open,
  sale,
  onClose,
  onConfirm,
}) {
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setPaymentMethod("CASH");
    setIsSaving(false);
  }, [open, sale]);

  if (!open || !sale) {
    return null;
  }

  const amountDue = Number(
    sale.balanceDue ?? sale.total ?? 0
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSaving) {
      return;
    }

    try {
      setIsSaving(true);

      await onConfirm({
        saleId: sale.id,
        paymentMethod,
        amountPaid: amountDue,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="receive-payment-overlay">
      <section
        className="receive-payment-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="receive-payment-title"
      >
        <header className="receive-payment-header">
          <div>
            <span className="receive-payment-eyebrow">
              Payment
            </span>

            <h2 id="receive-payment-title">
              Receive Payment
            </h2>
          </div>

          <button
            type="button"
            className="receive-payment-close"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close payment window"
          >
            ×
          </button>
        </header>

        <form
          className="receive-payment-content"
          onSubmit={handleSubmit}
        >
          <div className="receive-payment-summary">
            <div>
              <span>Invoice</span>
              <strong>{sale.invoiceNumber}</strong>
            </div>

            <div>
              <span>Customer</span>
              <strong>{sale.customerName}</strong>
            </div>
          </div>

          <div className="receive-payment-amount">
            <span>Amount due</span>

            <strong>
              ${amountDue.toFixed(2)}
            </strong>
          </div>

          <fieldset className="payment-methods">
            <legend>Payment method</legend>

            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="CASH"
                checked={paymentMethod === "CASH"}
                onChange={(event) =>
                  setPaymentMethod(event.target.value)
                }
              />

              <span>
                <strong>Cash</strong>
                <small>Payment received in cash</small>
              </span>
            </label>

            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="CARD"
                checked={paymentMethod === "CARD"}
                onChange={(event) =>
                  setPaymentMethod(event.target.value)
                }
              />

              <span>
                <strong>Credit / Debit Card</strong>
                <small>Payment processed by card</small>
              </span>
            </label>

            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="CHECK"
                checked={paymentMethod === "CHECK"}
                onChange={(event) =>
                  setPaymentMethod(event.target.value)
                }
              />

              <span>
                <strong>Check</strong>
                <small>Payment received by check</small>
              </span>
            </label>

            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="OTHER"
                checked={paymentMethod === "OTHER"}
                onChange={(event) =>
                  setPaymentMethod(event.target.value)
                }
              />

              <span>
                <strong>Other</strong>
                <small>Another payment method</small>
              </span>
            </label>
          </fieldset>

          <footer className="receive-payment-actions">
            <button
              type="button"
              className="receive-payment-secondary"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="receive-payment-primary"
              disabled={isSaving}
            >
              {isSaving
                ? "Saving..."
                : "Confirm Payment"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}