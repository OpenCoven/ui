import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@opencoven/ui/globals.css";
import "./specimens.css";
import "./specimens-fixes.css";
import { App } from "./app";
import { DeveloperShowcase } from "./developer-showcase";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Specimen root is missing");
}

const normalizedPath = window.location.pathname.replace(/\/+$/, "") || "/";

if (normalizedPath !== "/") {
  window.addEventListener(
    "keydown",
    (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.stopImmediatePropagation();
      }
    },
    { capture: true },
  );
}

createRoot(root).render(
  <StrictMode>
    {normalizedPath === "/developer" ? <DeveloperShowcase /> : <App />}
  </StrictMode>,
);
