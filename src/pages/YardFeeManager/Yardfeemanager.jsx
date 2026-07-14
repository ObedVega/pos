import React, { useState } from "react";
import "./YardFeeManager.css";

const defaultTiers = [
  { id: "tier-1", prefix: "$0 <", suffix: "< $49", fee: "70" },
  { id: "tier-2", prefix: "$50 <", suffix: "> $99", fee: "70" },
  { id: "tier-3", prefix: "$100 <", suffix: "> $149", fee: "70" },
  { id: "tier-4", prefix: "$150 <", suffix: "> $199", fee: "70" },
  { id: "tier-5", prefix: "", suffix: "> $200", fee: "70" },
];

let savedTiers = defaultTiers;

export default function YardFeeManager({ onClose }) {
  const [tiers, setTiers] = useState(savedTiers);

  const handleFeeChange = (id, value) => {
    setTiers((current) =>
      current.map((tier) =>
        tier.id === id ? { ...tier, fee: value } : tier
      )
    );
  };

  const handleSaveAndExit = () => {
    savedTiers = tiers;
    onClose();
  };

  const handleClose = () => {
    setTiers(savedTiers);
    onClose();
  };

  return (
    <div className="yard-fee-overlay" role="presentation">
      <section
        className="yard-fee-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="yard-fee-title"
      >
        <header className="yard-fee-header">
          <h2 id="yard-fee-title">Change Yard Fee Values</h2>

          <button
            type="button"
            className="yard-fee-close-icon"
            onClick={handleClose}
            aria-label="Close yard fee values"
          >
            ×
          </button>
        </header>

        <div className="yard-fee-body">
          {tiers.map((tier) => (
            <div className="yard-fee-row" key={tier.id}>
              <span className="yard-fee-prefix">{tier.prefix}</span>

              <input
                type="number"
                min="0"
                step="0.01"
                value={tier.fee}
                onChange={(event) =>
                  handleFeeChange(tier.id, event.target.value)
                }
              />

              <span className="yard-fee-suffix">{tier.suffix}</span>
            </div>
          ))}
        </div>

        <footer className="yard-fee-footer">
          <button
            type="button"
            className="yard-fee-save-button"
            onClick={handleSaveAndExit}
          >
            Save and Exit
          </button>

          <button
            type="button"
            className="yard-fee-cancel-button"
            onClick={handleClose}
          >
            Close
          </button>
        </footer>
      </section>
    </div>
  );
}