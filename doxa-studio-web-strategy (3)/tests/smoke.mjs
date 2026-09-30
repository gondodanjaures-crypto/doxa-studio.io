/* ------------------------------------------------------------------ */
/* Test de fumée (smoke test) — Doxa Studio                            */
/* ------------------------------------------------------------------ */
/* Monte le bundle de production (dist/index.html) dans jsdom et       */
/* vérifie que l'application React démarre et rend les sections        */
/* principales, sans erreur d'exécution.                              */
/*                                                                    */
/* Usage :  npm run build && npm test                                 */
/* ------------------------------------------------------------------ */

import { readFileSync, existsSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { JSDOM } from "jsdom";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const distFile = join(root, "dist", "index.html");

let failures = 0;
const ok = (label) => console.log(`  ✓ ${label}`);
const fail = (label, detail) => {
  failures++;
  console.error(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`);
};

console.log("▸ Préparation");

if (!existsSync(distFile)) {
  console.error("  ✗ dist/index.html introuvable. Lancez d'abord : npm run build");
  process.exit(1);
}
const html = readFileSync(distFile, "utf8");
ok("dist/index.html lu");

/*1. Le HTML de production contient les éléments essentiels ----------- */
for (const marker of [
  'id="root"',
  "Doxa Studio",
  "DOXA_PROFORMA",
  "application/ld+json",
  'lang="fr"',
]) {
  html.includes(marker) ? ok(`HTML contient « ${marker} »`) : fail(`HTML contient « ${marker} »`);
}

/* 2. Extraction du bundle module (inliné par vite-plugin-singlefile) - */
const moduleScripts = [...html.matchAll(/<script type="module"[^>]*>([\s\S]*?)<\/script>/g)];
if (moduleScripts.length !== 1) {
  fail("extraction du bundle module", `${moduleScripts.length} script(s) module trouvé(s), attendu : 1`);
  process.exit(1);
}
const bundle = moduleScripts[0][1];
ok(`bundle module extrait (${(bundle.length / 1024).toFixed(0)} ko)`);

if (bundle.includes("import(") && /import\(\s*["'`]/.test(bundle)) {
  fail("bundle autonome", "des imports dynamiques externes subsistent");
} else {
  ok("bundle autonome (aucun chunk externe)");
}

/* 3. Exécution dans jsdom ------------------------------------------- */
console.log("▸ Exécution de l'app (jsdom)");

const dom = new JSDOM(html, {
  url: "https://doxa-studio.test/",
  pretendToBeVisual: true,
  runScripts: "dangerously", // exécute les scripts inline (thème, config proforma)
});
const { window } = dom;

/* Le module script n'est pas exécuté par jsdom : on le lance
   manuellement dans le contexte global de Node, habillé comme un
   navigateur. */
const g = globalThis;
const SKIP = new Set([
  "globalThis", "undefined", "NaN", "Infinity", "eval",
  "Object", "Array", "String", "Number", "Boolean", "Symbol", "Promise",
  "Error", "TypeError", "RegExp", "Date", "Map", "Set", "WeakMap", "WeakSet",
  "Proxy", "Reflect", "JSON", "Math", "Intl", "Function",
  "ArrayBuffer", "SharedArrayBuffer", "DataView", "Atomics",
  "Uint8Array", "Int8Array", "Uint16Array", "Int16Array", "Uint32Array",
  "Int32Array", "Float32Array", "Float64Array", "BigUint64Array", "BigInt64Array",
  "BigInt", "URL", "URLSearchParams", "TextEncoder", "TextDecoder",
  "AbortController", "AbortSignal", "EventTarget", "structuredClone",
  "queueMicrotask", "console", "process", "Buffer", "module", "require",
  "setTimeout", "setInterval", "clearTimeout", "clearInterval",
  "setImmediate", "clearImmediate", "performance", "crypto",
]);
for (const key of Object.getOwnPropertyNames(window)) {
  if (SKIP.has(key) || key in g) continue;
  try {
    const value = window[key];
    g[key] = typeof value === "function" && /^[A-Z]/.test(key) ? value : value;
  } catch {
    /* propriétés non accessibles : ignorées */
  }
}
g.window = window;
g.document = window.document;
g.localStorage = window.localStorage;
g.sessionStorage = window.sessionStorage;
g.location = window.location;
g.history = window.history;
/* Timers : on utilise les natifs de Node PARTOUT (y compris sur window)
   pour éviter la récursion interne de jsdom et garder un appairage
   setTimeout/clearTimeout cohérent. */
window.setTimeout = g.setTimeout;
window.setInterval = g.setInterval;
window.clearTimeout = g.clearTimeout;
window.clearInterval = g.clearInterval;
g.requestAnimationFrame = window.requestAnimationFrame.bind(window);
g.cancelAnimationFrame = window.cancelAnimationFrame.bind(window);
g.getComputedStyle = window.getComputedStyle.bind(window);

/* Stubs des API navigateur absentes de jsdom. */
class ObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
}
window.IntersectionObserver ??= ObserverStub;
window.ResizeObserver ??= ObserverStub;
g.IntersectionObserver = window.IntersectionObserver;
g.ResizeObserver = window.ResizeObserver;

window.matchMedia ??= (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {},
  dispatchEvent: () => false,
});
g.matchMedia = window.matchMedia;

window.scrollTo = () => {}; // jsdom ne l'implémente pas : no-op pour le test
window.scroll = () => {};
window.Element.prototype.scrollIntoView ??= () => {};
window.Element.prototype.animate ??= () => ({
  finished: Promise.resolve(),
  cancel() {},
  play() {},
  pause() {},
  finish() {},
  addEventListener() {},
  removeEventListener() {},
});
window.CSS ??= { escape: (s) => String(s), supports: () => false };
g.CSS = window.CSS;
g.fetch ??= () => Promise.reject(new TypeError("réseau désactivé pendant le test"));

const runtimeErrors = [];
window.addEventListener("error", (e) => {
  runtimeErrors.push(String(e.error?.stack ?? e.message ?? e));
});
window.addEventListener("unhandledrejection", (e) => {
  runtimeErrors.push(String(e.reason?.stack ?? e.reason ?? e));
});

/* Lancement du bundle. */
const tmp = mkdtempSync(join(tmpdir(), "doxa-smoke-"));
const bundleFile = join(tmp, "bundle.mjs");
writeFileSync(bundleFile, bundle, "utf8");

try {
  await import(pathToFileURL(bundleFile).href);
  ok("bundle exécuté sans exception fatale");
} catch (e) {
  fail("bundle exécuté", String(e && e.stack ? e.stack.split("\n")[0] : e));
}

/* Laisse React se monter + les effets/timers se terminer. */
await new Promise((r) => setTimeout(r, 2500));

const doc = window.document;
const rootEl = doc.getElementById("root");

/* 4. Assertions sur le rendu ---------------------------------------- */
console.log("▸ Rendu de l'interface");

rootEl && rootEl.children.length > 0
  ? ok(`React a monté l'app (${rootEl.children.length} élément(s) racine)`)
  : fail("React a monté l'app", "#root est vide");

const bodyText = doc.body.textContent ?? "";
for (const marker of [
  "Donnez vie", // hero
  "Showreel 2026",
  "Créatifs par", // à propos
  "Parlons de", // contact
  "Voir nos réalisations",
]) {
  bodyText.includes(marker) ? ok(`texte rendu : « ${marker} »`) : fail(`texte rendu : « ${marker} »`);
}

const landmarks = doc.querySelectorAll("header, nav, main, footer, section").length;
landmarks >= 5
  ? ok(`structure sémantique présente (${landmarks} landmarks)`)
  : fail("structure sémantique", `${landmarks} landmarks trouvés`);

const imgs = [...doc.querySelectorAll("img")];
const imgsAlt = imgs.filter((i) => i.getAttribute("alt") !== null).length;
imgs.length === 0 || imgsAlt === imgs.length
  ? ok(`accessibilité : alt présent sur toutes les images (${imgsAlt}/${imgs.length})`)
  : fail("accessibilité : alt sur les images", `${imgsAlt}/${imgs.length}`);

const h1s = doc.querySelectorAll("h1").length;
h1s === 1 ? ok("un seul <h1>") : fail("un seul <h1>", `${h1s} trouvés`);

/* 5. Erreurs d'exécution -------------------------------------------- */
console.log("▸ Erreurs d'exécution");
const realErrors = runtimeErrors.filter(
  (e) => !/réseau désactivé|network disabled|Failed to fetch|networkerror/i.test(e),
);
if (realErrors.length === 0) {
  ok("aucune erreur JavaScript non gérée");
} else {
  fail("erreurs JavaScript", "");
  for (const e of realErrors.slice(0, 5)) console.error(`    → ${e.split("\n")[0]}`);
}

console.log(failures === 0 ? "\n✅ TOUS LES TESTS PASSENT" : `\n❌ ${failures} ÉCHEC(S)`);
process.exit(failures === 0 ? 0 : 1);
