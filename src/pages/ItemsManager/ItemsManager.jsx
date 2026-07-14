import React, { useMemo, useState } from "react";
import "./ItemsManager.css";

const initialItems = [
  {
    id: 1,
    upc: "0001",
    name: "Bag of Ice 10lb",
    category: "Ice",
    price: "3.99",
    stock: "120",
  },
  {
    id: 2,
    upc: "0002",
    name: "Bottled Water 16oz",
    category: "Beverages",
    price: "1.50",
    stock: "300",
  },
  {
    id: 3,
    upc: "0003",
    name: "Propane Tank Exchange",
    category: "Fuel",
    price: "24.99",
    stock: "18",
  },
];

const emptyForm = {
  id: "",
  upc: "",
  name: "",
  category: "",
  price: "",
  stock: "",
};

export default function ItemsManager({ onClose }) {
  const [items, setItems] = useState(initialItems);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [mode, setMode] = useState("add");

  const filteredItems = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return items;
    }

    return items.filter((item) =>
      `${item.id} ${item.upc} ${item.name} ${item.category}`
        .toLowerCase()
        .includes(value)
    );
  }, [items, search]);

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

  const handleSelectItem = (item) => {
    setSelectedId(item.id);
    setMode("edit");

    setForm({
      id: String(item.id),
      upc: item.upc,
      name: item.name,
      category: item.category,
      price: item.price,
      stock: item.stock,
    });
  };

  const handleSave = (event) => {
    event.preventDefault();

    if (!form.id.trim() || !form.name.trim()) {
      return;
    }

    const normalizedItem = {
      id: Number(form.id),
      upc: form.upc.trim(),
      name: form.name.trim(),
      category: form.category.trim(),
      price: form.price.trim(),
      stock: form.stock.trim(),
    };

    if (mode === "add") {
      const idAlreadyExists = items.some(
        (item) => item.id === normalizedItem.id
      );

      if (idAlreadyExists) {
        window.alert("That item number already exists.");
        return;
      }

      setItems((current) => [...current, normalizedItem]);
      setSelectedId(normalizedItem.id);
      setMode("edit");
      return;
    }

    setItems((current) =>
      current.map((item) =>
        item.id === selectedId ? normalizedItem : item
      )
    );

    setSelectedId(normalizedItem.id);
  };

  const handleDelete = () => {
    if (selectedId === null) {
      return;
    }

    const selectedItem = items.find(
      (item) => item.id === selectedId
    );

    const confirmed = window.confirm(
      `Delete item "${selectedItem?.name}"?`
    );

    if (!confirmed) {
      return;
    }

    setItems((current) =>
      current.filter((item) => item.id !== selectedId)
    );

    handleAddNew();
  };

  return (
    <div className="items-manager-overlay" role="presentation">
      <section
        className="items-manager-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="items-manager-title"
      >
        <header className="items-manager-header">
          <div>
            <span className="items-manager-eyebrow">
              Inventory management
            </span>

            <h2 id="items-manager-title">Items</h2>
          </div>

          <button
            type="button"
            className="items-manager-close"
            onClick={onClose}
            aria-label="Close items manager"
          >
            ×
          </button>
        </header>

        <div className="items-manager-body">
          <aside className="items-manager-list-panel">
            <div className="items-list-toolbar">
              <input
                type="search"
                placeholder="Search items..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />

              <button type="button" onClick={handleAddNew}>
                + Add
              </button>
            </div>

            <div className="items-list">
              {filteredItems.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={`items-list-item ${
                    selectedId === item.id ? "selected" : ""
                  }`}
                  onClick={() => handleSelectItem(item)}
                >
                  <span className="items-list-number">
                    {item.id}
                  </span>

                  <span className="items-list-copy">
                    <strong>{item.name}</strong>
                    <small>
                      {item.category || "—"} · UPC {item.upc || "—"}
                    </small>
                  </span>
                </button>
              ))}

              {filteredItems.length === 0 && (
                <div className="items-list-empty">
                  No items found.
                </div>
              )}
            </div>
          </aside>

          <main className="items-manager-form-panel">
            <div className="items-form-heading">
              <div>
                <span>{mode === "add" ? "New item" : "Edit item"}</span>

                <h3>
                  {mode === "add"
                    ? "Add item"
                    : form.name || "Item information"}
                </h3>
              </div>
            </div>

            <form className="items-form" onSubmit={handleSave}>
              <div className="items-form-grid">
                <label>
                  <span>Item number</span>

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
                  <span>UPC / SKU</span>

                  <input
                    name="upc"
                    type="text"
                    value={form.upc}
                    onChange={handleInputChange}
                  />
                </label>

                <label className="items-form-full">
                  <span>Item name</span>

                  <input
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleInputChange}
                    required
                  />
                </label>

                <label>
                  <span>Category</span>

                  <input
                    name="category"
                    type="text"
                    value={form.category}
                    onChange={handleInputChange}
                  />
                </label>

                <label>
                  <span>Price</span>

                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={handleInputChange}
                  />
                </label>

                <label>
                  <span>Stock</span>

                  <input
                    name="stock"
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={handleInputChange}
                  />
                </label>
              </div>

              <footer className="items-form-actions">
                <button
                  type="button"
                  className="items-delete-button"
                  onClick={handleDelete}
                  disabled={mode === "add"}
                >
                  Delete
                </button>

                <div>
                  <button
                    type="button"
                    className="items-cancel-button"
                    onClick={onClose}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="items-save-button"
                  >
                    {mode === "add" ? "Add item" : "Save changes"}
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