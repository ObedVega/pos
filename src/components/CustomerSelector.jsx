import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import customerService from "../services/customerService";
import "./CustomerSelector.css";


export default function CustomerSelector({
  selectedCustomerId,
  onCustomerChange,
}) {
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState([]);

useEffect(() => {
  const loadCustomers = async () => {
    try {
      const result = await customerService.getAll();
      setCustomers(result);
    } catch (error) {
      console.error(
        "Could not load customers:",
        error
      );
    }
  };

  loadCustomers();
}, []);
const filteredCustomers = useMemo(() => {
  const normalizedSearch = search
    .trim()
    .toLowerCase();

  if (!normalizedSearch) {
    return customers;
  }

  return customers.filter((customer) =>
    `
      ${customer.id}
      ${customer.name ?? ""}
      ${customer.permitNumber ?? ""}
      ${customer.phone ?? ""}
    `
      .toLowerCase()
      .includes(normalizedSearch)
  );
}, [customers, search]);

  const selectedCustomer = customers.find(
    (customer) =>
      String(customer.id) ===
      String(selectedCustomerId)
  );

  return (
    <div className="customer-card">
      <div className="customer-field">
        <label htmlFor="customer-search">
          Search customer
        </label>

        <input
          id="customer-search"
          className="customer-search"
          type="text"
          placeholder="Search by name, customer number or permit..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

      </div>

   

<div className="customer-field">
  <label htmlFor="customer-select">
    Customer list
  </label>

<select
  id="customer-select"
  className="customer-select"
  value={selectedCustomerId}
  size={
    search.trim()
      ? Math.min(filteredCustomers.length + 1, 6)
      : 1
  }
  onChange={(event) => {
    onCustomerChange(event.target.value);
    setSearch("");
  }}
>
  <option value="">
    Select a customer...
  </option>

  {filteredCustomers.map((customer) => (
    <option
      key={customer.id}
      value={customer.id}
    >
      {customer.name} - Permit {customer.permitNumber || "—"}
    </option>
  ))}
</select>
</div>
      {selectedCustomer ? (
        <div className="customer-details">
          <div className="customer-details-header">
            <div>
              <span className="customer-details-label">
                Selected customer
              </span>

              <h3>{selectedCustomer.name}</h3>
            </div>

            <div className="customer-number-badge">
              {selectedCustomer.id}
            </div>
          </div>

          <div className="customer-details-grid">
            <div>
              <span>Client number</span>
              <strong>
                #{selectedCustomer.id}
              </strong>
            </div>

            <div>
              <span>Permit number</span>
              <strong>
                {selectedCustomer.permitNumber}
              </strong>
            </div>

            <div>
              <span>Phone</span>
              <strong>
                {selectedCustomer.phone}
              </strong>
            </div>
          </div>
        </div>
      ) : (
        <div className="customer-empty">
          Select a customer to view their
          information.
        </div>
      )}
    </div>
  );
}