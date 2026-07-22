// Script to generate pristine lightweight ZIP distribution archive excluding .git & node_modules
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const zipPath = path.join(distDir, 'arabic-ai-skills-v1.2.0.zip');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

console.log('Generating pristine distribution archive (excluding .git, node_modules)...');

try {
  // Use git archive for 100% clean distribution without .git internals
  execSync(`git archive --format=zip HEAD -o "${zipPath}"`, { cwd: rootDir });
  const stats = fs.statSync(zipPath);
  console.log(`✓ Clean Archive Generated Successfully!`);
  console.log(`  Path: ${zipPath}`);
  console.log(`  Size: ${(stats.size / 1024).toFixed(2)} KB`);
} catch (err) {
  console.error('✗ Failed to package clean archive:', err.message);
  process.exit(1);
}
