import eslint from "@eslint/js";

// Espree defaults to script mode for `.js`; `package.json` `"type": "module"` is not applied automatically.
export default [
  {
    ignores: [
      "dist/**",
      ".astro/**",
      "node_modules/**",
      "**/*.ts",
      "**/*.astro",
      "**/*.mdx",
    ],
  },
  eslint.configs.recommended,
  {
    files: ["**/*.{js,mjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
  },
];
