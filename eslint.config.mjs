import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXOpeningElement[name.name='img']",
          message: "Do not use raw <img>. Use <AppImage /> or <UserAvatar /> from '@/components/ui' to leverage loading states and image fallbacks."
        },
        {
          selector: "JSXOpeningElement[name.name='button']",
          message: "Do not use raw <button>. Use <Button /> from '@/components/ui/Button' to support focus indicators and accessibility settings."
        },
        {
          selector: "CallExpression[callee.object.name='JSON'][callee.property.name='parse']",
          message: "Do not call JSON.parse() directly. Use safeParse() from '@/lib/utils' to prevent app crashing on invalid records."
        },
        {
          selector: "JSXAttribute[name.name='style']",
          message: "Do not use inline style objects. Consume standard design tokens or Tailwind CSS variables."
        }
      ]
    }
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "scripts/**"
  ]),
]);

export default eslintConfig;

