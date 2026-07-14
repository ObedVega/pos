import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";
import POS from "./pages/POS";

const root = ReactDOM.createRoot(
  document.getElementById("root")
);

root.render(
  <React.StrictMode>
    <POS />
  </React.StrictMode>
);