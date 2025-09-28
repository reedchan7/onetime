import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Test files patterns
    include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    // Exclude patterns
    exclude: ["**/node_modules/**", "**/dist/**"],
    // Test environment
    environment: "node",
    // Enable TypeScript support
    globals: true,
  },
});
