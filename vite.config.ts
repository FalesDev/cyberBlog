import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
// Si trabajs en local es http://localhost:8080, pero si ya lo subiste a un servidor, colocalo el link generado por el servidor
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://cyberblog-latest.onrender.com",
        changeOrigin: true,
      },
    },
  },
});
