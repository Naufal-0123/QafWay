import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    // Teruskan /api ke backend Go agar tidak perlu atur CORS saat development
    proxy: {
      "/api": "http://localhost:8080",
    },
  },
});
