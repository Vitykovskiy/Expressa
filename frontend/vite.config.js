import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

const proxyTarget = process.env.VITE_API_BASE_URL || "http://127.0.0.1";

export default defineConfig({
  plugins: [vue()],
  server: {
    host: "127.0.0.1",
    port: 4173,
    proxy: {
      "/customer": proxyTarget,
      "/backoffice": proxyTarget,
      "/admin": proxyTarget,
      "/healthz": proxyTarget
    }
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ["vue"],
          vuetify: ["vuetify"]
        }
      }
    }
  },
  test: {
    environment: "jsdom",
    setupFiles: "./vitest.setup.js",
    server: {
      deps: {
        inline: ["vuetify"]
      }
    }
  }
});
