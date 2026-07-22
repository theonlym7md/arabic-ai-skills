// Script to validate plugin manifests
const fs = require('fs');
const path = require('path');

const pluginsDir = path.join(__dirname, '../skills/arabic-intelligence/plugins');
const plugins = fs.readdirSync(pluginsDir).filter(f => fs.statSync(path.join(pluginsDir, f)).isDirectory());

console.log(`Validating ${plugins.length} plugin manifests...`);

let passes = 0;
for (const plugin of plugins) {
  const manifestPath = path.join(pluginsDir, plugin, 'plugin.yaml');
  if (fs.existsSync(manifestPath)) {
    const content = fs.readFileSync(manifestPath, 'utf8');
    if (content.includes('api_version:') && content.includes('min_framework_version:')) {
      console.log(`✓ Plugin '${plugin}' passed validation.`);
      passes++;
    } else {
      console.error(`✗ Plugin '${plugin}' manifest invalid.`);
    }
  }
}

console.log(`Plugin Validation Complete: ${passes}/${plugins.length} passed.`);
process.exit(passes === plugins.length ? 0 : 1);
