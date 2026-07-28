import React, { useEffect, useMemo, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import "./BarcodeLabels.css";

// --- Categorizacion por palabras clave en el nombre del producto ---
// Ajusta/agrega palabras clave segun vayas viendo productos mal clasificados.
const CATEGORY_RULES = [
  {
    category: "Carnes",
    keywords: [
      "birria", "carnitas", "bistec", "costillas", "cabeza", "pollo", "asada",
      "adobada", "chicharr", "chorizo", "ham", "bacon", "sausage", "hot dog",
      "hot dogs", "fish", "shrimp", "octopus", "spicy chicken", "beef",
    ],
  },
  {
    category: "Pan y Tortillas",
    keywords: [
      "tortilla", "tostada", "bread", "bimbo", "bagel", "muffin", "torta",
      "sourdough", "hot dog bread",
    ],
  },
  {
    category: "Congelados y Preparados",
    keywords: [
      "fries", "tater", "hash brown", "burrito", "patties", "nemos",
      "freshley", "corn dog", "avocado pulp", "peas and carrots",
    ],
  },
  {
    category: "Lacteos y Refrigerados",
    keywords: [
      "cheese", "cream", "milk", "eggs", "margarine", "jello",
      "orange juice", "lettuce", "aguas frescas",
    ],
  },
  {
    category: "Frutas y Verduras",
    keywords: [
      "tomato", "tomatillo", "serrano", "pepper", "lim", "jalape",
      "cebolla", "ajo", "cabbage", "carrots", "cilantro", "cucumber",
      "jicama", "watermelon", "pineapple", "melon", "broccoli", "potato",
      "chile california",
    ],
  },
  {
    category: "Salsas y Condimentos",
    keywords: [
      "sauce", "valentina", "tapat", "mole", "nopalitos", "el pato",
      "chipotle", "hominy", "mayo", "mustard", "ketchup", "salsa",
      "teriyaki", "coconut cream", "cubed beef",
    ],
  },
  {
    category: "Abarrotes Secos",
    keywords: [
      "chips", "tostitos", "snak club", "spices", "bouillon", "taj",
      "crumbs", "chamoy", "rice", "bean", "flour", "pickle", "salt",
      "fish sauce",
    ],
  },
  {
    category: "Desechables",
    keywords: [
      "degreaser", "gloves", "scrub", "food tray", "foil", "plastic wrap",
      "bleach", "cup", "lid", "napkin", "straw", "rice bowl", "container",
      "spoon", "fork", "plate", "towel", "paper wrap", "plastic bag",
    ],
  },
  {
    category: "Bebidas",
    keywords: [
      "monster", "redbull", "rockstar", "soda", "parrot", "arizona tea",
      "water 1.5l", "jarritos", "powerade", "glass coke", "coconut water",
    ],
  },
];

function categorizeProduct(name) {
  const lower = name.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      return rule.category;
    }
  }
  return "Otros";
}

function groupByCategory(products) {
  const groups = new Map();

  for (const product of products) {
    const category = categorizeProduct(product.name);
    if (!groups.has(category)) groups.set(category, []);
    groups.get(category).push(product);
  }

  // Orden fijo para que "Otros" siempre quede al final
  const order = CATEGORY_RULES.map((r) => r.category).concat("Otros");
  return order
    .filter((cat) => groups.has(cat))
    .map((cat) => ({ category: cat, items: groups.get(cat) }));
}

function UPCBarcode({ value }) {
  const ref = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    try {
      JsBarcode(ref.current, value, {
        format: "CODE128",
        lineColor: "#000",
        width: 2,
        height: 50,
        displayValue: true,
        margin: 10,
      });
      setFailed(false);
    } catch (err) {
      console.error(`No se pudo generar el codigo de barras para ${value}:`, err);
      setFailed(true);
    }
  }, [value]);

  if (failed) {
    return <div className="barcode-unavailable">Codigo no disponible</div>;
  }

  return <svg ref={ref} className="upc-barcode" />;
}

export default function BarcodeLabels({ products, onClose }) {
  const grouped = useMemo(() => groupByCategory(products), [products]);

  return (
    <div className="barcode-labels-overlay">
      <section
        className="barcode-labels-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="barcode-labels-title"
      >
        <header className="barcode-labels-header no-print">
          <div>
            <span>Manage</span>
            <h2 id="barcode-labels-title">Barcode labels</h2>
          </div>
          <div>
            <button type="button" onClick={() => window.print()}>
              Print / Save PDF
            </button>
            <button type="button" onClick={onClose}>
              Close
            </button>
          </div>
        </header>

        <div id="barcode-print-area">
          {grouped.map(({ category, items }) => (
            <section key={category} className="barcode-category-section">
              <h3 className="barcode-category-title">
                {category}{" "}
                <span className="barcode-category-count">
                  ({items.length})
                </span>
              </h3>

              <div className="barcode-label-grid">
                {items.map((product) => (
                  <article className="barcode-label" key={product.upc}>
                    <strong>{product.name}</strong>
                    <UPCBarcode value={product.upc} />
                    <small>${Number(product.price).toFixed(2)}</small>
                  </article>
                ))}
              </div>
            </section>
          ))}

          {grouped.length === 0 && <p>No products available.</p>}
        </div>
      </section>
    </div>
  );
}