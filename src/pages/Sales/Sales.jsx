import React, { useEffect, useMemo, useState } from "react";

import InvoicePreview from "../../components/InvoicePreview/InvoicePreview";
import ReceivePayment from "../../components/ReceivePayment/ReceivePayment";

import saleService from "../../services/saleService";

import "./Sales.css";

export default function Sales({ onBack }) {
  const [sales, setSales] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
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

  const formatDateKey = (value) => {
    const date = new Date(value);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const filteredSales = sales.filter((sale) => {
    const value = search.toLowerCase();
    const matchesDate = !selectedDate || formatDateKey(sale.createdAt) === selectedDate;

    return matchesDate && (
      sale.invoiceNumber
        .toLowerCase()
        .includes(value) ||
      sale.customerName
        .toLowerCase()
        .includes(value)
    );
  });

  const dayGroups = useMemo(() => Object.entries(
    filteredSales.reduce((groups, sale) => {
      const dateKey = formatDateKey(sale.createdAt);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(sale);
      return groups;
    }, {})
  ), [filteredSales]);

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

          <label className="sales-date-filter">
            <span>Date</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(event) =>
                setSelectedDate(event.target.value)
              }
            />
          </label>

          {selectedDate && (
            <button
              type="button"
              className="sales-clear-date"
              onClick={() => setSelectedDate("")}
            >
              All dates
            </button>
          )}

        </div>

<div className="sales-table-wrapper">
  {dayGroups.map(([dateKey, daySales]) => {
    const dailyTotal = daySales.reduce(
      (sum, sale) => sum + Number(sale.total),
      0
    );

    return (
      <div key={dateKey} className="sales-day-block">

        {/* 🔥 HEADER DEL DÍA (FUERA DE LA TABLA) */}
        <div className="sales-day-header">
          <div>
            <strong>
              {new Date(`${dateKey}T00:00:00`).toLocaleDateString(
                undefined,
                {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }
              )}
            </strong>
          </div>

          <div>
            {daySales.length} invoice{daySales.length === 1 ? "" : "s"}
          </div>

          <div>
            <strong>Daily total: ${dailyTotal.toFixed(2)}</strong>
          </div>
        </div>

        {/* 🔥 TABLA */}
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
            {daySales.map((sale) => (
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
                      onClick={() => setSelectedSale(sale)}
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
          </tbody>
        </table>
      </div>
    );
  })}

  {dayGroups.length === 0 && (
    <div className="sales-empty">
      No sales found.
    </div>
  )}
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
