/* Publie le build de production dans le dossier docs/ à la racine du dépôt
   pour GitHub Pages (source : branche arena/…, dossier /docs).
   Usage : npm run deploy:pages */
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(here, "..");
const repoRoot = join(projectRoot, "..");

const from = join(projectRoot, "dist", "index.html");
const docsDir = join(repoRoot, "docs");
mkdirSync(docsDir, { recursive: true });
const to = join(docsDir, "index.html");
copyFileSync(from, to);
console.log(`✓ copié : ${to}`);
console.log("Publiez ensuite la branche (git add docs && git commit && git push).");
