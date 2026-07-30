import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  // No @vitejs/plugin-react: it resolves a different Vite copy than Vitest
  // does, which breaks `tsc --noEmit`. Vitest transforms JSX via esbuild on
  // its own; the plugin only adds Fast Refresh, which tests do not use.
  plugins: [tsconfigPaths()],
  test: {
    // Most suites are pure logic or route handlers and need no DOM. Component
    // tests opt in with a `// @vitest-environment jsdom` docblock.
    environment: "node",
    globals: false,
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules/**", ".next/**"],
    coverage: {
      reporter: ["text", "html"],
      // Only code we actually own and intend to cover.
      include: ["lib/**", "app/api/**", "components/**", "hooks/**"],
      exclude: ["components/ui/**", "lib/mocks/**"],
    },
  },
});
