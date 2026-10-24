import { defineConfig } from "vite";
import { loadConfig } from "./config/load.mjs";

const { demo } = loadConfig();

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: demo.port,
    strictPort: true,
  },
  preview: {
    host: "0.0.0.0",
    port: demo.port,
    strictPort: true,
  },
});
