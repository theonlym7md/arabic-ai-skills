const fs = require("node:fs");
const path = require("node:path");
const YAML = require("yaml");

const pluginsDir = path.join(__dirname, "../skills/arabicskill/plugins");
const entitiesDir = path.join(__dirname, "../skills/arabicskill/knowledge/entities");
const frameworkPkgPath = path.join(__dirname, "../skills/arabicskill/package.json");
const plugins = fs
  .readdirSync(pluginsDir)
  .filter((entry) => fs.statSync(path.join(pluginsDir, entry)).isDirectory());

if (plugins.length === 0) {
  throw new Error("No plugin directories were found.");
}

const frameworkVersion = JSON.parse(fs.readFileSync(frameworkPkgPath, "utf8")).version;

function parseSemver(version) {
  if (typeof version !== "string") {
    return null;
  }
  const match = version.trim().match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) {
    return null;
  }
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function compareSemver(a, b) {
  for (let i = 0; i < 3; i += 1) {
    if (a[i] !== b[i]) {
      return a[i] - b[i];
    }
  }
  return 0;
}

const currentSemver = parseSemver(frameworkVersion);
if (!currentSemver) {
  throw new Error(`Invalid arabicskill package.json version: ${frameworkVersion}`);
}

const pluginSet = new Set(plugins);
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

  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    failed = true;
    console.error(`${plugin}: plugin.yaml must be a YAML mapping`);
    continue;
  }

  const missing = requiredFields.filter((field) => manifest[field] === undefined);
  if (missing.length > 0) {
    failed = true;
    console.error(`${plugin}: missing ${missing.join(", ")}`);
    continue;
  }

  if (manifest.api_version !== 1) {
    failed = true;
    console.error(`${plugin}: unsupported api_version (${manifest.api_version}); expected 1`);
    continue;
  }

  const minSemver = parseSemver(manifest.min_framework_version);
  const maxSemver = parseSemver(manifest.max_framework_version);
  const pluginSemver = parseSemver(manifest.plugin_version);
  if (!minSemver || !maxSemver || !pluginSemver) {
    failed = true;
    console.error(`${plugin}: version fields must follow X.Y.Z semver`);
    continue;
  }

  if (compareSemver(minSemver, maxSemver) > 0) {
    failed = true;
    console.error(`${plugin}: min_framework_version exceeds max_framework_version`);
    continue;
  }

  if (compareSemver(minSemver, currentSemver) > 0 || compareSemver(currentSemver, maxSemver) > 0) {
    failed = true;
    console.error(
      `${plugin}: framework version ${frameworkVersion} is outside ${manifest.min_framework_version}..${manifest.max_framework_version}`,
    );
    continue;
  }

  if (
    !manifest.triggers ||
    typeof manifest.triggers !== "object" ||
    Array.isArray(manifest.triggers) ||
    Object.keys(manifest.triggers).length === 0
  ) {
    failed = true;
    console.error(`${plugin}: triggers must be a non-empty object`);
    continue;
  }

  if (
    !Array.isArray(manifest.capabilities) ||
    manifest.capabilities.length === 0 ||
    manifest.capabilities.some((cap) => typeof cap !== "string" || !cap.trim())
  ) {
    failed = true;
    console.error(`${plugin}: capabilities must be a non-empty array of strings`);
    continue;
  }

  if (!Array.isArray(manifest.entities) || manifest.entities.some((e) => typeof e !== "string")) {
    failed = true;
    console.error(`${plugin}: entities must be an array of strings`);
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

  if (manifest.dependencies !== undefined) {
    if (
      !Array.isArray(manifest.dependencies) ||
      manifest.dependencies.some((dep) => typeof dep !== "string")
    ) {
      failed = true;
      console.error(`${plugin}: dependencies must be an array of strings`);
      continue;
    }

    const badDeps = manifest.dependencies.filter((dep) => dep === plugin || !pluginSet.has(dep));
    if (badDeps.length > 0) {
      failed = true;
      console.error(`${plugin}: invalid dependencies ${badDeps.join(", ")}`);
      continue;
    }
  }

  console.log(`${plugin}: valid`);
}

if (failed) {
  process.exit(1);
}

console.log(`${plugins.length} plugin manifest(s) validated.`);
