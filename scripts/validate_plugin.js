const fs = require("node:fs");
const path = require("node:path");
const YAML = require("yaml");

const rootDir = path.join(__dirname, "..");
const pluginsDir = path.join(rootDir, "skills/arabicskill/plugins");
const entitiesDir = path.join(rootDir, "skills/arabicskill/knowledge/entities");
const routingPath = path.join(rootDir, "skills/arabicskill/knowledge/relations/routing.yaml");
const frameworkPkgPath = path.join(rootDir, "skills/arabicskill/package.json");
const rootPkgPath = path.join(rootDir, "package.json");

const SLUG_RE = /^[a-z0-9_-]+$/;

const plugins = fs
  .readdirSync(pluginsDir)
  .filter((entry) => fs.statSync(path.join(pluginsDir, entry)).isDirectory())
  .sort();

if (plugins.length === 0) {
  throw new Error("No plugin directories were found.");
}

const validEntities = new Set(
  fs
    .readdirSync(entitiesDir)
    .filter((file) => file.endsWith(".yaml") && !file.startsWith("_"))
    .map((file) => file.replace(/\.yaml$/, "")),
);

const routingData = YAML.parse(fs.readFileSync(routingPath, "utf8"));
const validCapabilities = new Set(routingData?.capabilities ?? []);

const frameworkVersion = JSON.parse(fs.readFileSync(frameworkPkgPath, "utf8")).version;
const rootVersion = JSON.parse(fs.readFileSync(rootPkgPath, "utf8")).version;
if (frameworkVersion !== rootVersion) {
  throw new Error(
    `skills/arabicskill/package.json version (${frameworkVersion}) must match root package.json (${rootVersion}).`,
  );
}

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

function isValidIsoDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const [y, m, d] = value.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

function validateFrameworkRange(rangeExpr, targetSemver, minSemver, maxSemver) {
  if (typeof rangeExpr !== "string" || !rangeExpr.trim()) {
    return { valid: false, reason: "framework_version must be a non-empty string" };
  }
  const tokens = rangeExpr.trim().split(/\s+/);
  for (const token of tokens) {
    const match = token.match(/^(>=|<=|>|<|=)?(\d+\.\d+\.\d+)$/);
    if (!match) {
      return { valid: false, reason: `invalid framework_version comparator "${token}"` };
    }
    const op = match[1] ?? "=";
    const bound = parseSemver(match[2]);
    const check = (candidate) => {
      const cmp = compareSemver(candidate, bound);
      return (
        (op === ">=" && cmp >= 0) ||
        (op === "<=" && cmp <= 0) ||
        (op === ">" && cmp > 0) ||
        (op === "<" && cmp < 0) ||
        (op === "=" && cmp === 0)
      );
    };
    if (!check(targetSemver)) {
      return {
        valid: false,
        reason: `framework version ${targetSemver.join(".")} does not satisfy "${token}"`,
      };
    }
    if (minSemver && !check(minSemver)) {
      return {
        valid: false,
        reason: `min_framework_version ${minSemver.join(".")} contradicts framework_version "${token}"`,
      };
    }
    if (maxSemver && !check(maxSemver)) {
      return {
        valid: false,
        reason: `max_framework_version ${maxSemver.join(".")} contradicts framework_version "${token}"`,
      };
    }
  }
  return { valid: true };
}

const currentSemver = parseSemver(frameworkVersion);
if (!currentSemver) {
  throw new Error(`Invalid arabicskill package.json version: ${frameworkVersion}`);
}

const pluginSet = new Set(plugins);
const pluginDependencies = new Map();
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
const allowedFields = new Set([
  ...requiredFields,
  "framework_version",
  "deprecated_after",
  "replacement",
  "migration_guide",
  "dependencies",
]);

let failed = false;

for (const plugin of plugins) {
  const manifestPath = path.join(pluginsDir, plugin, "plugin.yaml");
  const errors = [];

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

  const unknownKeys = Object.keys(manifest).filter((key) => !allowedFields.has(key));
  if (unknownKeys.length > 0) {
    errors.push(`unexpected key(s): ${unknownKeys.join(", ")}`);
  }

  const missing = requiredFields.filter((field) => manifest[field] === undefined);
  if (missing.length > 0) {
    errors.push(`missing ${missing.join(", ")}`);
  }

  if (
    typeof manifest.name !== "string" ||
    manifest.name !== plugin ||
    !SLUG_RE.test(manifest.name)
  ) {
    errors.push(`manifest name "${manifest.name}" must match folder slug "${plugin}"`);
  }

  if (typeof manifest.description !== "string" || !manifest.description.trim()) {
    errors.push("description must be a non-empty string");
  }

  if (manifest.api_version !== 1) {
    errors.push(`unsupported api_version (${manifest.api_version}); expected 1`);
  }

  const minSemver = parseSemver(manifest.min_framework_version);
  const maxSemver = parseSemver(manifest.max_framework_version);
  const pluginSemver = parseSemver(manifest.plugin_version);
  if (!minSemver || !maxSemver || !pluginSemver) {
    errors.push("version fields must follow X.Y.Z semver");
  } else {
    if (compareSemver(minSemver, maxSemver) > 0) {
      errors.push("min_framework_version exceeds max_framework_version");
    }
    if (
      compareSemver(minSemver, currentSemver) > 0 ||
      compareSemver(currentSemver, maxSemver) > 0
    ) {
      errors.push(
        `framework version ${frameworkVersion} is outside ${manifest.min_framework_version}..${manifest.max_framework_version}`,
      );
    }
  }

  if (manifest.framework_version !== undefined) {
    const rangeCheck = validateFrameworkRange(
      manifest.framework_version,
      currentSemver,
      minSemver,
      maxSemver,
    );
    if (!rangeCheck.valid) {
      errors.push(rangeCheck.reason);
    }
  }

  if (
    manifest.deprecated_after !== undefined &&
    manifest.deprecated_after !== "" &&
    !isValidIsoDate(manifest.deprecated_after)
  ) {
    errors.push(`deprecated_after "${manifest.deprecated_after}" must be empty or YYYY-MM-DD`);
  }
  if (
    manifest.replacement !== undefined &&
    manifest.replacement !== "" &&
    (typeof manifest.replacement !== "string" || !SLUG_RE.test(manifest.replacement))
  ) {
    errors.push(`replacement "${manifest.replacement}" must be empty or a valid plugin slug`);
  }
  if (manifest.migration_guide !== undefined && typeof manifest.migration_guide !== "string") {
    errors.push("migration_guide must be a string");
  }

  if (
    !manifest.triggers ||
    typeof manifest.triggers !== "object" ||
    Array.isArray(manifest.triggers) ||
    Object.keys(manifest.triggers).length === 0 ||
    Object.values(manifest.triggers).some(
      (list) =>
        !Array.isArray(list) ||
        list.length === 0 ||
        list.some((item) => typeof item !== "string" || !item.trim()),
    )
  ) {
    errors.push("triggers must map each key to a non-empty array of strings");
  }

  if (
    !Array.isArray(manifest.capabilities) ||
    manifest.capabilities.length === 0 ||
    manifest.capabilities.some((cap) => typeof cap !== "string" || !validCapabilities.has(cap))
  ) {
    errors.push(
      `capabilities must be non-empty values from routing.yaml (${[...validCapabilities].join(", ")})`,
    );
  }

  if (
    !Array.isArray(manifest.entities) ||
    manifest.entities.length === 0 ||
    manifest.entities.some(
      (entity) => typeof entity !== "string" || !SLUG_RE.test(entity) || !validEntities.has(entity),
    ) ||
    new Set(manifest.entities).size !== manifest.entities.length
  ) {
    errors.push(
      "entities must be a non-empty list of unique valid entity slugs (excluding _schema)",
    );
  }

  if (manifest.dependencies !== undefined) {
    if (
      !Array.isArray(manifest.dependencies) ||
      manifest.dependencies.some((dep) => typeof dep !== "string" || !dep.trim())
    ) {
      errors.push("dependencies must be an array of non-empty strings");
    } else {
      const badDeps = manifest.dependencies.filter((dep) => dep === plugin || !pluginSet.has(dep));
      if (badDeps.length > 0) {
        errors.push(`invalid dependencies ${badDeps.join(", ")}`);
      }
      if (new Set(manifest.dependencies).size !== manifest.dependencies.length) {
        errors.push("duplicate dependencies listed");
      }
      pluginDependencies.set(plugin, manifest.dependencies);
    }
  }

  if (errors.length > 0) {
    failed = true;
    for (const msg of errors) {
      console.error(`${plugin}: ${msg}`);
    }
  } else {
    console.log(`${plugin}: valid`);
  }
}

const visitingPlugins = new Set();
const visitedPlugins = new Set();
function checkPluginCycle(name, trail) {
  if (visitedPlugins.has(name)) {
    return;
  }
  if (visitingPlugins.has(name)) {
    failed = true;
    console.error(`Plugin dependency cycle detected: ${[...trail, name].join(" -> ")}`);
    return;
  }
  visitingPlugins.add(name);
  for (const dep of pluginDependencies.get(name) ?? []) {
    checkPluginCycle(dep, [...trail, name]);
  }
  visitingPlugins.delete(name);
  visitedPlugins.add(name);
}

for (const plugin of plugins) {
  checkPluginCycle(plugin, []);
}

if (failed) {
  process.exit(1);
}

console.log(`${plugins.length} plugin manifest(s) validated.`);
