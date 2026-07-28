import React, { useEffect, useMemo, useState } from "react";
import saleService from "../../services/saleService";
import "./Reports.css";

const dateKey = (value) => {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const todayKey = () => dateKey(new Date());

const weekRange = (dateValue) => {
  const date = new Date(`${dateValue}T00:00:00`);
  const weekday = date.getDay() || 7;
  const monday = new Date(date);
  monday.setDate(date.getDate() - weekday + 1);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { startDate: dateKey(monday), endDate: dateKey(sunday) };
};

export default function Reports({ onBack }) {
  const [period, setPeriod] = useState("day");
  const [date, setDate] = useState(todayKey());
  const [sales, setSales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    saleService.getAll()
      .then((result) => setSales(Array.isArray(result) ? result : []))
      .catch(() => setMessage("Could not load sales."))
      .finally(() => setIsLoading(false));
  }, []);

  const range = period === "week"
    ? weekRange(date)
    : { startDate: date, endDate: date };

  const reportSales = useMemo(() => sales.filter((sale) => {
    const saleDate = dateKey(sale.createdAt);
    return saleDate >= range.startDate && saleDate <= range.endDate;
  }), [sales, range.startDate, range.endDate]);

  const summary = useMemo(() => {
    const total = reportSales.reduce((sum, sale) => sum + Number(sale.total), 0);
    const paid = reportSales
      .filter((sale) => sale.status === "PAID")
      .reduce((sum, sale) => sum + Number(sale.total), 0);
    return { total, paid, outstanding: total - paid };
  }, [reportSales]);

  const exportReport = async () => {
    try {
      setIsExporting(true);
      setMessage("");
      const result = await window.electronAPI.exportSalesReport(range);
      if (!result?.canceled) {
        setMessage(`${result.count} sales exported to Excel.`);
      }
    } catch (error) {
      setMessage(error?.message || "The Excel report could not be exported.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="reports-page">
      <div className="reports-container">
        <header className="reports-header">
          <div>
            <button type="button" onClick={onBack}>← Back to POS</button>
            <span>Sales analysis</span>
            <h1>Sales reports</h1>
          </div>
          <button
            type="button"
            className="reports-export-button"
            onClick={exportReport}
            disabled={isExporting}
          >
            {isExporting ? "Exporting..." : "Export to Excel"}
          </button>
        </header>

        <section className="reports-filters">
          <label>
            <span>Report period</span>
            <select value={period} onChange={(event) => setPeriod(event.target.value)}>
              <option value="day">Daily report</option>
              <option value="week">Weekly report</option>
            </select>
          </label>
          <label>
            <span>{period === "week" ? "Any date in the week" : "Date"}</span>
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </label>
          <p>{range.startDate === range.endDate ? range.startDate : `${range.startDate} to ${range.endDate}`}</p>
        </section>

        <section className="reports-summary">
          <article><span>Invoices</span><strong>{reportSales.length}</strong></article>
          <article><span>Total sales</span><strong>${summary.total.toFixed(2)}</strong></article>
          <article><span>Paid</span><strong>${summary.paid.toFixed(2)}</strong></article>
          <article><span>Outstanding</span><strong>${summary.outstanding.toFixed(2)}</strong></article>
        </section>

        <section className="reports-table-wrapper">
          <table className="reports-table">
            <thead><tr><th>Invoice</th><th>Date</th><th>Customer</th><th>Status</th><th>Total</th></tr></thead>
            <tbody>
              {reportSales.map((sale) => <tr key={sale.id}>
                <td>{sale.invoiceNumber}</td>
                <td>{new Date(sale.createdAt).toLocaleDateString()}</td>
                <td>{sale.customerName}</td>
                <td>{sale.status === "PAID" ? "Paid" : "Pending"}</td>
                <td>${Number(sale.total).toFixed(2)}</td>
              </tr>)}
              {!isLoading && reportSales.length === 0 && <tr><td colSpan="5" className="reports-empty">No sales for this period.</td></tr>}
            </tbody>
          </table>
        </section>
        {message && <p className="reports-message">{message}</p>}
      </div>
    </div>
  );
}
