import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/aisle/",
  plugins: [react()],
  server: { port: 5186, strictPort: true },
});
