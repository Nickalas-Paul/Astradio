import { FlatCompat } from '@eslint/eslintrc';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: {},
  allConfig: {}
});

const eslintConfig = [
  {
    ignores: [".next/**/*", "out/**/*", "dist/**/*"]
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["src/app/page.tsx"],
    rules: {
      "@next/next/no-img-element": "warn",
      "@next/next/no-html-link-for-pages": "warn",
      "no-console": "warn",
      "@typescript-eslint/no-explicit-any": "warn"
    }
  }
];

export default eslintConfig;
