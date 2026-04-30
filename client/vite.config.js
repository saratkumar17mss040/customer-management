import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API requests to the Express backend
      // http://localhost:5173/customers -> http://localhost:5000/customers
      "/customers": {
        target: "http://localhost:5000",
        // Changes host header with port 5000
        changeOrigin: true,
        // validates ssl certificates if set to true
        secure: false,
      },
    },
  },
});
