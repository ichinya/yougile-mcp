import js from "@eslint/js";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import prettierConfig from "eslint-config-prettier/flat";
import prettierPlugin from "eslint-plugin-prettier";
import globals from "globals";

export default [
  {
    ignores: ["build/**", "coverage/**", "docs/**", "node_modules/**"],
  },
  {
    files: ["src/**/*.ts"],
    ...js.configs.recommended,
    languageOptions: {
      globals: globals.node,
      parser: typescriptParser,
      parserOptions: {
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": typescriptPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      ...typescriptPlugin.configs.recommended.rules,
      ...prettierConfig.rules,
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", caughtErrors: "none" },
      ],
      "no-unused-vars": "off",
      "prettier/prettier": "error",
    },
  },
  {
    files: ["**/*.{js,cjs}"],
    ...js.configs.recommended,
    languageOptions: {
      ...js.configs.recommended.languageOptions,
      ecmaVersion: "latest",
      globals: globals.node,
      sourceType: "commonjs",
    },
    plugins: { prettier: prettierPlugin },
    rules: {
      ...prettierConfig.rules,
      "prettier/prettier": "error",
    },
  },
  {
    files: ["eslint.config.js", "yougile.js", "test/**/*.js", "test-mcp.js"],
    languageOptions: { sourceType: "module" },
  },
];
