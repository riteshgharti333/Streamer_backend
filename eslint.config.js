import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  {
    files: ["**/*.js"], // Apply this configuration to all JavaScript files
    languageOptions: {
      sourceType: "module", // Change to 'module' for ES module syntax
      globals: {
        ...globals.browser,
        ...globals.node, // Include Node.js globals
      },
    },
  },
  pluginJs.configs.recommended, // Use the recommended ESLint rules
];
