#!/usr/bin/env tsx

import { readFileSync } from 'fs';
import { join } from 'path';

console.log('🔍 Checking dependencies...');

// Simple dependency check - can be expanded later
const rootPackage = JSON.parse(readFileSync('package.json', 'utf8'));
const webPackage = JSON.parse(readFileSync('apps/web/package.json', 'utf8'));
const apiPackage = JSON.parse(readFileSync('apps/api/package.json', 'utf8'));

// Check for basic required dependencies
const required = {
  web: ['next', 'react', 'react-dom'],
  api: ['express', 'cors']
};

let hasIssues = false;

// Check web dependencies
for (const dep of required.web) {
  if (!webPackage.dependencies?.[dep] && !webPackage.devDependencies?.[dep]) {
    console.error(`❌ Missing ${dep} in web package`);
    hasIssues = true;
  }
}

// Check API dependencies
for (const dep of required.api) {
  if (!apiPackage.dependencies?.[dep] && !apiPackage.devDependencies?.[dep]) {
    console.error(`❌ Missing ${dep} in API package`);
    hasIssues = true;
  }
}

if (!hasIssues) {
  console.log('✅ Dependencies look good');
  process.exit(0);
} else {
  console.log('❌ Dependency issues found');
  process.exit(1);
}
