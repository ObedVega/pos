import React, { useEffect, useState } from "react";

import Header from "../components/Header";
import CustomerSelector from "../components/CustomerSelector";
import UPCInput from "../components/UPCInput";
import LastScanned from "../components/LastScanned";
import Cart from "../components/Cart";
import Calendar from "../components/Calendar";
import Totals from "../components/Totals";
import CustomerManager from "../components/CustomerManager";

import "./POS.css";

export default function POS() {
  const [
    isCustomerManagerOpen,
    setIsCustomerManagerOpen,
  ] = useState(false);

  useEffect(() => {
    if (!window.electronAPI?.onOpenCustomerManager) {
      return undefined;
    }

    const removeListener =
      window.electronAPI.onOpenCustomerManager(() => {
        setIsCustomerManagerOpen(true);
      });

    return () => {
      if (typeof removeListener === "function") {
        removeListener();
      }
    };
  }, []);

  return (
    <div className="pos">
      <Header />

      <div className="pos-body">
        <div className="left-column">
          <CustomerSelector />
          <UPCInput />
        </div>

        <div className="last-area">
          <LastScanned />
        </div>

        <div className="cart-area">
          <Cart />
        </div>

        <div className="calendar-area">
          <Calendar />
        </div>

        <div className="totals-area">
          <Totals />
        </div>
      </div>

      {isCustomerManagerOpen && (
        <CustomerManager
          onClose={() =>
            setIsCustomerManagerOpen(false)
          }
        />
      )}
    </div>
  );
}