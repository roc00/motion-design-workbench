import { defineConfig } from "vite";
import { cpSync, mkdirSync } from "node:fs";

// 部署到子目录时设置 VITE_BASE_PATH=/motion-lab/
const base = process.env.VITE_BASE_PATH || "/";

export default defineConfig({
  base,
  plugins: [{
    name: "director-reference-assets",
    closeBundle() {
      // These standalone examples are not imported by Vite's JS graph.
      for (const folder of ["snippets", "films", "studio/evidence"]) {
        mkdirSync(`dist/${folder}`, { recursive: true });
        cpSync(folder, `dist/${folder}`, { recursive: true });
      }
    },
  }],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
