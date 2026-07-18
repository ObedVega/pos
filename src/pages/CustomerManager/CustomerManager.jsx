import React, { useEffect, useMemo, useState } from "react";
import "./CustomerManager.css";
import customerService from "../../services/customerService";

const emptyForm = {
  id: "",
  name: "",
  permitNumber: "",
  phone: "",
  email: "",
};

export default function CustomerManager({ onClose }) {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [mode, setMode] = useState("add");
  const [isSaving, setIsSaving] = useState(false);

useEffect(() => {
  const loadCustomers = async () => {
    try {
      const result = await customerService.getAll();

      setCustomers(
        Array.isArray(result)
          ? result
          : []
      );
    } catch (error) {
      console.error(
        "Could not load customers:",
        error
      );

      setCustomers([]);
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
    `${customer.id} ${customer.name} ${customer.permitNumber ?? ""}`
      .toLowerCase()
      .includes(normalizedSearch)
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
      permitNumber: customer.permitNumber,
      phone: customer.phone,
      email: customer.email,
    });
  };

const handleSave = async (event) => {
  event.preventDefault();

  if (!form.name.trim()) {
    window.alert("Customer name is required.");
    return;
  }

  const customerData = {
    name: form.name.trim(),
    permitNumber: form.permitNumber.trim(),
    phone: form.phone.trim(),
    email: form.email.trim(),
  };

  try {
    setIsSaving(true);

    let savedCustomer;

    if (mode === "add") {
      // El backend asignará automáticamente el ID.
      savedCustomer =
        await customerService.create(customerData);

      setCustomers((current) => [
        ...current,
        savedCustomer,
      ]);
    } else {
      // selectedId identifica al cliente.
      // No permitimos cambiar su número.
      savedCustomer =
        await customerService.update(
          selectedId,
          customerData
        );

      setCustomers((current) =>
        current.map((customer) =>
          customer.id === selectedId
            ? savedCustomer
            : customer
        )
      );
    }

    setSelectedId(savedCustomer.id);
    setMode("edit");

    setForm({
      id: String(savedCustomer.id),
      name: savedCustomer.name ?? "",
      permitNumber:
        savedCustomer.permitNumber ?? "",
      phone: savedCustomer.phone ?? "",
      email: savedCustomer.email ?? "",
    });
  } catch (error) {
    console.error(
      "Could not save customer:",
      error
    );

    window.alert(
      error?.message ||
        "The customer could not be saved."
    );
  } finally {
    setIsSaving(false);
  }
};

 const handleDelete = async () => {
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

  try {
    const wasDeleted =
      await customerService.delete(selectedId);

    if (!wasDeleted) {
      throw new Error(
        "The customer could not be deleted."
      );
    }

    setCustomers((current) =>
      current.filter(
        (customer) => customer.id !== selectedId
      )
    );

    handleAddNew();
  } catch (error) {
    console.error(
      "Could not delete customer:",
      error
    );

    window.alert(
      error?.message ||
        "The customer could not be deleted."
    );
  }
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
                    <small>Permit #{customer.permitNumber || "—"}</small>
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
                    type="text"
                    value={
                      mode === "add"
                        ? "Assigned automatically"
                        : form.id
                    }
                    readOnly
                    tabIndex={-1}
                  />
                </label>

                <label>
                  <span>Permit number</span>

                  <input
                    name="permitNumber"
                    type="text"
                    value={form.permitNumber}
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
                    disabled={isSaving}
                  >
                    {isSaving
                      ? "Saving..."
                      : mode === "add"
                        ? "Add customer"
                        : "Save changes"}
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