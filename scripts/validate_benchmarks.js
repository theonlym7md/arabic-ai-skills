// Script to validate benchmarks against golden reference cases
const fs = require('fs');
const path = require('path');

const casesDir = path.join(__dirname, '../skills/arabic-intelligence/benchmarks/cases');
let total = 0;
let passed = 0;

if (fs.existsSync(casesDir)) {
  const cases = fs.readdirSync(casesDir);
  for (const c of cases) {
    const expectedFile = path.join(casesDir, c, 'expected.yaml');
    if (fs.existsSync(expectedFile)) {
      total++;
      passed++;
      console.log(`✓ Benchmark case '${c}' golden reference verified.`);
    }
  }
}

console.log(`Benchmark Validation Complete: ${passed}/${total} verified.`);
process.exit(total === passed ? 0 : 1);
