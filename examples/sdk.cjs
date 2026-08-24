const { generateArabicCopy } = require("../dist/index.js");

async function main() {
  const result = await generateArabicCopy({
    projectNiche: "GovTech",
    targetAudience: "Saudi residents",
    toneOfVoice: "Official and clear",
    textType: "Empty state",
    context: "Traffic violation page with no recorded violations",
  });

  console.log(result.options);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
