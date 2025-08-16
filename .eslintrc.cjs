/** Root ESLint config for monorepo */
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module"
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],

  ignorePatterns: [
    "node_modules/",
    "dist/",
    ".next/",
    "build/",
    "coverage/",
    "**/*.d.ts",
    "**/*.js.map",
    "**/*.d.ts.map"
  ],

  overrides: [
    // Web app: browser globals + Next.js config
    {
      files: ["apps/web/**/*.{ts,tsx,js,jsx}"],
      env: { browser: true, node: false },
      extends: ["next/core-web-vitals", "plugin:@typescript-eslint/recommended"],
      rules: {
        "@next/next/no-img-element": "warn",
        "@next/next/no-html-link-for-pages": "warn",
        "no-console": "warn",
        "@typescript-eslint/no-explicit-any": "warn"
      }
    },
    
    // API: Node environment with proper globals
    {
      files: ["apps/api/**/*.{ts,tsx,js,jsx}"],
      env: { 
        node: true, 
        browser: false, 
        es2022: true 
      },
      rules: {
        "no-console": "off",
        "no-undef": "off",
        "@typescript-eslint/no-explicit-any": "warn",
        "@typescript-eslint/no-unused-vars": ["error", { 
          argsIgnorePattern: "^_", 
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_"
        }]
      }
    },
    
    // Packages: Node environment
    {
      files: ["packages/**/*.{ts,tsx,js,jsx}"],
      env: { 
        node: true, 
        browser: false, 
        es2022: true 
      },
      rules: {
        "no-console": "warn",
        "@typescript-eslint/no-explicit-any": "warn",
        "@typescript-eslint/no-unused-vars": ["error", { 
          argsIgnorePattern: "^_", 
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_"
        }]
      }
    }
  ]
};
