import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@opencoven/ui/globals.css";
import "./specimens.css";
import { App } from "./app";
import { DeveloperShowcase } from "./developer-showcase";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Specimen root is missing");
}

const normalizedPath = window.location.pathname.replace(/\/+$/, "") || "/";

createRoot(root).render(
  <StrictMode>
    {normalizedPath === "/developer" ? <DeveloperShowcase /> : <App />}
  </StrictMode>,
);
