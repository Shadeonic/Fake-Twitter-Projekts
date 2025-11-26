/* eslint-env node */
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "react", "react-hooks", "import"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:import/typescript",
    "prettier",
    "plugin:react/jsx-runtime",
  ],
  settings: {
    react: {
      version: "detect",
      runtime: "automatic",
    },
  },
  ignorePatterns: ["dist", "build", "node_modules"],
};
