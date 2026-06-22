#!/usr/bin/env node
// Postinstall patch: convert @insforge/shared-schemas ESM files to CJS
// The package is pure ESM (type: module, exports only has "import").
// Node 20 CJS cannot require() pure ESM. @insforge/sdk 1.x does:
//   var import_shared_schemas = require("@insforge/shared-schemas");
// This script converts each dist/*.js to dist/*.cjs and adds a "require"
// condition to the package's exports field so require() resolves to CJS.

const fs = require('fs');
const path = require('path');

const pkgDir = path.resolve(__dirname, '..', '..', 'node_modules', '@insforge', 'shared-schemas');
const distDir = path.join(pkgDir, 'dist');
const pkgJson = path.join(pkgDir, 'package.json');

if (!fs.existsSync(distDir)) {
  console.log('[patch-insforge-shared-schemas] dist/ not found, skipping (install may not be done yet)');
  process.exit(0);
}

function esmToCjs(src) {
  return src
    .replace(/^import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"];?\s*$/gm,
      (_, names, mod) => 'const {' + names + '} = require(' + JSON.stringify(mod) + ');')
    .replace(/^import\s+(\w+)\s+from\s+['"]([^'"]+)['"];?\s*$/gm,
      (_, name, mod) => {
        const v = '__' + name + '_mod_' + Math.random().toString(36).slice(2, 8);
        return 'const ' + v + ' = require(' + JSON.stringify(mod) + '); const ' + name + ' = ' + v + ' && ' + v + '.__esModule ? (' + v + '.default || ' + v + ') : ' + v + ';';
      })
    .replace(/^export\s+const\s+(\w+)\s*=/gm, 'module.exports.$1 =')
    .replace(/^export\s+let\s+(\w+)\s*=/gm, 'module.exports.$1 =')
    .replace(/^export\s+var\s+(\w+)\s*=/gm, 'module.exports.$1 =')
    .replace(/^export\s+function\s+(\w+)/gm, 'module.exports.$1 = function $1')
    .replace(/^export\s+class\s+(\w+)/gm, 'module.exports.$1 = class $1')
    .replace(/^export\s+\{([^}]+)\};?\s*$/gm,
      (_, names) => names.split(',').map(n => {
        const trimmed = n.trim();
        const [orig, alias] = trimmed.split(/\s+as\s+/).map(s => s.trim());
        return 'module.exports.' + (alias || orig) + ' = ' + orig + ';';
      }).join('\n'))
    .replace(/^export\s+\*\s+from\s+['"]([^'"]+)['"];?\s*$/gm,
      (_, mod) => {
        const cjsMod = mod.replace(/\.js$/, '.cjs');
        return 'Object.assign(module.exports, require(' + JSON.stringify(cjsMod) + '));';
      })
    .replace(/^export\s+default\s+/gm, 'module.exports.default = ');
}

const jsFiles = fs.readdirSync(distDir).filter(f =>
  f.endsWith('.js') && !f.endsWith('.d.ts') && !f.endsWith('.js.map')
);
let count = 0;
for (const f of jsFiles) {
  const jsPath = path.join(distDir, f);
  const cjsPath = path.join(distDir, f.replace(/\.js$/, '.cjs'));
  const src = fs.readFileSync(jsPath, 'utf8');
  fs.writeFileSync(cjsPath, esmToCjs(src));
  count++;
}

if (fs.existsSync(pkgJson)) {
  const pkg = JSON.parse(fs.readFileSync(pkgJson, 'utf8'));
  if (pkg.exports && pkg.exports['.'] && !pkg.exports['.'].require) {
    pkg.exports['.'].require = './dist/index.cjs';
    fs.writeFileSync(pkgJson, JSON.stringify(pkg, null, 2) + '\n');
    console.log('[patch-insforge-shared-schemas] added require condition to package.json exports');
  }
}

console.log('[patch-insforge-shared-schemas] converted ' + count + ' ESM files to CJS');
