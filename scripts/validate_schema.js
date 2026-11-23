const fs = require("node:fs");
const path = require("node:path");
const Ajv2020 = require("ajv/dist/2020");
const YAML = require("yaml");
const { generateRoutingSource, outputPath: generatedRoutingPath } = require("./build_routing.js");
const { normalizeArabic } = require("./shared_rules.js");

const rootDir = path.join(__dirname, "..");
const rootPkg = JSON.parse(fs.readFileSync(path.join(rootDir, "package.json"), "utf8"));
const skillRoot = path.join(rootDir, "skills/arabicskill");
const entitiesDir = path.join(skillRoot, "knowledge/entities");
const relationsDir = path.join(skillRoot, "knowledge/relations");
const pluginsDir = path.join(skillRoot, "plugins");
const schemaPath = path.join(entitiesDir, "_schema.yaml");

const SLUG_RE = /^[a-z0-9_-]+$/;
const ALLOWED_SDK_GROUPS = new Set([
  "sector",
  "ui_flow",
  "experience",
  "sensitive",
  "localization",
  "dialects",
  "agent_only",
]);

function isValidIsoCalendarDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

function extractMarkdownH2Headings(content) {
  const headings = [];
  let openFenceChar = null;
  let openFenceLen = 0;

  for (const line of content.split(/\r?\n/u)) {
    if (openFenceChar) {
      const closeMatch = line.match(/^\s{0,3}(`{3,}|~{3,})\s*$/u);
      if (
        closeMatch &&
        closeMatch[1][0] === openFenceChar &&
        closeMatch[1].length >= openFenceLen
      ) {
        openFenceChar = null;
        openFenceLen = 0;
      }
      continue;
    }

    const openMatch = line.match(/^\s{0,3}(`{3,}|~{3,})(.*)$/u);
    if (openMatch && !(openMatch[1][0] === "`" && openMatch[2].includes("`"))) {
      openFenceChar = openMatch[1][0];
      openFenceLen = openMatch[1].length;
      continue;
    }

    if (line.startsWith("## ")) {
      headings.push(line.slice(3).trim());
    }
  }
  return headings;
}

const entityFiles = fs
  .readdirSync(entitiesDir)
  .filter((file) => file.endsWith(".yaml") && !file.startsWith("_"))
  .sort();

if (entityFiles.length === 0) {
  throw new Error("No entity YAML files were found.");
}

let schema;
try {
  schema = YAML.parse(fs.readFileSync(schemaPath, "utf8"));
} catch (error) {
  throw new Error(`Invalid _schema.yaml (${error.message})`);
}
const validateEntity = new Ajv2020({ allErrors: true, strict: false }).compile(schema);
const entities = new Map();
let failed = false;

for (const file of entityFiles) {
  const filePath = path.join(entitiesDir, file);
  let entity;

  try {
    entity = YAML.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    failed = true;
    console.error(`${file}: invalid YAML (${error.message})`);
    continue;
  }

  if (!validateEntity(entity)) {
    failed = true;
    const details = validateEntity.errors.map(
      (error) => `${error.instancePath || "/"} ${error.message}`,
    );
    console.error(`${file}: ${details.join("; ")}`);
    continue;
  }

  const baseName = file.replace(/\.yaml$/, "");
  if (entity.entity !== baseName) {
    failed = true;
    console.error(`${file}: entity field "${entity.entity}" does not match filename "${baseName}"`);
    continue;
  }

  if (!isValidIsoCalendarDate(entity.last_reviewed)) {
    failed = true;
    console.error(`${file}: last_reviewed "${entity.last_reviewed}" is not a valid calendar date`);
    continue;
  }

  entities.set(baseName, entity);
  console.log(`${file}: valid`);
}

for (const [name, entity] of entities.entries()) {
  const refs = [
    ...(entity.inherits ?? []),
    ...(entity.depends_on ?? []),
    ...(entity.requires ?? []),
    ...(entity.optional ?? []),
    ...(entity.conflicts_with ?? []),
    ...(entity.fallback ? [entity.fallback] : []),
  ];

  for (const target of refs) {
    if (target === name) {
      failed = true;
      console.error(`${name}.yaml: self-referential edge "${target}"`);
    } else if (!entities.has(target)) {
      failed = true;
      console.error(`${name}.yaml: unknown entity reference "${target}"`);
    }
  }

  const positiveDeps = new Set([
    ...(entity.inherits ?? []),
    ...(entity.depends_on ?? []),
    ...(entity.requires ?? []),
  ]);
  for (const conflict of entity.conflicts_with ?? []) {
    if (positiveDeps.has(conflict)) {
      failed = true;
      console.error(
        `${name}.yaml: entity "${conflict}" appears in both conflicts_with and inherits/depends_on/requires`,
      );
    }
  }
}

const visiting = new Set();
const visited = new Set();
function checkCycle(name, trail) {
  if (visited.has(name)) {
    return;
  }
  if (visiting.has(name)) {
    failed = true;
    console.error(`Dependency cycle detected: ${[...trail, name].join(" -> ")}`);
    return;
  }

  visiting.add(name);
  const entity = entities.get(name);
  if (entity) {
    const edges = [
      ...(entity.inherits ?? []),
      ...(entity.depends_on ?? []),
      ...(entity.requires ?? []),
      ...(entity.fallback ? [entity.fallback] : []),
    ];
    for (const next of edges) {
      if (entities.has(next)) {
        checkCycle(next, [...trail, name]);
      }
    }
  }
  visiting.delete(name);
  visited.add(name);
}

for (const name of entities.keys()) {
  checkCycle(name, []);
}

let baseWeights;
try {
  baseWeights = YAML.parse(fs.readFileSync(path.join(relationsDir, "weights.yaml"), "utf8"));
} catch (error) {
  failed = true;
  console.error(`weights.yaml: invalid YAML (${error.message})`);
}

const validDomainWeightKeys = new Set();

function validateOverrideTree(label, tree, baseMap) {
  if (!tree || typeof tree !== "object" || Array.isArray(tree)) {
    failed = true;
    console.error(`weights.yaml: ${label} must be an object`);
    return;
  }
  for (const [category, metrics] of Object.entries(tree)) {
    const baseCategory = baseMap[category];
    if (!baseCategory) {
      failed = true;
      console.error(`weights.yaml: ${label} has unknown weight category "${category}"`);
      continue;
    }
    if (!metrics || typeof metrics !== "object" || Array.isArray(metrics)) {
      failed = true;
      console.error(`weights.yaml: ${label}.${category} must be an object`);
      continue;
    }
    for (const [metric, score] of Object.entries(metrics)) {
      if (!(metric in baseCategory)) {
        failed = true;
        console.error(`weights.yaml: ${label} has unknown metric "${category}.${metric}"`);
      } else if (typeof score !== "number" || !Number.isFinite(score) || score < 0 || score > 100) {
        failed = true;
        console.error(`weights.yaml: ${label}.${category}.${metric} must be 0..100`);
      }
    }
  }
}

if (
  baseWeights !== undefined &&
  (!baseWeights ||
    typeof baseWeights !== "object" ||
    Array.isArray(baseWeights) ||
    !baseWeights.weights ||
    typeof baseWeights.weights !== "object" ||
    Array.isArray(baseWeights.weights))
) {
  failed = true;
  console.error("weights.yaml: missing top-level weights object");
} else if (baseWeights) {
  if (baseWeights.inheritance !== "merge_with_base") {
    failed = true;
    console.error('weights.yaml: inheritance must be explicitly set to "merge_with_base"');
  }

  for (const [category, metrics] of Object.entries(baseWeights.weights)) {
    if (!metrics || typeof metrics !== "object" || Array.isArray(metrics)) {
      failed = true;
      console.error(`weights.yaml: weights.${category} must be an object`);
      continue;
    }
    for (const [metric, score] of Object.entries(metrics)) {
      if (typeof score !== "number" || !Number.isFinite(score) || score < 0 || score > 100) {
        failed = true;
        console.error(`weights.yaml: ${category}.${metric} must be a finite number 0..100`);
      }
    }
  }

  if (
    !baseWeights.domain_overrides ||
    typeof baseWeights.domain_overrides !== "object" ||
    Array.isArray(baseWeights.domain_overrides) ||
    Object.keys(baseWeights.domain_overrides).length === 0
  ) {
    failed = true;
    console.error("weights.yaml: domain_overrides must be a non-empty object");
  } else {
    for (const [domainName, overrides] of Object.entries(baseWeights.domain_overrides)) {
      validDomainWeightKeys.add(domainName);
      validateOverrideTree(`domain_overrides.${domainName}`, overrides, baseWeights.weights);
    }
  }

  if (baseWeights.intent_overrides !== undefined) {
    if (
      !baseWeights.intent_overrides ||
      typeof baseWeights.intent_overrides !== "object" ||
      Array.isArray(baseWeights.intent_overrides)
    ) {
      failed = true;
      console.error("weights.yaml: intent_overrides must be an object");
    } else {
      for (const [intentName, overrides] of Object.entries(baseWeights.intent_overrides)) {
        validateOverrideTree(`intent_overrides.${intentName}`, overrides, baseWeights.weights);
      }
    }
  }

  console.log(`weights.yaml: valid (${validDomainWeightKeys.size} domain profile(s))`);
}

let routing;
try {
  routing = YAML.parse(fs.readFileSync(path.join(relationsDir, "routing.yaml"), "utf8"));
} catch (error) {
  failed = true;
  console.error(`routing.yaml: invalid YAML (${error.message})`);
}

if (
  routing !== undefined &&
  (!routing ||
    typeof routing !== "object" ||
    Array.isArray(routing) ||
    !routing.domains ||
    typeof routing.domains !== "object" ||
    Array.isArray(routing.domains) ||
    Object.keys(routing.domains).length === 0)
) {
  failed = true;
  console.error("routing.yaml: missing non-empty domains object");
} else if (routing) {
  if (routing.version !== rootPkg.version) {
    failed = true;
    console.error(
      `routing.yaml: version "${routing.version}" does not match package.json version "${rootPkg.version}"`,
    );
  }

  if (
    !Array.isArray(routing.capabilities) ||
    routing.capabilities.length === 0 ||
    routing.capabilities.some((cap) => typeof cap !== "string" || !cap.trim()) ||
    new Set(routing.capabilities).size !== routing.capabilities.length
  ) {
    failed = true;
    console.error("routing.yaml: capabilities must be a non-empty array of unique strings");
  }

  for (const [domainName, route] of Object.entries(routing.domains)) {
    if (!route || typeof route !== "object" || Array.isArray(route)) {
      failed = true;
      console.error(`routing.yaml[${domainName}]: route must be an object`);
      continue;
    }

    if (
      !Array.isArray(route.keywords) ||
      route.keywords.length === 0 ||
      route.keywords.some((kw) => typeof kw !== "string" || !kw.trim())
    ) {
      failed = true;
      console.error(`routing.yaml[${domainName}]: keywords must be a non-empty array of strings`);
    } else {
      const localSeen = new Set();
      for (const kw of route.keywords) {
        const normalizedKw = normalizeArabic(kw).toLowerCase().trim();
        if (localSeen.has(normalizedKw)) {
          failed = true;
          console.error(
            `routing.yaml[${domainName}]: duplicate keyword "${kw}" within same domain`,
          );
        }
        localSeen.add(normalizedKw);
      }
    }

    for (const optionalListField of ["english_keywords", "exclude_phrases", "region_scope"]) {
      if (
        route[optionalListField] !== undefined &&
        (!Array.isArray(route[optionalListField]) ||
          route[optionalListField].some((item) => typeof item !== "string" || !item.trim()))
      ) {
        failed = true;
        console.error(
          `routing.yaml[${domainName}]: ${optionalListField} must be an array of non-empty strings`,
        );
      }
    }

    if (!ALLOWED_SDK_GROUPS.has(route.sdk_group)) {
      failed = true;
      console.error(
        `routing.yaml[${domainName}]: sdk_group "${route.sdk_group}" must be one of ${[...ALLOWED_SDK_GROUPS].join(", ")}`,
      );
    }

    if (typeof route.reference !== "string" || !route.reference.trim()) {
      failed = true;
      console.error(`routing.yaml[${domainName}]: missing reference path`);
      continue;
    }

    const refPath = path.resolve(skillRoot, route.reference);
    const relToSkill = path.relative(skillRoot, refPath);
    if (relToSkill.startsWith("..") || path.isAbsolute(relToSkill)) {
      failed = true;
      console.error(
        `routing.yaml[${domainName}]: reference "${route.reference}" escapes skill directory`,
      );
      continue;
    }
    if (!fs.existsSync(refPath)) {
      failed = true;
      console.error(`routing.yaml[${domainName}]: missing reference ${route.reference}`);
      continue;
    }

    if (route.section !== undefined) {
      if (typeof route.section !== "string" || !route.section.trim()) {
        failed = true;
        console.error(`routing.yaml[${domainName}]: section must be a non-empty string`);
      } else {
        const headings = extractMarkdownH2Headings(fs.readFileSync(refPath, "utf8"));
        if (!headings.some((heading) => heading.startsWith(route.section))) {
          failed = true;
          console.error(
            `routing.yaml[${domainName}]: section "${route.section}" not found in ${route.reference}`,
          );
        }
      }
    }

    if (route.entity !== undefined) {
      if (
        typeof route.entity !== "string" ||
        !SLUG_RE.test(route.entity) ||
        !entities.has(route.entity)
      ) {
        failed = true;
        console.error(`routing.yaml[${domainName}]: unknown or invalid entity "${route.entity}"`);
      }
    }

    if (route.weight_profile !== undefined) {
      if (
        typeof route.weight_profile !== "string" ||
        !validDomainWeightKeys.has(route.weight_profile)
      ) {
        failed = true;
        console.error(
          `routing.yaml[${domainName}]: unknown weight_profile "${route.weight_profile}" in weights.yaml`,
        );
      }
    }

    if (route.plugin !== undefined) {
      if (typeof route.plugin !== "string" || !SLUG_RE.test(route.plugin)) {
        failed = true;
        console.error(`routing.yaml[${domainName}]: invalid plugin slug "${route.plugin}"`);
      } else {
        const manifestPath = path.join(pluginsDir, route.plugin, "plugin.yaml");
        if (!fs.existsSync(manifestPath)) {
          failed = true;
          console.error(`routing.yaml[${domainName}]: missing plugin "${route.plugin}"`);
        }
      }
    }
  }

  const expectedGenerated = generateRoutingSource().replace(/\r\n/g, "\n");
  const currentGenerated = fs.existsSync(generatedRoutingPath)
    ? fs.readFileSync(generatedRoutingPath, "utf8").replace(/\r\n/g, "\n")
    : "";
  if (currentGenerated !== expectedGenerated) {
    failed = true;
    console.error(
      "src/routing.generated.ts is out of sync with routing.yaml. Run `npm run build:routing`.",
    );
  }

  console.log(`routing.yaml: ${Object.keys(routing.domains).length} domain route(s) validated.`);
}

if (failed) {
  process.exit(1);
}

console.log(`${entityFiles.length} entity schema(s) validated.`);
