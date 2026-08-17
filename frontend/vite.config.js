import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import flowbitePlugin from "flowbite/plugin";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    flowbitePlugin,
  ],
  server: {
    proxy: {
      "/api/": "http://localhost:5000",
      "/uploads/": "http://localhost:5000",
    },
  },
});