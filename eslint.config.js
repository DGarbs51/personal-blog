import js from "@eslint/js";
import astro from "eslint-plugin-astro";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      "no-unused-vars": "warn",
      "prefer-const": "error",
      "no-console": "warn",
    },
  },
  ...astro.configs.recommended,
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      ".astro/**",
      "*.log",
      ".env*",
      ".DS_Store",
      "Thumbs.db",
    ],
  },
];
