import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import "./Header.css";

export default function Header() {
  const [currentTime, setCurrentTime] = useState("");
  const [isToolsOpen, setIsToolsOpen] = useState(false);

  const toolsMenuRef = useRef(null);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();

      const time = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });

      setCurrentTime(time);
    };

    updateClock();

    const interval = window.setInterval(
      updateClock,
      1000
    );

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (
        toolsMenuRef.current &&
        !toolsMenuRef.current.contains(event.target)
      ) {
        setIsToolsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsToolsOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleDocumentClick
    );

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleDocumentClick
      );

      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  const openWindow = (eventName) => {
    window.dispatchEvent(new Event(eventName));
    setIsToolsOpen(false);
  };

  return (
    <header className="header">
      <div className="header-left">
        <h1>Chiquita Catering POS</h1>

        <span>Warehouse Management System</span>
      </div>



      <div className="header-actions">
        <div
          className="header-tools"
          ref={toolsMenuRef}
        >
          <button
            type="button"
            className={`header-tools-button ${
              isToolsOpen ? "active" : ""
            }`}
            onClick={() =>
              setIsToolsOpen((current) => !current)
            }
            aria-haspopup="menu"
            aria-expanded={isToolsOpen}
          >
            Manage

            <span
              className={`header-tools-chevron ${
                isToolsOpen ? "open" : ""
              }`}
            >
              ▾
            </span>
          </button>

          {isToolsOpen && (
            <div
              className="header-tools-menu"
              role="menu"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() =>
                  openWindow(
                    "open-customer-manager"
                  )
                }
              >
                <span className="header-menu-icon">
                  👤
                </span>

                <span>
                  <strong>Customers</strong>
                  <small>Add, edit or delete customers</small>
                </span>
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() =>
                  openWindow("open-items-manager")
                }
              >
                <span className="header-menu-icon">
                  📦
                </span>

                <span>
                  <strong>Items</strong>
                  <small>Manage products and prices</small>
                </span>
              </button>
<div className="header-menu-divider" />
              <button
                type="button"
                role="menuitem"
                onClick={() =>
                  openWindow("open-inventory")
                }
              >
                <span className="header-menu-icon">
                  📊
                </span>

                <span>
                  <strong>Inventory</strong>
                  <small>
                    Review stock and inventory status
                  </small>
                </span>
              </button>

<button
  type="button"
  role="menuitem"
  onClick={() =>
    openWindow("open-sales")
  }
>
  <span className="header-menu-icon">
    🧾
  </span>

  <span>
    <strong>Sales</strong>
    <small>
      Review sales, invoices and payment status
    </small>
  </span>
</button>
              <div className="header-menu-divider" />

              <button
                type="button"
                role="menuitem"
                onClick={() =>
                  openWindow("open-yard-fees")
                }
              >
                <span className="header-menu-icon">
                  💵
                </span>

                <span>
                  <strong>Yard Fee</strong>
                  <small>Configure yard fee values</small>
                </span>
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() =>
                  openWindow("open-daily-notice")
                }
              >
                <span className="header-menu-icon">
                  📄
                </span>

                <span>
                  <strong>Daily Notice</strong>
                  <small>Edit the daily notice</small>
                </span>
              </button>
              <button
  type="button"
  role="menuitem"
  onClick={() =>
    openWindow("open-business-settings")
  }
>
  <span className="header-menu-icon">
    ⚙️
  </span>

  <span>
    <strong>Business Settings</strong>

    <small>
      Configure business information and logo
    </small>
  </span>
</button>

            </div>
          )}
        </div>

        <div className="header-right">
          <div className="clock">
            {currentTime}
          </div>

          <div className="user">
            <div className="avatar">
              A
            </div>

            <div>
              <strong>Admin</strong>
              <small>Operator</small>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}