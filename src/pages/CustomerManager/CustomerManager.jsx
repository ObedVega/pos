import React, { useMemo, useState } from "react";
import "./CustomerManager.css";

const initialCustomers = [
  {
    id: 14,
    name: "Bang Tran",
    truckNumber: "14",
    phone: "(619) 555-0101",
    email: "bang@example.com",
  },
  {
    id: 22,
    name: "Johnson Catering",
    truckNumber: "22",
    phone: "(619) 555-0102",
    email: "johnson@example.com",
  },
  {
    id: 32,
    name: "Chiquita Truck",
    truckNumber: "32",
    phone: "(619) 555-0103",
    email: "chiquita@example.com",
  },
];

const emptyForm = {
  id: "",
  name: "",
  truckNumber: "",
  phone: "",
  email: "",
};

export default function CustomerManager({ onClose }) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [mode, setMode] = useState("add");

  const filteredCustomers = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return customers;
    }

    return customers.filter((customer) =>
      `${customer.id} ${customer.name} ${customer.truckNumber} ${customer.phone}`
        .toLowerCase()
        .includes(value)
    );
  }, [customers, search]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleAddNew = () => {
    setSelectedId(null);
    setMode("add");
    setForm(emptyForm);
  };

  const handleSelectCustomer = (customer) => {
    setSelectedId(customer.id);
    setMode("edit");

    setForm({
      id: String(customer.id),
      name: customer.name,
      truckNumber: customer.truckNumber,
      phone: customer.phone,
      email: customer.email,
    });
  };

  const handleSave = (event) => {
    event.preventDefault();

    if (!form.id.trim() || !form.name.trim()) {
      return;
    }

    const normalizedCustomer = {
      id: Number(form.id),
      name: form.name.trim(),
      truckNumber: form.truckNumber.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
    };

    if (mode === "add") {
      const idAlreadyExists = customers.some(
        (customer) => customer.id === normalizedCustomer.id
      );

      if (idAlreadyExists) {
        window.alert("That client number already exists.");
        return;
      }

      setCustomers((current) => [...current, normalizedCustomer]);
      setSelectedId(normalizedCustomer.id);
      setMode("edit");
      return;
    }

    setCustomers((current) =>
      current.map((customer) =>
        customer.id === selectedId ? normalizedCustomer : customer
      )
    );

    setSelectedId(normalizedCustomer.id);
  };

  const handleDelete = () => {
    if (selectedId === null) {
      return;
    }

    const selectedCustomer = customers.find(
      (customer) => customer.id === selectedId
    );

    const confirmed = window.confirm(
      `Delete customer "${selectedCustomer?.name}"?`
    );

    if (!confirmed) {
      return;
    }

    setCustomers((current) =>
      current.filter((customer) => customer.id !== selectedId)
    );

    handleAddNew();
  };

  return (
    <div className="customer-manager-overlay" role="presentation">
      <section
        className="customer-manager-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="customer-manager-title"
      >
        <header className="customer-manager-header">
          <div>
            <span className="customer-manager-eyebrow">
              Customer management
            </span>

            <h2 id="customer-manager-title">Customers</h2>
          </div>

          <button
            type="button"
            className="customer-manager-close"
            onClick={onClose}
            aria-label="Close customer manager"
          >
            ×
          </button>
        </header>

        <div className="customer-manager-body">
          <aside className="customer-manager-list-panel">
            <div className="customer-list-toolbar">
              <input
                type="search"
                placeholder="Search customers..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />

              <button type="button" onClick={handleAddNew}>
                + Add
              </button>
            </div>

            <div className="customer-list">
              {filteredCustomers.map((customer) => (
                <button
                  type="button"
                  key={customer.id}
                  className={`customer-list-item ${
                    selectedId === customer.id ? "selected" : ""
                  }`}
                  onClick={() => handleSelectCustomer(customer)}
                >
                  <span className="customer-list-number">
                    {customer.id}
                  </span>

                  <span className="customer-list-copy">
                    <strong>{customer.name}</strong>
                    <small>Truck {customer.truckNumber || "—"}</small>
                  </span>
                </button>
              ))}

              {filteredCustomers.length === 0 && (
                <div className="customer-list-empty">
                  No customers found.
                </div>
              )}
            </div>
          </aside>

          <main className="customer-manager-form-panel">
            <div className="customer-form-heading">
              <div>
                <span>{mode === "add" ? "New customer" : "Edit customer"}</span>

                <h3>
                  {mode === "add"
                    ? "Add customer"
                    : form.name || "Customer information"}
                </h3>
              </div>
            </div>

            <form className="customer-form" onSubmit={handleSave}>
              <div className="customer-form-grid">
                <label>
                  <span>Client number</span>

                  <input
                    name="id"
                    type="number"
                    min="1"
                    value={form.id}
                    onChange={handleInputChange}
                    required
                  />
                </label>

                <label>
                  <span>Truck number</span>

                  <input
                    name="truckNumber"
                    type="text"
                    value={form.truckNumber}
                    onChange={handleInputChange}
                  />
                </label>

                <label className="customer-form-full">
                  <span>Customer name</span>

                  <input
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleInputChange}
                    required
                  />
                </label>

                <label>
                  <span>Phone</span>

                  <input
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleInputChange}
                  />
                </label>

                <label>
                  <span>Email</span>

                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleInputChange}
                  />
                </label>
              </div>

              <footer className="customer-form-actions">
                <button
                  type="button"
                  className="customer-delete-button"
                  onClick={handleDelete}
                  disabled={mode === "add"}
                >
                  Delete
                </button>

                <div>
                  <button
                    type="button"
                    className="customer-cancel-button"
                    onClick={onClose}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="customer-save-button"
                  >
                    {mode === "add" ? "Add customer" : "Save changes"}
                  </button>
                </div>
              </footer>
            </form>
          </main>
        </div>
      </section>
    </div>
  );
}