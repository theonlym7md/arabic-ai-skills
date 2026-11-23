const fs = require("node:fs");
const path = require("node:path");
const YAML = require("yaml");

const root = path.resolve(__dirname, "..");
const routingPath = path.join(
  root,
  "skills",
  "arabicskill",
  "knowledge",
  "relations",
  "routing.yaml",
);
const outputPath = path.join(root, "src", "routing.generated.ts");

function generateRoutingSource() {
  const parsed = YAML.parse(fs.readFileSync(routingPath, "utf8"));
  if (
    !parsed ||
    typeof parsed !== "object" ||
    !parsed.domains ||
    typeof parsed.domains !== "object"
  ) {
    throw new Error("routing.yaml is missing a valid domains map.");
  }

  const entries = Object.entries(parsed.domains).map(([domain, route]) => ({
    domain,
    reference: route.reference,
    section: route.section ?? null,
    sdkGroup: route.sdk_group ?? "agent_only",
    regionScope: Array.isArray(route.region_scope) ? route.region_scope : [],
    keywords: Array.isArray(route.keywords) ? route.keywords : [],
    englishKeywords: Array.isArray(route.english_keywords) ? route.english_keywords : [],
    excludePhrases: Array.isArray(route.exclude_phrases) ? route.exclude_phrases : [],
  }));

  const serialized = JSON.stringify(entries, null, 2);
  return `// AUTO-GENERATED from skills/arabicskill/knowledge/relations/routing.yaml
// Do not edit directly; run \`node scripts/build_routing.js\`.

export type SdkRoutingGroup =
  | "sector"
  | "ui_flow"
  | "experience"
  | "sensitive"
  | "localization"
  | "dialects"
  | "agent_only";

export interface RawRoutingEntry {
  readonly domain: string;
  readonly reference: string;
  readonly section: string | null;
  readonly sdkGroup: SdkRoutingGroup;
  readonly regionScope: readonly string[];
  readonly keywords: readonly string[];
  readonly englishKeywords: readonly string[];
  readonly excludePhrases: readonly string[];
}

export const RAW_ROUTING_ENTRIES: readonly RawRoutingEntry[] = Object.freeze(
  (${serialized} as RawRoutingEntry[]).map((entry) =>
    Object.freeze({
      ...entry,
      regionScope: Object.freeze([...entry.regionScope]),
      keywords: Object.freeze([...entry.keywords]),
      englishKeywords: Object.freeze([...entry.englishKeywords]),
      excludePhrases: Object.freeze([...entry.excludePhrases]),
    }),
  ),
);
`;
}

function main() {
  const checkOnly = process.argv.includes("--check");
  const nextContent = generateRoutingSource();
  if (checkOnly) {
    const current = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, "utf8") : "";
    if (current.replace(/\r\n/g, "\n") !== nextContent.replace(/\r\n/g, "\n")) {
      console.error(
        "src/routing.generated.ts is out of sync with skills/arabicskill/knowledge/relations/routing.yaml. Run `node scripts/build_routing.js`.",
      );
      process.exit(1);
    }
    return;
  }
  fs.writeFileSync(outputPath, nextContent, "utf8");
}

if (require.main === module) {
  main();
}

module.exports = { generateRoutingSource, outputPath };
