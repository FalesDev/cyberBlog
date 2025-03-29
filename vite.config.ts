import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import type { ProxyOptions } from "vite";

export default defineConfig(({ mode }) => {
  // Cargar variables de entorno
  const env = loadEnv(mode, process.cwd(), "VITE_");

  // Configuración dinámica del proxy
  const proxyConfig: Record<string, ProxyOptions> =
    mode === "development"
      ? {
          "/api": {
            target: env.VITE_API_URL || "http://localhost:8080",
            changeOrigin: true,
            rewrite: (path: string) => path.replace(/^\/api/, "/api/v1"),
          },
        }
      : {};

  return {
    plugins: [react()],
    server: {
      proxy: proxyConfig,
    },
  };
});
