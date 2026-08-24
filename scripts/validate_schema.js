const fs = require("node:fs");
const path = require("node:path");
const Ajv2020 = require("ajv/dist/2020");
const YAML = require("yaml");

const entitiesDir = path.join(__dirname, "../skills/arabic-intelligence/knowledge/entities");
const schemaPath = path.join(entitiesDir, "_schema.yaml");
const files = fs
  .readdirSync(entitiesDir)
  .filter((file) => file.endsWith(".yaml") && !file.startsWith("_"));

if (files.length === 0) {
  throw new Error("No entity YAML files were found.");
}

const schema = YAML.parse(fs.readFileSync(schemaPath, "utf8"));
const validate = new Ajv2020({ allErrors: true, strict: false }).compile(schema);
let failed = false;

for (const file of files) {
  const filePath = path.join(entitiesDir, file);
  let entity;

  try {
    entity = YAML.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    failed = true;
    console.error(`${file}: invalid YAML (${error.message})`);
    continue;
  }

  if (!validate(entity)) {
    failed = true;
    const details = validate.errors.map((error) => `${error.instancePath || "/"} ${error.message}`);
    console.error(`${file}: ${details.join("; ")}`);
    continue;
  }

  console.log(`${file}: valid`);
}

if (failed) {
  process.exit(1);
}

console.log(`${files.length} entity schema(s) validated.`);
