import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";
import POS from "./pages/POS";

window.addEventListener("error", (event) => {
  window.electronAPI?.logRendererError?.(
    `${event.message || "Window error"}\n${event.error?.stack || ""}`
  );
});

window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason;
  window.electronAPI?.logRendererError?.(
    `Unhandled rejection: ${reason?.stack || reason?.message || String(reason)}`
  );
});

const root = ReactDOM.createRoot(
  document.getElementById("root")
);

root.render(
  <React.StrictMode>
    <POS />
  </React.StrictMode>
);
