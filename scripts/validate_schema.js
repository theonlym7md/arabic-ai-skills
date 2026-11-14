const fs = require("node:fs");
const path = require("node:path");
const Ajv2020 = require("ajv/dist/2020");
const YAML = require("yaml");

const skillRoot = path.join(__dirname, "../skills/arabicskill");
const entitiesDir = path.join(skillRoot, "knowledge/entities");
const relationsDir = path.join(skillRoot, "knowledge/relations");
const pluginsDir = path.join(skillRoot, "plugins");
const schemaPath = path.join(entitiesDir, "_schema.yaml");

const entityFiles = fs
  .readdirSync(entitiesDir)
  .filter((file) => file.endsWith(".yaml") && !file.startsWith("_"));

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

function sameMetricTree(left, right) {
  if (typeof left !== typeof right) {
    return false;
  }
  if (!left || typeof left !== "object" || Array.isArray(left) || Array.isArray(right)) {
    return left === right;
  }
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  if (leftKeys.length !== rightKeys.length) {
    return false;
  }
  return leftKeys.every(
    (key) => Object.hasOwn(right, key) && sameMetricTree(left[key], right[key]),
  );
}

let baseWeights;
try {
  baseWeights = YAML.parse(fs.readFileSync(path.join(relationsDir, "weights.yaml"), "utf8"));
} catch (error) {
  failed = true;
  console.error(`weights.yaml: invalid YAML (${error.message})`);
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

  const domainWeightsDir = path.join(relationsDir, "domain_weights");
  const weightFiles = fs.readdirSync(domainWeightsDir).filter((file) => file.endsWith(".yaml"));
  const parsedDomainWeights = new Map();

  for (const file of weightFiles) {
    let parsed;
    try {
      parsed = YAML.parse(fs.readFileSync(path.join(domainWeightsDir, file), "utf8"));
    } catch (error) {
      failed = true;
      console.error(`domain_weights/${file}: invalid YAML (${error.message})`);
      continue;
    }
    if (
      !parsed ||
      typeof parsed !== "object" ||
      Array.isArray(parsed) ||
      typeof parsed.domain !== "string" ||
      !parsed.domain.trim() ||
      !parsed.weights ||
      typeof parsed.weights !== "object" ||
      Array.isArray(parsed.weights)
    ) {
      failed = true;
      console.error(`domain_weights/${file}: missing domain or weights object`);
      continue;
    }

    if (parsedDomainWeights.has(parsed.domain)) {
      failed = true;
      console.error(`domain_weights/${file}: duplicate domain "${parsed.domain}"`);
      continue;
    }
    parsedDomainWeights.set(parsed.domain, parsed.weights);

    for (const [category, metrics] of Object.entries(parsed.weights)) {
      const baseCategory = baseWeights.weights[category];
      if (!baseCategory) {
        failed = true;
        console.error(`domain_weights/${file}: unknown weight category "${category}"`);
        continue;
      }
      if (!metrics || typeof metrics !== "object" || Array.isArray(metrics)) {
        failed = true;
        console.error(`domain_weights/${file}: category "${category}" must be an object`);
        continue;
      }
      for (const [metric, score] of Object.entries(metrics)) {
        if (!(metric in baseCategory)) {
          failed = true;
          console.error(`domain_weights/${file}: unknown metric "${category}.${metric}"`);
        } else if (
          typeof score !== "number" ||
          !Number.isFinite(score) ||
          score < 0 ||
          score > 100
        ) {
          failed = true;
          console.error(`domain_weights/${file}: ${category}.${metric} must be 0..100`);
        }
      }
    }

    console.log(`domain_weights/${file}: valid`);
  }

  const domainOverrides = baseWeights.domain_overrides ?? {};
  if (!domainOverrides || typeof domainOverrides !== "object" || Array.isArray(domainOverrides)) {
    failed = true;
    console.error("weights.yaml: domain_overrides must be an object");
  } else {
    for (const [domainName, weightsObj] of parsedDomainWeights.entries()) {
      if (!Object.hasOwn(domainOverrides, domainName)) {
        failed = true;
        console.error(
          `weights.yaml: domain_overrides is missing "${domainName}" from domain_weights/`,
        );
      } else if (!sameMetricTree(domainOverrides[domainName], weightsObj)) {
        failed = true;
        console.error(
          `weights.yaml: domain_overrides.${domainName} does not match domain_weights/`,
        );
      }
    }
    for (const domainName of Object.keys(domainOverrides)) {
      if (!parsedDomainWeights.has(domainName)) {
        failed = true;
        console.error(
          `weights.yaml: domain_overrides.${domainName} has no matching file in domain_weights/`,
        );
      }
    }
  }
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
    Array.isArray(routing.domains))
) {
  failed = true;
  console.error("routing.yaml: missing domains object");
} else if (routing) {
  const seenKeywords = new Map();
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
      for (const kw of route.keywords) {
        const normalizedKw = kw.toLowerCase().trim();
        const existingOwner = seenKeywords.get(normalizedKw);
        if (existingOwner && existingOwner !== domainName) {
          failed = true;
          console.error(
            `routing.yaml[${domainName}]: duplicate keyword "${kw}" already assigned to "${existingOwner}"`,
          );
        } else {
          seenKeywords.set(normalizedKw, domainName);
        }
      }
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

    if (route.section) {
      const content = fs.readFileSync(refPath, "utf8");
      const headings = content
        .split(/\r?\n/)
        .filter((line) => line.startsWith("## "))
        .map((line) => line.slice(3).trim());
      if (!headings.some((heading) => heading.startsWith(route.section))) {
        failed = true;
        console.error(
          `routing.yaml[${domainName}]: section "${route.section}" not found in ${route.reference}`,
        );
      }
    }

    if (route.entity && !entities.has(route.entity)) {
      failed = true;
      console.error(`routing.yaml[${domainName}]: unknown entity "${route.entity}"`);
    }

    if (route.weight_profile) {
      const profilePath = path.join(relationsDir, "domain_weights", `${route.weight_profile}.yaml`);
      if (!fs.existsSync(profilePath)) {
        failed = true;
        console.error(
          `routing.yaml[${domainName}]: missing weight_profile "${route.weight_profile}"`,
        );
      }
    }

    if (route.plugin) {
      const manifestPath = path.join(pluginsDir, route.plugin, "plugin.yaml");
      if (!fs.existsSync(manifestPath)) {
        failed = true;
        console.error(`routing.yaml[${domainName}]: missing plugin "${route.plugin}"`);
      }
    }
  }
  console.log(`routing.yaml: ${Object.keys(routing.domains).length} domain route(s) validated.`);
}

if (failed) {
  process.exit(1);
}

console.log(`${entityFiles.length} entity schema(s) validated.`);
