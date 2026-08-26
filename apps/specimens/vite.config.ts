import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // The generated shadcn registry lives in the workspace-root `public/` so that
  // `shadcn build` and the deployed site publish the same files.
  publicDir: new URL("../../public", import.meta.url).pathname,
  resolve: {
    alias: [
      {
        find: "@opencoven/ui/globals.css",
        replacement: new URL(
          "../../packages/ui/src/styles/globals.css",
          import.meta.url,
        ).pathname,
      },
      {
        find: "@opencoven/ui",
        replacement: new URL("../../packages/ui/src", import.meta.url).pathname,
      },
    ],
  },
  build: {
    sourcemap: true,
  },
});
