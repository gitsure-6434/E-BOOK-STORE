import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Dev proxy must match the API port in server/.env (PORT).
 * Default 5001 avoids macOS Control Center / AirPlay often binding :5000 and returning 403 to HTTP.
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiTarget = env.VITE_API_PROXY_TARGET || "http://127.0.0.1:5001";

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: true
        },
        "/uploads": {
          target: apiTarget,
          changeOrigin: true
        }
      }
    }
  };
});
