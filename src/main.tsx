import React from "react";
import ReactDOM from "react-dom/client";
// import "./index.css"; // DOES NOT EXIST
import "./App.css";     // CORRECT
import "./i18n";
import App from "./App";

console.log("ALEFLOW KERNEL: Booting (Safe Mode)...");

const rootElement = document.getElementById("root");

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("FATAL: Root element missing");
}
