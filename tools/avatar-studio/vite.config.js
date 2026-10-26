import { defineConfig } from "vite";

/**
 * The avatar viewer uses plain CSS and must not inherit the root Next.js
 * Tailwind/PostCSS pipeline. An inline config prevents ancestor config lookup.
 */
export default defineConfig({
  css: {
    postcss: { plugins: [] },
  },
});
