import React from "react";
import "./InvoicePreview.css";

export default function InvoicePreview({
  sale,
  onClose,
  onPrint,
  onEmail,
}) {
  if (!sale) return null;

  return (
    <div className="invoice-overlay">
      <div className="invoice-window">

        <div className="invoice-header">
          <div>
            <span>Invoice</span>
            <h2>{sale.invoiceNumber}</h2>
          </div>

          <button
            className="close-btn"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="invoice-company">
          <h3>Chiquita Catering</h3>
          <p>Warehouse Management System</p>
        </div>

        <div className="invoice-info">

          <div>
            <strong>Customer</strong>
            <p>{sale.customerName}</p>
            <p>#{sale.customerId}</p>
          </div>

          <div>
            <strong>Status</strong>
            <p>{sale.status}</p>

            <strong>Date</strong>
            <p>
              {new Date(
                sale.createdAt
              ).toLocaleDateString()}
            </p>
          </div>

        </div>

        <table className="invoice-table">

          <thead>
            <tr>
              <th>Qty</th>
              <th>Item</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>

          <tbody>

            {sale.items.map((item) => (
              <tr key={item.productId}>
                <td>{item.quantity}</td>

                <td>{item.name}</td>

                <td>
                  $
                  {item.unitPrice.toFixed(2)}
                </td>

                <td>
                  $
                  {item.lineTotal.toFixed(2)}
                </td>
              </tr>
            ))}

          </tbody>

        </table>
 

<div className="invoice-totals">
  <div>
    Subtotal
    <span>
      ${Number(sale.subtotal).toFixed(2)}
    </span>
  </div>

  <div>
    Yard Fee
    <span>
      ${Number(sale.yardFee).toFixed(2)}
    </span>
  </div>

  <div>
    Tax
    <span>
      ${Number(sale.tax).toFixed(2)}
    </span>
  </div>

  <div className="grand-total">
    Total
    <span>
      ${Number(sale.total).toFixed(2)}
    </span>
  </div>
</div>

{sale.dailyNotice && (
  <section className="invoice-notice">
    <h4>Daily Notice</h4>
    <p>{sale.dailyNotice}</p>
  </section>
)}

<div className="invoice-actions">
  <button
    type="button"
    className="invoice-btn invoice-btn-secondary"
    onClick={onClose}
  >
    Close
  </button>

  <button
    type="button"
    className="invoice-btn invoice-btn-primary"
    onClick={onPrint}
  >
    Print
  </button>

  <button
    type="button"
    className="invoice-btn invoice-btn-success"
    onClick={onEmail}
  >
    Email Invoice
  </button>
</div>

      </div>
    </div>
  );
}