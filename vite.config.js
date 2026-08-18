import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import adminConfig from "./staging.config.js";

function adminBaseRedirectPlugin(basePath) {
  const base = (basePath || "/").replace(/\/$/, "") || "";
  if (!base || base === "/") return { name: "admin-base-redirect" };

  return {
    name: "admin-base-redirect",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const raw = req.url || "/";
        const qIndex = raw.indexOf("?");
        const pathname = qIndex === -1 ? raw : raw.slice(0, qIndex);
        const query = qIndex === -1 ? "" : raw.slice(qIndex);

        if (pathname === base) {
          res.writeHead(301, { Location: `${base}/${query}` });
          res.end();
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const isLocal = env.VITE_APP_ENV === "local";
  const base = env.VITE_BASE || adminConfig.base;

  return {
    base,
    plugins: [react(), tailwindcss(), adminBaseRedirectPlugin(base)],
    server: {
      port: isLocal ? adminConfig.devPort : 3003,
      allowedHosts: [
        "mejoric.com",
        "www.mejoric.com",
        "admin.mejoric.com",
        "admin-dev.mejoric.com",
        "192.168.1.9",
        "localhost",
      ],
      open: base.endsWith("/") ? base : `${base}/`,
      proxy: {
        "/mateandmentors": {
          target: "http://localhost:3002",
          changeOrigin: true,
        },
        "/staging-api": {
          target: "http://localhost:3002",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/staging-api/, ""),
        },
        "/socket.io": {
          target: "http://localhost:3002",
          ws: true,
          changeOrigin: true,
        },
      },
    },
  };
});
