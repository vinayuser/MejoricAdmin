import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const isLocal = env.VITE_APP_ENV === "local";

  return {
    base: "/admin/", // 🛡️ Set base path for Nginx /admin/ location and Router basename
    plugins: [react(), tailwindcss()],
    server: {
      port: isLocal ? 6003 : 3003,
      allowedHosts: ["mejoric.com", "www.mejoric.com", "192.168.1.9"],
    },
  };
});
