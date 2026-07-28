import React from "react";
import "./BarcodeLabels.css";

const L_CODES = ["0001101", "0011001", "0010011", "0111101", "0100011", "0110001", "0101111", "0111011", "0110111", "0001011"];
const G_CODES = ["0100111", "0110011", "0011011", "0100001", "0011101", "0111001", "0000101", "0010001", "0001001", "0010111"];
const R_CODES = ["1110010", "1100110", "1101100", "1000010", "1011100", "1001110", "1010000", "1000100", "1001000", "1110100"];
const PARITY = ["LLLLLL", "LLGLGG", "LLGGLG", "LLGGGL", "LGLLGG", "LGGLLG", "LGGGLL", "LGGLGL", "LGLGGL", "LGLGLG"];

const isUPC = (value) => /^\d{12}$/.test(String(value));

function UPCBarcode({ value }) {
  const digits = String(value);
  if (!isUPC(digits)) return <div className="barcode-unavailable">UPC inválido</div>;
  const parity = PARITY[Number(digits[0])];
  let bars = "101";
  for (let index = 1; index <= 6; index += 1) {
    const digit = Number(digits[index]);
    bars += parity[index - 1] === "L" ? L_CODES[digit] : G_CODES[digit];
  }
  bars += "01010";
  for (let index = 7; index <= 11; index += 1) bars += R_CODES[Number(digits[index])];
  bars += "101";

  return (
    <svg className="upc-barcode" viewBox="0 0 113 58" role="img" aria-label={`UPC ${digits}`}>
      <rect width="113" height="58" fill="white" />
      {bars.split("").map((bar, index) => bar === "1" && (
        <rect key={index} x={index + 7} y="2" width="1" height={(index < 3 || (index >= 45 && index < 50) || index >= 92) ? "46" : "40"} fill="black" />
      ))}
      <text x="4" y="56" fontSize="8" textAnchor="middle">{digits[0]}</text>
      <text x="31" y="56" fontSize="9" textAnchor="middle">{digits.slice(1, 6)}</text>
      <text x="81" y="56" fontSize="9" textAnchor="middle">{digits.slice(6, 11)}</text>
      <text x="109" y="56" fontSize="8" textAnchor="middle">{digits[11]}</text>
    </svg>
  );
}

export default function BarcodeLabels({ products, onClose }) {
  return (
    <div className="barcode-labels-overlay">
      <section className="barcode-labels-modal" role="dialog" aria-modal="true" aria-labelledby="barcode-labels-title">
        <header className="barcode-labels-header no-print">
          <div><span>Manage</span><h2 id="barcode-labels-title">Barcode labels</h2></div>
          <div><button type="button" onClick={() => window.print()}>Print / Save PDF</button><button type="button" onClick={onClose}>Close</button></div>
        </header>
        <div id="barcode-print-area" className="barcode-label-grid">
          {products.map((product) => (
            <article className="barcode-label" key={product.upc}>
              <strong>{product.name}</strong>
              <UPCBarcode value={product.upc} />
              <small>${Number(product.price).toFixed(2)}</small>
            </article>
          ))}
          {products.length === 0 && <p>No products available.</p>}
        </div>
      </section>
    </div>
  );
}
