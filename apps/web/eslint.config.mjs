import nextPlugin from "@next/eslint-plugin-next"
import tsParser from "@typescript-eslint/parser"
import tsPlugin from "@typescript-eslint/eslint-plugin"

const nextConfig = nextPlugin.configs.recommended
const coreWebVitalsConfig = nextPlugin.configs["core-web-vitals"]

export default [
  {
    ignores: [".next/**", "node_modules/**", "dist/**", "next-env.d.ts"]
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        React: "readonly"
      }
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "@next/next": nextPlugin
    },
    rules: {
      ...nextConfig.rules,
      ...coreWebVitalsConfig.rules,
      ...tsPlugin.configs.recommended.rules
    }
  }
]
