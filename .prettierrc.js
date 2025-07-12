export default {
  // Basic formatting options
  semi: true,
  singleQuote: false,
  quoteProps: "as-needed",
  tabWidth: 2,
  useTabs: false,
  trailingComma: "es5",
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: "avoid",
  printWidth: 80,
  endOfLine: "lf",

  // Astro specific configuration
  plugins: ["prettier-plugin-astro"],
  overrides: [
    {
      files: "*.astro",
      options: {
        parser: "astro",
      },
    },
  ],
};
