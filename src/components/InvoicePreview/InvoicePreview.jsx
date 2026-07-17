import React from "react";
import "./InvoicePreview.css";

export default function InvoicePreview({
  sale,
  onClose,
  onPrint,
  onEmail,
}) {
  const [isSavingPdf, setIsSavingPdf] =
    React.useState(false);

  if (!sale) {
    return null;
  }

  const formatMoney = (value) =>
    `$${Number(value || 0).toFixed(2)}`;

  const formatDate = (value) =>
    new Date(value).toLocaleDateString(
      "en-US",
      {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      }
    );

  const businessLocation = [
    sale.businessCity,
    sale.businessState,
    sale.businessZipCode,
  ]
    .filter(Boolean)
    .join(", ")
    .replace(", ", ", ");

  const isPaid =
    sale.status === "PAID" ||
    sale.paymentStatus === "PAID";

  const handleSavePdf = async () => {
    if (
      isSavingPdf ||
      !window.electronAPI?.saveInvoicePdf
    ) {
      return;
    }

    try {
      setIsSavingPdf(true);

      await window.electronAPI.saveInvoicePdf(
        sale.invoiceNumber
      );
    } catch (error) {
      console.error(
        "Could not save invoice PDF:",
        error
      );
    } finally {
      setIsSavingPdf(false);
    }
  };

  return (
    <div className="invoice-overlay">
      <div className="invoice-window">
        <button
          type="button"
          className="close-btn"
          onClick={onClose}
          aria-label="Close invoice"
        >
          ×
        </button>

        <article className="invoice-document">
<header className="invoice-document-header">
  <div className="invoice-business-block">
    <div className="invoice-logo-wrapper">
      {sale.businessLogoUrl ? (
        <img
          className="invoice-company-logo"
          src={sale.businessLogoUrl}
          alt={`${sale.businessName} logo`}
        />
      ) : (
        <div className="invoice-logo-placeholder">
          LOGO
        </div>
      )}
    </div>

    <div className="invoice-seller-details">
      <h1>
        {sale.businessName ||
          "Chiquita Catering"}
      </h1>

      <div className="invoice-business-contact">
        {sale.businessAddressLine1 && (
          <p>{sale.businessAddressLine1}</p>
        )}

        {sale.businessAddressLine2 && (
          <p>{sale.businessAddressLine2}</p>
        )}

        {businessLocation && (
          <p>{businessLocation}</p>
        )}

        {sale.businessPhone && (
          <p>
            <strong>Phone:</strong>{" "}
            {sale.businessPhone}
          </p>
        )}

        {sale.businessPermitNumber && (
          <p>
            <strong>Permit:</strong>{" "}
            {sale.businessPermitNumber}
          </p>
        )}

        {sale.businessEmail && (
          <p>{sale.businessEmail}</p>
        )}

        {sale.businessWebsite && (
          <p>{sale.businessWebsite}</p>
        )}
      </div>
    </div>
  </div>

            <div className="invoice-title-block">
              <h2>INVOICE</h2>

              <dl>
                <div>
                  <dt>Invoice number</dt>
                  <dd>{sale.invoiceNumber}</dd>
                </div>

                <div>
                  <dt>Invoice date</dt>
                  <dd>
                    {formatDate(sale.createdAt)}
                  </dd>
                </div>

                <div>
                  <dt>Payment terms</dt>
                  <dd>
                    {sale.paymentTerms ||
                      "Due upon receipt"}
                  </dd>
                </div>

                <div>
                  <dt>Status</dt>
                  <dd
                    className={
                      isPaid
                        ? "invoice-status-paid"
                        : "invoice-status-pending"
                    }
                  >
                    {isPaid
                      ? "PAID"
                      : "PAYMENT DUE"}
                  </dd>
                </div>
              </dl>
            </div>
          </header>

          <section className="invoice-parties">
            <div>
              <span className="invoice-section-label">
                Bill to
              </span>

              <strong>
                {sale.customerName}
              </strong>

              <p>
                Customer #{sale.customerId}
              </p>

              {sale.customerPhone && (
                <p>{sale.customerPhone}</p>
              )}

              {sale.customerEmail && (
                <p>{sale.customerEmail}</p>
              )}
            </div>

            <div className="invoice-balance-card">
              <span>Balance due</span>

              <strong>
                {formatMoney(
                  sale.balanceDue ??
                    sale.total
                )}
              </strong>
            </div>
          </section>

          <table className="invoice-table">
            <thead>
              <tr>
                <th className="invoice-column-qty">
                  Qty
                </th>

                <th>Description</th>

                <th className="invoice-column-money">
                  Unit price
                </th>

                <th className="invoice-column-money">
                  Amount
                </th>
              </tr>
            </thead>

            <tbody>
              {sale.items.map((item) => (
                <tr key={item.productId}>
                  <td>{item.quantity}</td>

                  <td>
                    <strong>{item.name}</strong>

                    {item.upc && (
                      <small>
                        UPC: {item.upc}
                      </small>
                    )}
                  </td>

                  <td className="invoice-money">
                    {formatMoney(
                      item.unitPrice
                    )}
                  </td>

                  <td className="invoice-money">
                    {formatMoney(
                      item.lineTotal
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <section className="invoice-summary-section">
            <div className="invoice-payment-details">
              <span className="invoice-section-label">
                Payment information
              </span>

              <p>
                Status:{" "}
                <strong>
                  {isPaid
                    ? "Paid"
                    : "Pending payment"}
                </strong>
              </p>

              {sale.paymentMethod && (
                <p>
                  Method:{" "}
                  <strong>
                    {sale.paymentMethod}
                  </strong>
                </p>
              )}

              {sale.paidAt && (
                <p>
                  Paid on:{" "}
                  <strong>
                    {formatDate(sale.paidAt)}
                  </strong>
                </p>
              )}
            </div>

            <div className="invoice-totals">
              <div>
                <span>Subtotal</span>
                <strong>
                  {formatMoney(sale.subtotal)}
                </strong>
              </div>

              <div>
                <span>Yard fee</span>
                <strong>
                  {formatMoney(sale.yardFee)}
                </strong>
              </div>

              <div>
                <span>Sales tax</span>
                <strong>
                  {formatMoney(sale.tax)}
                </strong>
              </div>

              <div className="invoice-total-row">
                <span>Total</span>
                <strong>
                  {formatMoney(sale.total)}
                </strong>
              </div>

              <div className="invoice-balance-row">
                <span>Balance due</span>
                <strong>
                  {formatMoney(
                    sale.balanceDue ??
                      sale.total
                  )}
                </strong>
              </div>
            </div>
          </section>

          {sale.dailyNotice && (
            <section className="invoice-notice">
              <h3>Terms and notices</h3>
              <p>{sale.dailyNotice}</p>
            </section>
          )}

          <footer className="invoice-document-footer">
            <p>
              Keep this invoice with your
              business records.
            </p>

            <p>
              Invoice {sale.invoiceNumber}
            </p>
          </footer>
        </article>

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
            className="invoice-btn invoice-btn-primary"
            onClick={handleSavePdf}
            disabled={isSavingPdf}
          >
            {isSavingPdf
              ? "Saving PDF..."
              : "Save PDF"}
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