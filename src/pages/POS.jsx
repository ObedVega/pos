import React, { useEffect, useState } from "react";

import Header from "../components/Header";
import CustomerSelector from "../components/CustomerSelector";
import UPCInput from "../components/UPCInput";
import LastScanned from "../components/LastScanned";
import Cart from "../components/Cart";
import Calendar from "../components/Calendar";
import Totals from "../components/Totals";
import CustomerManager from "./CustomerManager/CustomerManager";
import ItemsManager from "./ItemsManager/ItemsManager";
import DailyNotice from "./DailyNotice/DailyNotice";
import YardFeeManager from "./YardFeeManager/YardFeeManager";

import "./POS.css";

export default function POS() {
  const [
    isCustomerManagerOpen,
    setIsCustomerManagerOpen,
  ] = useState(false);

  const [
    isItemsManagerOpen,
    setIsItemsManagerOpen,
  ] = useState(false);

  const [
    isDailyNoticeOpen,
    setIsDailyNoticeOpen,
  ] = useState(false);

  const [
    isYardFeeOpen,
    setIsYardFeeOpen,
  ] = useState(false);

  useEffect(() => {
    const handleOpenCustomerManager = () => {
      setIsCustomerManagerOpen(true);
    };

    const handleOpenItemsManager = () => {
      setIsItemsManagerOpen(true);
    };

    const handleOpenDailyNotice = () => {
      setIsDailyNoticeOpen(true);
    };

    const handleOpenYardFees = () => {
      setIsYardFeeOpen(true);
    };

    window.addEventListener(
      "open-customer-manager",
      handleOpenCustomerManager
    );

    window.addEventListener(
      "open-items-manager",
      handleOpenItemsManager
    );

    window.addEventListener(
      "open-daily-notice",
      handleOpenDailyNotice
    );

    window.addEventListener(
      "open-yard-fees",
      handleOpenYardFees
    );

    return () => {
      window.removeEventListener(
        "open-customer-manager",
        handleOpenCustomerManager
      );

      window.removeEventListener(
        "open-items-manager",
        handleOpenItemsManager
      );

      window.removeEventListener(
        "open-daily-notice",
        handleOpenDailyNotice
      );

      window.removeEventListener(
        "open-yard-fees",
        handleOpenYardFees
      );
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

      {isItemsManagerOpen && (
        <ItemsManager
          onClose={() =>
            setIsItemsManagerOpen(false)
          }
        />
      )}

      {isDailyNoticeOpen && (
        <DailyNotice
          onClose={() =>
            setIsDailyNoticeOpen(false)
          }
        />
      )}

      {isYardFeeOpen && (
        <YardFeeManager
          onClose={() =>
            setIsYardFeeOpen(false)
          }
        />
      )}
    </div>
  );
}