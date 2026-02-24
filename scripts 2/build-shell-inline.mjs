#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourcePath = path.join(root, 'app-shell.html');
const targetPath = path.join(root, 'js', 'app-shell-inline.js');

if (!fs.existsSync(sourcePath)) {
  console.error('Missing app-shell.html');
  process.exit(1);
}

const html = fs.readFileSync(sourcePath, 'utf8');
const escaped = html
  .replace(/\\/g, '\\\\')
  .replace(/`/g, '\\`')
  .replace(/\$\{/g, '\\${');

const out = `// Auto-generated from app-shell.html. Do not edit directly.\nwindow.WH_APP_SHELL = \`\n${escaped}\n\`;\n`;
fs.writeFileSync(targetPath, out, 'utf8');
console.log('Updated js/app-shell-inline.js from app-shell.html');
