import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  // .open-next 와 .wrangler 는 Cloudflare 어댑터가 만드는 빌드 산출물이다.
  globalIgnores([".next/**", "out/**", "build/**", ".open-next/**", ".wrangler/**", "next-env.d.ts"]),
]);
