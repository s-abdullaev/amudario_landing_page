import { defineConfig } from "astro/config";

export default defineConfig({
  server: { port: 4321 },
  build: { assets: "assets/_astro" }
});
