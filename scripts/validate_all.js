// Universal Master System Validator for Schemas, Plugins, and Benchmarks
const { execSync } = require('child_process');
const path = require('path');

console.log('==================================================');
console.log('Running Universal Master System Validator (v1.2.0)...');
console.log('==================================================\n');

try {
  console.log('[1/3] Validating Entity Schemas...');
  execSync('node ' + path.join(__dirname, 'validate_schema.js'), { stdio: 'inherit' });

  console.log('\n[2/3] Validating Plugin Manifests...');
  execSync('node ' + path.join(__dirname, 'validate_plugin.js'), { stdio: 'inherit' });

  console.log('\n[3/3] Validating Benchmark Cases...');
  execSync('node ' + path.join(__dirname, 'validate_benchmarks.js'), { stdio: 'inherit' });

  console.log('\n==================================================');
  console.log('ALL SYSTEM VALIDATIONS PASSED 100% SUCCESSFUL!');
  console.log('==================================================\n');
  process.exit(0);
} catch (err) {
  console.error('\n✗ System Validation Failed:', err.message);
  process.exit(1);
}
