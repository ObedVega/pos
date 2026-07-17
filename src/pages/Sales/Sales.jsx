import React, { useEffect, useState } from "react";

import InvoicePreview from "../../components/InvoicePreview/InvoicePreview";
import ReceivePayment from "../../components/ReceivePayment/ReceivePayment";

import saleService from "../../services/saleService";

import "./Sales.css";

export default function Sales({ onBack }) {
  const [sales, setSales] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedSale, setSelectedSale] =
    useState(null);
  const [paymentSale, setPaymentSale] = useState(null);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    const result = await saleService.getAll();
    setSales(result);
  };

  const filteredSales = sales.filter((sale) => {
    const value = search.toLowerCase();

    return (
      sale.invoiceNumber
        .toLowerCase()
        .includes(value) ||
      sale.customerName
        .toLowerCase()
        .includes(value)
    );
  });

  const openReceivePayment = (sale) => {
  setPaymentSale(sale);
};

const closeReceivePayment = () => {
  setPaymentSale(null);
};

const handleConfirmPayment = async ({
  saleId,
  paymentMethod,
}) => {
  try {
    const updatedSale =
      await saleService.markAsPaid(
        saleId,
        paymentMethod
      );

    setSales((currentSales) =>
      currentSales.map((sale) =>
        sale.id === updatedSale.id
          ? updatedSale
          : sale
      )
    );

    setSelectedSale((currentSale) => {
      if (
        !currentSale ||
        currentSale.id !== updatedSale.id
      ) {
        return currentSale;
      }

      return updatedSale;
    });

    closeReceivePayment();
  } catch (error) {
    console.error(
      "Could not receive payment:",
      error
    );
  }
};

  return (
    <div className="sales-page">
      <div className="sales-container">

        <div className="sales-toolbar">

          <button onClick={onBack}>
            ← Back to POS
          </button>

          <input
            type="text"
            placeholder="Search invoice or customer..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

<div className="sales-table-wrapper">
  <table className="sales-table">
    <thead>
      <tr>
        <th>Invoice</th>
        <th>Customer</th>
        <th>Date</th>
        <th>Total</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>

    <tbody>
      {filteredSales.map((sale) => (
        <tr key={sale.id}>
          <td>{sale.invoiceNumber}</td>
          <td>{sale.customerName}</td>

          <td>
            {new Date(sale.createdAt).toLocaleDateString()}
          </td>

          <td>
            ${Number(sale.total).toFixed(2)}
          </td>

          <td>
             <span
    className={`sale-status ${
      sale.status === "PAID"
        ? "paid"
        : "pending"
    }`}
  >
    {sale.status === "PAID"
      ? "Paid"
      : "Pending Payment"}
  </span>
          </td>

          <td>
  <div className="sales-actions">
    <button
      type="button"
      onClick={() =>
        setSelectedSale(sale)
      }
    >
      View
    </button>

    {sale.status !== "PAID" && (
      <button
        type="button"
        className="sales-payment-button"
        onClick={() =>
          openReceivePayment(sale)
        }
      >
        Receive Payment
      </button>
    )}
  </div>
          </td>
        </tr>
      ))}

      {filteredSales.length === 0 && (
        <tr>
          <td
            colSpan="6"
            className="sales-empty"
          >
            No sales found.
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>

      </div>

      <InvoicePreview
        sale={selectedSale}
        onClose={() =>
          setSelectedSale(null)
        }
        onPrint={() => window.print()}
        onEmail={() => {}}
      />
<ReceivePayment
  open={Boolean(paymentSale)}
  sale={paymentSale}
  onClose={closeReceivePayment}
  onConfirm={handleConfirmPayment}
/>
    </div>
  );
}