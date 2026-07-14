import React, { useMemo, useState } from "react";
import "./CustomerSelector.css";

const customers = [
  {
    id: 14,
    name: "Bang Tran",
    truckNumber: "14",
    phone: "(619) 555-0101",
  },
  {
    id: 22,
    name: "Johnson Catering",
    truckNumber: "22",
    phone: "(619) 555-0102",
  },
  {
    id: 32,
    name: "Chiquita Truck",
    truckNumber: "32",
    phone: "(619) 555-0103",
  },
  {
    id: 45,
    name: "Maria's Food Truck",
    truckNumber: "45",
    phone: "(619) 555-0104",
  },
];

export default function CustomerSelector() {
  const [search, setSearch] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");

  const filteredCustomers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return customers;
    }

    return customers.filter((customer) =>
      `${customer.id} ${customer.name} ${customer.truckNumber}`
        .toLowerCase()
        .includes(normalizedSearch)
    );
  }, [search]);

  const selectedCustomer = customers.find(
    (customer) => String(customer.id) === selectedCustomerId
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
          placeholder="Search by name, number or truck..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
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
          onChange={(event) => setSelectedCustomerId(event.target.value)}
        >
          <option value="">
            Select a customer...
          </option>

          {filteredCustomers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              #{customer.id} — {customer.name}
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
              <strong>#{selectedCustomer.id}</strong>
            </div>

            <div>
              <span>Truck number</span>
              <strong>{selectedCustomer.truckNumber}</strong>
            </div>

            <div>
              <span>Phone</span>
              <strong>{selectedCustomer.phone}</strong>
            </div>

          </div>

        </div>
      ) : (
        <div className="customer-empty">
          Select a customer to view their information.
        </div>
      )}

    </div>
  );
}