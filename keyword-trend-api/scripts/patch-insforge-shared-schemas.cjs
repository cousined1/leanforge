#!/usr/bin/env node
// Postinstall patch: add a `require` condition to @insforge/shared-schemas'
// package.json exports map. The package is pure ESM (no CJS exports), but the
// @insforge/sdk 1.x CJS bundle (which gets installed by `^1.0.0`) does
// `require("@insforge/shared-schemas")` at runtime. We rely on Node 20.17+'s
// --experimental-require-module flag (passed in the start command) to require
// the ESM file from our CJS server.
//
// Path resolution: try the keyword-trend-api/node_modules location first
// (where the SDK and its deps are nested), then fall back to the workspace
// root node_modules (in case npm hoists them).

const fs = require('fs');
const path = require('path');

const candidateRoots = [
  path.join(__dirname, '..', 'node_modules'),
  path.join(__dirname, '..', '..', 'node_modules'),
];

let pkgJsonPath = null;
for (const root of candidateRoots) {
  const candidate = path.join(
    root,
    '@insforge',
    'shared-schemas',
    'package.json'
  );
  if (fs.existsSync(candidate)) {
    pkgJsonPath = candidate;
    break;
  }
}

if (!pkgJsonPath) {
  console.log(
    '[patch-insforge-shared-schemas] @insforge/shared-schemas not found, skipping'
  );
  process.exit(0);
}

const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));

if (!pkg.exports || !pkg.exports['.']) {
  console.log(
    '[patch-insforge-shared-schemas] no exports["."] field, skipping'
  );
  process.exit(0);
}

if (pkg.exports['.'].require) {
  console.log(
    '[patch-insforge-shared-schemas] require condition already present, no change needed'
  );
  process.exit(0);
}

// Point require to the same ESM file as import. Combined with the start
// command's `--experimental-require-module` flag, this lets CJS code
// `require("@insforge/shared-schemas")` and have Node load the ESM bundle.
pkg.exports['.'].require = pkg.exports['.'].import || './dist/index.js';

fs.writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, 2) + '\n');

console.log(
  '[patch-insforge-shared-schemas] added require condition: ' +
    pkg.exports['.'].require
);
