import React, { useMemo, useState } from "react";
import AdjustInventory from "../../components/AdjustInventory/AdjustInventory";
import products from "../../data/products";

import "./Inventory.css";

export default function Inventory({ onBack }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [adjustProduct, setAdjustProduct] = useState(null);
const [isAdjustOpen, setIsAdjustOpen] = useState(false);

const [inventoryItems, setInventoryItems] = useState(() =>
  products.map((product) => {
    const stock = Number(product.stock ?? 0);
    const minimumStock = Number(product.minimumStock ?? 10);

    let status = "in-stock";

    if (stock <= 0) {
      status = "out-of-stock";
    } else if (stock <= minimumStock) {
      status = "low-stock";
    }

    return {
      ...product,
      stock,
      minimumStock,
      status,
    };
  })
);

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return inventoryItems.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        `${product.name} ${product.upc}`
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" ||
        product.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [inventoryItems, search, statusFilter]);

  const totals = useMemo(() => {
    return inventoryItems.reduce(
      (summary, product) => {
        summary.totalProducts += 1;
        summary.totalUnits += product.stock;

        if (product.status === "low-stock") {
          summary.lowStock += 1;
        }

        if (product.status === "out-of-stock") {
          summary.outOfStock += 1;
        }

        return summary;
      },
      {
        totalProducts: 0,
        totalUnits: 0,
        lowStock: 0,
        outOfStock: 0,
      }
    );
  }, [inventoryItems]);

  const openAdjust = (product) => {
    setAdjustProduct(product);
    setIsAdjustOpen(true);
  };
  const closeAdjust = () => {
  setIsAdjustOpen(false);
  setAdjustProduct(null);
};
const handleSaveAdjustment = (adjustment) => {
  setInventoryItems((currentItems) =>
    currentItems.map((item) => {
      if (item.upc !== adjustment.productId) {
        return item;
      }

      const updatedStock = adjustment.newStock;

      let updatedStatus = "in-stock";

      if (updatedStock <= 0) {
        updatedStatus = "out-of-stock";
      } else if (updatedStock <= item.minimumStock) {
        updatedStatus = "low-stock";
      }

      return {
        ...item,
        stock: updatedStock,
        status: updatedStatus,
      };
    })
  );

  console.log("Inventory adjustment:", adjustment);

  closeAdjust();
};
  return (
    <div className="inventory-page">
      <header className="inventory-header">
        <div>
          <button
            type="button"
            className="inventory-back-button"
            onClick={onBack}
          >
            ← Back to POS
          </button>

          <span className="inventory-eyebrow">
            Inventory management
          </span>

          <h1>Inventory</h1>

          <p>
            Review current stock, low-stock items and unavailable products.
          </p>
        </div>
      </header>

      <section className="inventory-summary">
        <article>
          <span>Total products</span>
          <strong>{totals.totalProducts}</strong>
        </article>

        <article>
          <span>Total units</span>
          <strong>{totals.totalUnits}</strong>
        </article>

        <article>
          <span>Low stock</span>
          <strong>{totals.lowStock}</strong>
        </article>

        <article>
          <span>Out of stock</span>
          <strong>{totals.outOfStock}</strong>
        </article>
      </section>

      <section className="inventory-content">
        <div className="inventory-toolbar">
          <input
            type="text"
            placeholder="Search by item name or UPC..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >
            <option value="all">
              All inventory
            </option>

            <option value="in-stock">
              In stock
            </option>

            <option value="low-stock">
              Low stock
            </option>

            <option value="out-of-stock">
              Out of stock
            </option>
          </select>
        </div>

        <div className="inventory-table-wrapper">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>UPC</th>
                <th>Price</th>
                <th>Current stock</th>
                <th>Minimum stock</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>

            <tbody>
              {filteredItems.map((product) => (
                <tr key={product.upc}>
                  <td>
                    <strong>{product.name}</strong>
                  </td>

                  <td>{product.upc}</td>

                  <td>
                    ${Number(product.price).toFixed(2)}
                  </td>

                  <td>
                    <strong>{product.stock}</strong>
                  </td>

                  <td>{product.minimumStock}</td>

                  <td>
                    <span
                      className={`inventory-status ${product.status}`}
                    >
                      {product.status === "in-stock" &&
                        "In stock"}

                      {product.status === "low-stock" &&
                        "Low stock"}

                      {product.status === "out-of-stock" &&
                        "Out of stock"}
                    </span>
                  </td>

                  <td>
                    <button
                      type="button"
                      className="inventory-row-action"
                      onClick={() => openAdjust(product)}
                    >
                      Adjust
                    </button>
                  </td>
                </tr>
              ))}

              {filteredItems.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="inventory-empty"
                  >
                    No inventory items match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      <AdjustInventory
        open={isAdjustOpen}
        product={adjustProduct}
        onClose={closeAdjust}
        onSave={handleSaveAdjustment}
      />
    </div>
    
  );
}