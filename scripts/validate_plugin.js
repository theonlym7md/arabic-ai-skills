const fs = require("node:fs");
const path = require("node:path");
const YAML = require("yaml");

const pluginsDir = path.join(__dirname, "../skills/arabicskill/plugins");
const entitiesDir = path.join(__dirname, "../skills/arabicskill/knowledge/entities");
const plugins = fs
  .readdirSync(pluginsDir)
  .filter((entry) => fs.statSync(path.join(pluginsDir, entry)).isDirectory());

if (plugins.length === 0) {
  throw new Error("No plugin directories were found.");
}

const requiredFields = [
  "api_version",
  "min_framework_version",
  "max_framework_version",
  "plugin_version",
  "name",
  "description",
  "triggers",
  "capabilities",
  "entities",
];
let failed = false;

for (const plugin of plugins) {
  const manifestPath = path.join(pluginsDir, plugin, "plugin.yaml");

  if (!fs.existsSync(manifestPath)) {
    failed = true;
    console.error(`${plugin}: missing plugin.yaml`);
    continue;
  }

  let manifest;
  try {
    manifest = YAML.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch (error) {
    failed = true;
    console.error(`${plugin}: invalid YAML (${error.message})`);
    continue;
  }

  const missing = requiredFields.filter((field) => manifest[field] === undefined);
  if (missing.length > 0) {
    failed = true;
    console.error(`${plugin}: missing ${missing.join(", ")}`);
    continue;
  }

  if (!Array.isArray(manifest.capabilities) || manifest.capabilities.length === 0) {
    failed = true;
    console.error(`${plugin}: capabilities must be a non-empty array`);
    continue;
  }

  const missingEntities = manifest.entities.filter(
    (entity) => !fs.existsSync(path.join(entitiesDir, `${entity}.yaml`)),
  );
  if (missingEntities.length > 0) {
    failed = true;
    console.error(`${plugin}: unknown entities ${missingEntities.join(", ")}`);
    continue;
  }

  console.log(`${plugin}: valid`);
}

if (failed) {
  process.exit(1);
}

console.log(`${plugins.length} plugin manifest(s) validated.`);
