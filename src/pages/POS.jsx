import React, { useEffect, useMemo, useState } from "react";

import Header from "../components/Header";
import CustomerSelector from "../components/CustomerSelector";
import UPCInput from "../components/UPCInput";
import LastScanned from "../components/LastScanned";
import Cart from "../components/Cart";
import Calendar from "../components/Calendar";
import Totals from "../components/Totals";
import AlertDialog from "../components/AlertDialog/AlertDialog";

import CustomerManager from "./CustomerManager/CustomerManager";
import ItemsManager from "./ItemsManager/ItemsManager";
import DailyNotice from "./DailyNotice/DailyNotice";
import YardFeeManager from "./YardFeeManager/YardFeeManager";
import Inventory from "./Inventory/Inventory";

import customers from "../data/customers";
import yardFees from "../data/yardFees";

import "./POS.css";

export default function POS() {
  const [cartItems, setCartItems] = useState([]);
  const [lastScanned, setLastScanned] = useState(null);
  const [selectedCartItemId, setSelectedCartItemId] = useState(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  //const [customerError, setCustomerError] = useState("");
  const [currentView, setCurrentView] = useState("pos"); 

  const [alert, setAlert] = useState({
    open: false,
    type: "info",
    title: "",
    message: "",
    confirmText: "OK",
    cancelText: "Cancel",
    showCancel: false,
    onConfirm: null,
  });

  const selectedCustomer =
    customers.find(
      (customer) =>
        String(customer.id) === String(selectedCustomerId)
    ) ?? null;
    
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

  const itemCount = useMemo(() => {
    return cartItems.reduce(
      (total, item) => total + item.quantity,
      0
    );
  }, [cartItems]);

  const subtotal = useMemo(() => {
    return cartItems.reduce(
      (total, item) => total + item.lineTotal,
      0
    );
  }, [cartItems]);

  const yardFee = useMemo(() => {
  if (cartItems.length === 0) {
    return 0;
  }

  const matchingRule = yardFees.find(
      (rule) =>
        subtotal >= rule.min &&
        subtotal <= rule.max
    );

    return matchingRule
      ? Number(matchingRule.fee)
      : 0;
  }, [subtotal, cartItems.length]);



  const closeAlert = () => {
  setAlert((currentAlert) => ({
    ...currentAlert,
    open: false,
    onConfirm: null,
  }));
};

const showAlert = ({
  type = "info",
  title = "Message",
  message,
  confirmText = "OK",
}) => {
  setAlert({
    open: true,
    type,
    title,
    message,
    confirmText,
    cancelText: "Cancel",
    showCancel: false,
    onConfirm: null,
  });
};

const showConfirmation = ({
  type = "warning",
  title,
  message,
  confirmText = "Continue",
  cancelText = "Cancel",
  onConfirm,
}) => {
  setAlert({
    open: true,
    type,
    title,
    message,
    confirmText,
    cancelText,
    showCancel: true,
    onConfirm,
  });
};

const handleAlertConfirm = () => {
  const confirmationAction = alert.onConfirm;

  closeAlert();

  if (typeof confirmationAction === "function") {
    confirmationAction();
  }
};

  const handleAddItem = (product, quantity) => {
if (!selectedCustomer) {
  showAlert({
    type: "warning",
    title: "Customer required",
    message: "Select customer.",
  });

  return false;
}
    const safeQuantity = Math.max(
      1,
      Math.floor(Number(quantity) || 1)
    );

    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.productId === product.upc
      );

      if (existingItem) {
        return currentItems.map((item) => {
          if (item.productId !== product.upc) {
            return item;
          }

          const updatedQuantity =
            item.quantity + safeQuantity;

          return {
            ...item,
            quantity: updatedQuantity,
            lineTotal:
              updatedQuantity * item.unitPrice,
          };
        });
      }

      const newItem = {
        id: product.upc,
        productId: product.upc,
        upc: product.upc,
        name: product.name,
        unitPrice: Number(product.price),
        quantity: safeQuantity,
        lineTotal:
          Number(product.price) * safeQuantity,
      };

      return [...currentItems, newItem];
    });

    setLastScanned({
      ...product,
      quantity: safeQuantity,
    });

    setSelectedCartItemId(product.upc);
    return true;
  };

  const handleRemoveItem = () => {
    if (!selectedCartItemId) {
      return false;
    }

    setCartItems((currentItems) =>
      currentItems.filter(
        (item) => item.id !== selectedCartItemId
      )
    );

    setSelectedCartItemId(null);

    return true;
  };

const handleClearSale = () => {
  setCartItems([]);
  setLastScanned(null);
  setSelectedCartItemId(null);
};

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

    const handleOpenInventory = () => {
      setCurrentView("inventory");
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

    window.addEventListener(
      "open-inventory",
      handleOpenInventory
    );

    return () => {
      window.removeEventListener(
        "open-inventory",
        handleOpenInventory
      );

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

const applyCustomerChange = (newCustomerId) => {
  setSelectedCustomerId(newCustomerId);
};

const handleCustomerChange = (newCustomerId) => {
  const isDifferentCustomer =
    String(newCustomerId) !==
    String(selectedCustomerId);

  if (!isDifferentCustomer) {
    return;
  }

  const hasStartedSale = cartItems.length > 0;

  if (hasStartedSale) {
    showConfirmation({
      type: "warning",
      title: "Change customer?",
      message:
        "Changing the customer will clear every item from the current sale.",
      confirmText: "Change customer",
      cancelText: "Keep current sale",
      onConfirm: () => {
        handleClearSale();
        applyCustomerChange(newCustomerId);
      },
    });


    return;
  }
  applyCustomerChange(newCustomerId);
};
    if (currentView === "inventory") {
      return (
        <Inventory
          onBack={() => setCurrentView("pos")}
        />
      );
    }
  return (
    <div className="pos">
      <Header />

      <div className="pos-body">
        <div className="left-column">
<CustomerSelector
  selectedCustomerId={selectedCustomerId}
  onCustomerChange={handleCustomerChange}
/>
          <UPCInput
            itemCount={itemCount}
            onAddItem={handleAddItem}
            onRemoveItem={handleRemoveItem}
            onClearSale={handleClearSale}
            onShowAlert={showAlert}
          />
        </div>

        <div className="last-area">
          <LastScanned product={lastScanned} />
        </div>

        <div className="cart-area">
          <Cart
            items={cartItems}
            selectedItemId={selectedCartItemId}
            onSelectItem={setSelectedCartItemId}
          />
        </div>

        <div className="calendar-area">
          <Calendar />
        </div>

        <div className="totals-area">
          <Totals 
            items={cartItems}
            yardFee={yardFee}
          />
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

      <AlertDialog
        open={alert.open}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        confirmText={alert.confirmText}
        cancelText={alert.cancelText}
        showCancel={alert.showCancel}
        onConfirm={handleAlertConfirm}
        onCancel={closeAlert}
      />
    </div>
  );
}