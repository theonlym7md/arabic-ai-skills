const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const { generateRoutingSource, outputPath } = require("./build_routing.js");

const root = path.resolve(__dirname, "..");

function resolveTscPath() {
  return path.join(root, "node_modules", "typescript", "bin", "tsc");
}

function runTsc(args) {
  execFileSync(process.execPath, [resolveTscPath(), ...args], {
    cwd: root,
    stdio: "inherit",
  });
}

function main() {
  const generated = generateRoutingSource();
  const current = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, "utf8") : "";
  if (current.replace(/\r\n/g, "\n") !== generated.replace(/\r\n/g, "\n")) {
    fs.writeFileSync(outputPath, generated, "utf8");
  }

  runTsc(["-p", "tsconfig.json"]);
  runTsc(["-p", "tsconfig.esm.json"]);

  const esmDir = path.join(root, "dist", "esm");
  fs.mkdirSync(esmDir, { recursive: true });
  fs.writeFileSync(path.join(esmDir, "package.json"), '{\n  "type": "module"\n}\n', "utf8");
  fs.writeFileSync(
    path.join(esmDir, "package_root.js"),
    [
      'import * as path from "node:path";',
      'import { fileURLToPath } from "node:url";',
      "",
      'export const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");',
      "",
    ].join("\n"),
    "utf8",
  );
}

main();
