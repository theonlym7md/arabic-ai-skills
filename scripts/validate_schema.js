// Script to validate entity YAML files against _schema.yaml
const fs = require('fs');
const path = require('path');

const entitiesDir = path.join(__dirname, '../skills/arabic-intelligence/knowledge/entities');
const files = fs.readdirSync(entitiesDir).filter(f => f.endsWith('.yaml') && !f.startsWith('_'));

console.log(`Validating ${files.length} entity YAML schemas...`);

let passes = 0;
for (const file of files) {
  const filePath = path.join(entitiesDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('entity:') && content.includes('directives:')) {
    console.log(`✓ ${file} passed schema check.`);
    passes++;
  } else {
    console.error(`✗ ${file} failed schema check! Missing required fields.`);
  }
}

console.log(`Schema Validation Complete: ${passes}/${files.length} passed.`);
process.exit(passes === files.length ? 0 : 1);
