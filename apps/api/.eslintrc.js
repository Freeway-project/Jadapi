module.exports = {
  extends: ["eslint:recommended", "@typescript-eslint/recommended"],
  parser: "@typescript-eslint/parser",
  env: {
    node: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
  ignorePatterns: ["dist", "node_modules"],
};