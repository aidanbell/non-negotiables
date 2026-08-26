import eslint from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
/**
 * ESLint config.
 *
 * Consuming project needs:
 *   npm i -D eslint typescript typescript-eslint @eslint/js eslint-config-prettier
 */
export default defineConfig(
  globalIgnores(["dist/**", "build/**", "coverage/**", ".next/**"]),
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // import rules
      "import/first": "error",
      "import/newline-after-import": "error",
      "import/no-duplicates": "error",
      "import/no-unresolved": "error",
      "import/order": "error",
      "import/prefer-default-export": "off",
      "import/extensions": "error",
      "import/no-anonymous-default-export": "error",
      "import/consistent-type-specifier-style": "prefer-top-level",
      // js rules
      "no-unused-vars": "error",
      "prefer-const": "error",
      "no-var": "error",
      "no-console": "warn",
      // typescript rules
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unnecessary-condition": "warn",
      "@typescript-eslint/no-unnecessary-type-assertion": "warn",
      "@typescript-eslint/method-signature-style": "warn",
      "@typescript-eslint/consistent-type-imports": "error",
      // style rules
      "@stylistic/spaced-comment": "error",
    },
  },
  eslintConfigPrettier,
);
