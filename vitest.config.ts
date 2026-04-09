import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd(), "") };

  return {
    plugins: [react()],
    test: {
      environment: "node",
      globals: true,
      include: ["__tests__/**/*.test.ts", "src/**/*.test.ts"],
      coverage: {
        provider: "v8",
        reporter: ["text", "lcov"],
      },
    },
    resolve: {
      alias: {
        "@": resolve(__dirname, "./src"),
      },
    },
  };
});
