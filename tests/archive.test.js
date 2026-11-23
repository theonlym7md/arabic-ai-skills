const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { test } = require("node:test");

const root = path.join(__dirname, "..");

test("source archives retain LF text and unchanged binary bytes with Windows Git settings", () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "arabicskill-archive-"));
  const git = (...args) =>
    execFileSync("git", ["-c", "core.autocrlf=true", "-c", "core.eol=crlf", ...args], {
      cwd: fixture,
      stdio: ["ignore", "pipe", "pipe"],
    });
  const source = Buffer.from('const message = "مرحبا";\nconsole.log(message);\n');
  const binary = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0, 13, 10, 10, 255]);

  try {
    fs.copyFileSync(path.join(root, ".gitattributes"), path.join(fixture, ".gitattributes"));
    fs.writeFileSync(path.join(fixture, "source.js"), source);
    fs.writeFileSync(path.join(fixture, "image.png"), binary);
    git("init", "--quiet");
    git("add", ".");
    const tree = git("write-tree").toString().trim();
    const archive = git("archive", "--format=tar", tree);

    assert.ok(archive.includes(source), "archived source must preserve LF line endings");
    assert.ok(archive.includes(binary), "archived binary bytes must remain unchanged");
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
});

function extractTarEntryPaths(tarBuffer) {
  const entries = [];
  let offset = 0;
  while (offset + 512 <= tarBuffer.length) {
    const header = tarBuffer.subarray(offset, offset + 512);
    if (header.every((byte) => byte === 0)) {
      break;
    }
    const name = header.subarray(0, 100).toString("utf8").replace(/\0.*$/u, "");
    const prefix = header.subarray(345, 500).toString("utf8").replace(/\0.*$/u, "");
    const sizeOctal = header.subarray(124, 136).toString("utf8").replace(/\0.*$/u, "").trim();
    const size = sizeOctal ? Number.parseInt(sizeOctal, 8) : 0;
    const fullPath = prefix ? `${prefix}/${name}` : name;
    if (fullPath && fullPath !== "pax_global_header") {
      entries.push(fullPath);
    }
    offset += 512 + Math.ceil(size / 512) * 512;
  }
  return entries;
}

test("committed HEAD archive respects export-ignore rules and packages under top-level prefix", () => {
  const version = JSON.parse(
    execFileSync("git", ["show", "HEAD:package.json"], { cwd: root, encoding: "utf8" }),
  ).version;
  const prefix = `ArabicSkill-v${version}/`;
  const tarBuffer = execFileSync("git", ["archive", "--format=tar", `--prefix=${prefix}`, "HEAD"], {
    cwd: root,
    maxBuffer: 25 * 1024 * 1024,
  });
  const entryPaths = extractTarEntryPaths(tarBuffer);

  assert.ok(
    entryPaths.includes(`${prefix}package.json`),
    "archive must contain prefixed package.json",
  );
  assert.ok(
    entryPaths.includes(`${prefix}skills/arabicskill/SKILL.md`),
    "archive must contain arabicskill SKILL.md",
  );
  const filePaths = entryPaths.filter((entry) => !entry.endsWith("/"));
  assert.equal(
    filePaths.some((entry) => entry.includes("docs/demos/")),
    false,
    "docs/demos/ files must be excluded",
  );
  assert.equal(
    filePaths.some((entry) => entry.includes("docs/assets/ab/")),
    false,
    "docs/assets/ab/ files must be excluded",
  );
  assert.equal(
    filePaths.some((entry) => entry.includes("docs/research/")),
    false,
    "docs/research/ files must be excluded",
  );
  assert.equal(
    filePaths.some((entry) => entry.endsWith(".mp4") || entry.endsWith(".gif")),
    false,
    "demo mp4 and gif must be excluded",
  );
});
