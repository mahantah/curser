import js from "@eslint/js";
import jsdoc from "eslint-plugin-jsdoc";
import globals from "globals";

export default [
  {
    ignores: ["node_modules/**", "dist/**", "download/**", ".cursor/**"],
  },
  js.configs.recommended,
  {
    files: ["**/*.js", "**/*.mjs"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: { jsdoc },
    rules: {
      ...jsdoc.configs["flat/recommended"].rules,
      "no-var": "error",
      "prefer-const": "error",
      "jsdoc/require-jsdoc": [
        "error",
        {
          publicOnly: true,
          require: {
            FunctionDeclaration: true,
            ClassDeclaration: true,
            MethodDefinition: true,
          },
        },
      ],
      "jsdoc/check-tag-names": ["error", { definedTags: ["ts-check"] }],
      "jsdoc/require-param-description": "off",
      "jsdoc/require-returns-description": "off",
      "jsdoc/require-property-description": "off",
      "jsdoc/tag-lines": "off",
    },
  },
  {
    files: ["assets/**/*.js"],
    languageOptions: {
      sourceType: "script",
    },
  },
];
