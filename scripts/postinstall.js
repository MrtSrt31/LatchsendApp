#!/usr/bin/env node
/**
 * Patches Next.js 16.1.6 bundled http-errors to guard against
 * missing ImATeapot (HTTP 418) — removed from statuses v2+.
 * Without this patch the dev/prod server crashes on startup.
 */
const fs = require("fs");
const path = require("path");

const target = path.join(
  __dirname, "..", "node_modules", "next",
  "dist", "compiled", "raw-body", "index.js"
);

if (!fs.existsSync(target)) {
  console.log("[postinstall] raw-body bundle not found, skipping patch.");
  process.exit(0);
}

const content = fs.readFileSync(target, "utf8");

const BROKEN = `e["I'mateapot"]=a.function(e.ImATeapot,'"I\\'mateapot"; use "ImATeapot" instead')`;
const FIXED  = `if(typeof e.ImATeapot==="function"){e["I'mateapot"]=a.function(e.ImATeapot,'"I\\'mateapot"; use "ImATeapot" instead')}`;

if (content.includes(FIXED)) {
  console.log("[postinstall] Next.js raw-body already patched.");
  process.exit(0);
}

if (!content.includes(BROKEN)) {
  console.log("[postinstall] Patch pattern not found — may already be fixed upstream.");
  process.exit(0);
}

fs.writeFileSync(target, content.replace(BROKEN, FIXED), "utf8");
console.log("[postinstall] Applied Next.js raw-body patch (ImATeapot guard).");
