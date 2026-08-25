import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@opencoven/ui/globals.css";
import "./specimens.css";
import { App } from "./app";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Specimen root is missing");
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
