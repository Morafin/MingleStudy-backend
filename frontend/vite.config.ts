import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ["cow-cpu-natural-willow.trycloudflare.com"],
    proxy: { "/api": "http://localhost:8080" },
  },
});
