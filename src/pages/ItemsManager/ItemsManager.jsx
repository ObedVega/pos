import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import "./ItemsManager.css";
import productService from "../../services/productService";

const emptyForm = {
  upc: "",
  name: "",
  price: "",
  stock: "",
  minimumStock: "",
};

export default function ItemsManager({ onClose }) {
const [items, setItems] = useState([]);
const [selectedUPC, setSelectedUPC] =
  useState(null);

const [isLoading, setIsLoading] =
  useState(true);

const [isSaving, setIsSaving] =
  useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [mode, setMode] = useState("add");

  useEffect(() => {
  const loadProducts = async () => {
    try {
      setIsLoading(true);

      const result =
        await productService.getAll();

      setItems(
        Array.isArray(result)
          ? result
          : []
      );
    } catch (error) {
      console.error(
        "Could not load products:",
        error
      );

      setItems([]);

      window.alert(
        error?.message ||
          "Products could not be loaded."
      );
    } finally {
      setIsLoading(false);
    }
  };

  loadProducts();
}, []);

const filteredItems = useMemo(() => {
  const value = search.trim().toLowerCase();

  if (!value) {
    return items;
  }

  return items.filter((item) =>
    `${item.upc} ${item.name}`
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
  setSelectedUPC(null);
  setMode("add");
  setForm(emptyForm);
};

const handleSelectItem = (item) => {
  setSelectedUPC(item.upc);
  setMode("edit");

  setForm({
    upc: String(item.upc ?? ""),
    name: item.name ?? "",
    price: String(item.price ?? ""),
    stock: String(item.stock ?? ""),
    minimumStock: String(
      item.minimumStock ?? ""
    ),
  });
};

const handleSave = async (event) => {
  event.preventDefault();

  if (
    !form.upc.trim() ||
    !form.name.trim()
  ) {
    window.alert(
      "UPC and product name are required."
    );
    return;
  }

  const normalizedProduct = {
    upc: form.upc.trim(),
    name: form.name.trim(),
    price: Number(form.price || 0),
    stock: Number(form.stock || 0),
    minimumStock: Number(
      form.minimumStock || 0
    ),
  };

  try {
    setIsSaving(true);

    let savedProduct;

    if (mode === "add") {
      savedProduct =
        await productService.create(
          normalizedProduct
        );

      setItems((current) => [
        ...current,
        savedProduct,
      ]);
    } else {
      savedProduct =
        await productService.update(
          selectedUPC,
          normalizedProduct
        );

      setItems((current) =>
        current.map((item) =>
          item.upc === selectedUPC
            ? savedProduct
            : item
        )
      );
    }

    setSelectedUPC(savedProduct.upc);
    setMode("edit");

    setForm({
      upc: String(savedProduct.upc ?? ""),
      name: savedProduct.name ?? "",
      price: String(savedProduct.price ?? ""),
      stock: String(savedProduct.stock ?? ""),
      minimumStock: String(
        savedProduct.minimumStock ?? ""
      ),
    });
  } catch (error) {
    console.error(
      "Could not save product:",
      error
    );

    window.alert(
      error?.message ||
        "The product could not be saved."
    );
  } finally {
    setIsSaving(false);
  }
};

const handleDelete = async () => {
  if (selectedUPC === null) {
    return;
  }

  const selectedItem = items.find(
    (item) => item.upc === selectedUPC
  );

  const confirmed = window.confirm(
    `Delete item "${selectedItem?.name}"?`
  );

  if (!confirmed) {
    return;
  }

  try {
    const wasDeleted =
      await productService.delete(
        selectedUPC
      );

    if (!wasDeleted) {
      throw new Error(
        "The product could not be deleted."
      );
    }

    setItems((current) =>
      current.filter(
        (item) => item.upc !== selectedUPC
      )
    );

    handleAddNew();
  } catch (error) {
    console.error(
      "Could not delete product:",
      error
    );

    window.alert(
      error?.message ||
        "The product could not be deleted."
    );
  }
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
                  key={item.upc}
                  className={`items-list-item ${
                    selectedUPC  === item.upc ? "selected" : ""
                  }`}
                  onClick={() => handleSelectItem(item)}
                >
                  <span className="items-list-number">
                    {item.upc}
                  </span>

                  <span className="items-list-copy">
                    <strong>{item.name}</strong>
                    <small>
                      Stock: {item.stock} · ${Number(item.price).toFixed(2)}
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
    <span>UPC / SKU</span>

    <input
      name="upc"
      type="text"
      value={form.upc}
      onChange={handleInputChange}
      required
      disabled={isSaving}
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
      disabled={isSaving}
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
      disabled={isSaving}
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
      disabled={isSaving}
    />
  </label>

  <label>
    <span>Minimum stock</span>

    <input
      name="minimumStock"
      type="number"
      min="0"
      value={form.minimumStock}
      onChange={handleInputChange}
      disabled={isSaving}
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