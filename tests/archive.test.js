const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { test } = require("node:test");

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
    fs.copyFileSync(
      path.join(__dirname, "..", ".gitattributes"),
      path.join(fixture, ".gitattributes"),
    );
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
