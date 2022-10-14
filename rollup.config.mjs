import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";
/**
 * @type {import('rollup').RollupOptions}
 */
export default {
  input: "./src/index.ts",
  output: [
    {
      file: "lib/build.js",
      format: "iife",
    },
  ],
  plugins: [
    typescript({
      outDir: "lib",
      declaration: true,
      declarationDir: "lib",
    }),
    terser(),
  ],
};
