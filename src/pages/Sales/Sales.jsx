import React, { useEffect, useMemo, useRef, useState } from "react";

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
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const requestId = useRef(0);

  useEffect(() => {
    const currentRequest = ++requestId.current;
    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError("");
      try {
        const result = await saleService.getPage({ search, date: selectedDate });
        if (currentRequest !== requestId.current) return;
        setSales(Array.isArray(result?.sales) ? result.sales : []);
        setHasMore(Boolean(result?.hasMore));
      } catch (loadError) {
        if (currentRequest !== requestId.current) return;
        console.error("Could not load sales:", loadError);
        setSales([]);
        setHasMore(false);
        setError(loadError?.message || "Could not load sales.");
      } finally {
        if (currentRequest === requestId.current) setIsLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      requestId.current++;
    };
  }, [search, selectedDate]);

  const loadMore = async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    setError("");
    try {
      const result = await saleService.getPage({
        search,
        date: selectedDate,
        offset: sales.length,
      });
      setSales((current) => [...current, ...(result?.sales || [])]);
      setHasMore(Boolean(result?.hasMore));
    } catch (loadError) {
      console.error("Could not load more sales:", loadError);
      setError(loadError?.message || "Could not load more sales.");
    } finally {
      setIsLoading(false);
    }
  };

  const openSale = async (sale) => {
    setError("");
    try {
      const fullSale = await saleService.getById(sale.id);
      if (!fullSale) throw new Error("Sale not found.");
      setSelectedSale(fullSale);
    } catch (loadError) {
      console.error("Could not open sale:", loadError);
      setError(loadError?.message || "Could not open sale.");
    }
  };

  const formatDateKey = (value) => {
    const date = new Date(value);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const dayGroups = useMemo(() => Object.entries(
    sales.reduce((groups, sale) => {
      const dateKey = formatDateKey(sale.closedAt || sale.createdAt);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(sale);
      return groups;
    }, {})
  ), [sales]);

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

        {error && <div className="sales-load-error" role="alert">{error}</div>}

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
              <th>Collection date</th>
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
                  {new Date(sale.closedAt || sale.createdAt).toLocaleString([], {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </td>

                <td>
                  {sale.dueDate
                    ? new Date(`${String(sale.dueDate).slice(0, 10)}T00:00:00`).toLocaleDateString()
                    : "—"}
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
                      : sale.status === "OPEN"
                        ? "Open Account"
                        : "Pending Payment"}
                  </span>
                </td>

                <td>
                  <div className="sales-actions">
                    <button
                      type="button"
                      onClick={() => openSale(sale)}
                    >
                      View
                    </button>

                    {sale.status !== "PAID" && sale.status !== "OPEN" && (
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

  {dayGroups.length === 0 && !isLoading && !error && (
    <div className="sales-empty">
      No sales found.
    </div>
  )}
  {isLoading && <div className="sales-loading">Loading sales...</div>}
  {hasMore && !isLoading && (
    <button type="button" className="sales-load-more" onClick={loadMore}>
      Load more sales
    </button>
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
