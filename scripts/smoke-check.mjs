#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const warnings = [];

function readJson(relPath) {
  const abs = path.join(root, relPath);
  try {
    const raw = fs.readFileSync(abs, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    errors.push(`${relPath}: ${error.message}`);
    return null;
  }
}

function checkEvents() {
  const events = readJson('events.json');
  if (!events) return;
  const slots = Array.isArray(events.slots) ? events.slots : [];
  const walks = Array.isArray(events.monthlyWalks) ? events.monthlyWalks : [];
  const all = [
    ...slots.map((e) => ({ ...e, __kind: 'assessment' })),
    ...walks.map((e) => ({ ...e, __kind: 'hillwalk' }))
  ];
  const ids = new Set();
  for (const event of all) {
    const id = Number(event.id);
    if (!Number.isFinite(id)) errors.push('events.json: event missing numeric id');
    if (ids.has(id)) errors.push(`events.json: duplicate event id ${id}`);
    ids.add(id);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(event.dateISO || ''))) {
      errors.push(`events.json: event ${id} has invalid dateISO`);
    }
    if (event.__kind === 'hillwalk' && !String(event.skill || '').trim()) {
      errors.push(`events.json: hillwalk ${id} missing skill`);
    }
    if (typeof event.waitlistOnly !== 'boolean') {
      warnings.push(`events.json: event ${id} missing waitlistOnly boolean`);
    }
  }
}

function checkCodebook() {
  const codebook = readJson('codebook.json');
  if (!codebook) return;
  const requiredMaps = [
    'hillWalkUnlockCodesBySkillId',
    'unlockCodesBySkillId',
    'assessmentPassCodesBySkillId',
    'assessmentReworkCodesBySkillId'
  ];
  for (const key of requiredMaps) {
    const map = codebook[key];
    if (!map || typeof map !== 'object' || Array.isArray(map)) {
      errors.push(`codebook.json: ${key} must be an object`);
      continue;
    }
    const missing = [];
    for (let i = 1; i <= 14; i += 1) {
      if (!String(map[i] || '').trim()) missing.push(i);
    }
    if (missing.length) {
      warnings.push(`codebook.json: ${key} missing/empty skill ids ${missing.join(', ')}`);
    }
  }
}

function checkLoaderOrder() {
  const loaderPath = path.join(root, 'js/page-loader.js');
  const text = fs.readFileSync(loaderPath, 'utf8');
  const required = [
    'js/config.js',
    'js/validators.js',
    'js/services/state-store.js',
    'js/services/codebook-service.js',
    'js/services/events-service.js',
    'js/services/backup-service.js',
    'js/services/points-service.js',
    'js/app-core.js',
    'js/app-render.js',
    'js/app-events.js'
  ];
  for (const file of required) {
    if (!text.includes(file)) errors.push(`js/page-loader.js: missing ${file}`);
  }
}

function checkServiceWorker() {
  const swPath = path.join(root, 'service-worker.js');
  if (!fs.existsSync(swPath)) {
    errors.push('service-worker.js: missing file');
    return;
  }
  const text = fs.readFileSync(swPath, 'utf8');
  if (!text.includes('self.addEventListener')) {
    errors.push('service-worker.js: does not look like a service worker');
  }
}

checkEvents();
checkCodebook();
checkLoaderOrder();
checkServiceWorker();

if (warnings.length) {
  console.log('Warnings:');
  for (const w of warnings) console.log(`- ${w}`);
}

if (errors.length) {
  console.error('Smoke check failed:');
  for (const e of errors) console.error(`- ${e}`);
  process.exit(1);
}

console.log('Smoke check passed.');
