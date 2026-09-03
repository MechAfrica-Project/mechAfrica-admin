// Some tools (Vitest/Vite) will load PostCSS during tests. When running
// in the test environment we avoid loading Tailwind's PostCSS plugin to
// prevent startup errors (tests don't need full PostCSS processing).
const isTest = Boolean(process.env.VITEST || process.env.NODE_ENV === "test");

const config = isTest
  ? { plugins: [] }
  : { plugins: ["@tailwindcss/postcss"] };

export default config;
