#!/usr/bin/env node

/**
 * Sophia Atlas Data Validation Script
 * Usage: node scripts/validate-data.js
 *
 * Validates all JSON data files for:
 * - Schema completeness (required fields)
 * - ID uniqueness
 * - Cross-reference integrity (relationships point to existing nodes)
 * - Era-period consistency
 * - Orphan node detection
 * - Duplicate relationship detection
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');

// ── Load Data ──

function loadJSON(relativePath) {
  const fullPath = path.join(DATA_DIR, relativePath);
  if (!fs.existsSync(fullPath)) {
    console.warn(`  ⚠ File not found: ${relativePath}`);
    return [];
  }
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

const philosophers = loadJSON('persons/philosophers.json');
const religiousFigures = loadJSON('persons/religious-figures.json');
const scientists = loadJSON('persons/scientists.json');
const historicalFigures = loadJSON('persons/historical-figures.json');

const allPersons = [...philosophers, ...religiousFigures, ...scientists, ...historicalFigures];

const events = loadJSON('entities/events.json');
const ideologies = loadJSON('entities/ideologies.json');
const movements = loadJSON('entities/movements.json');
const institutions = loadJSON('entities/institutions.json');
const texts = loadJSON('entities/texts.json');
const concepts = loadJSON('entities/concepts.json');

const allEntities = [...events, ...ideologies, ...movements, ...institutions, ...texts, ...concepts];

const ppRels = loadJSON('relationships/person-person.json');
const peRels = loadJSON('relationships/person-entity.json');
const eeRels = loadJSON('relationships/entity-entity.json');

const allRelationships = [...ppRels, ...peRels, ...eeRels];

// ── Validation State ──

let errors = 0;
let warnings = 0;

function error(msg) {
  console.error(`  ✗ ERROR: ${msg}`);
  errors++;
}

function warn(msg) {
  console.warn(`  ⚠ WARN:  ${msg}`);
  warnings++;
}

function info(msg) {
  console.log(`  ✓ ${msg}`);
}

// ── 1. Person Validation ──

console.log('\n━━━ 1. Person Validation ━━━');
console.log(`  Total persons: ${allPersons.length}`);

const VALID_ERAS = ['ancient', 'medieval', 'modern', 'contemporary'];
const VALID_CATEGORIES = ['philosopher', 'religious_figure', 'scientist', 'historical_figure', 'cultural_figure'];

const personIds = new Set();
let duplicatePersonIds = 0;

for (const p of allPersons) {
  // Required fields
  if (!p.id) error(`Person missing id: ${JSON.stringify(p).slice(0, 80)}`);
  if (!p.name?.ko) error(`Person ${p.id}: missing name.ko`);
  if (!p.name?.en) error(`Person ${p.id}: missing name.en`);
  if (!p.era) error(`Person ${p.id}: missing era`);
  if (!p.category) error(`Person ${p.id}: missing category`);
  if (!p.summary) error(`Person ${p.id}: missing summary`);

  // ID uniqueness
  if (p.id && personIds.has(p.id)) {
    error(`Duplicate person ID: ${p.id}`);
    duplicatePersonIds++;
  }
  if (p.id) personIds.add(p.id);

  // Era validity
  if (p.era && !VALID_ERAS.includes(p.era)) {
    error(`Person ${p.id}: invalid era "${p.era}"`);
  }

  // Category validity
  if (p.category && !VALID_CATEGORIES.includes(p.category)) {
    error(`Person ${p.id}: invalid category "${p.category}"`);
  }

  // Period validation
  if (p.period) {
    if (typeof p.period.start !== 'number') {
      error(`Person ${p.id}: period.start is not a number`);
    }
    if (typeof p.period.end !== 'number') {
      error(`Person ${p.id}: period.end is not a number`);
    }
    if (p.period.end !== 0 && p.period.start > p.period.end) {
      error(`Person ${p.id}: period.start (${p.period.start}) > period.end (${p.period.end})`);
    }
  }

  // Era-period consistency
  if (p.era && p.period?.start != null) {
    const start = p.period.start;
    if (p.era === 'ancient' && start > 500) {
      warn(`Person ${p.id}: era=ancient but born in ${start}`);
    }
    if (p.era === 'contemporary' && start < 1800) {
      warn(`Person ${p.id}: era=contemporary but born in ${start}`);
    }
  }

  // Location validation
  if (p.location) {
    if (typeof p.location.lat !== 'number' || typeof p.location.lng !== 'number') {
      warn(`Person ${p.id}: invalid location coordinates`);
    }
    if (p.location.lat < -90 || p.location.lat > 90) {
      error(`Person ${p.id}: latitude out of range: ${p.location.lat}`);
    }
    if (p.location.lng < -180 || p.location.lng > 180) {
      error(`Person ${p.id}: longitude out of range: ${p.location.lng}`);
    }
  }

  // Summary length
  if (p.summary && p.summary.length < 10) {
    warn(`Person ${p.id}: summary too short (${p.summary.length} chars)`);
  }
}

info(`${personIds.size} unique person IDs`);
if (duplicatePersonIds === 0) info('No duplicate person IDs');

// Category breakdown
const categoryBreakdown = {};
for (const p of allPersons) {
  categoryBreakdown[p.category] = (categoryBreakdown[p.category] || 0) + 1;
}
info(`Category breakdown: ${Object.entries(categoryBreakdown).map(([k, v]) => `${k}=${v}`).join(', ')}`);

// MVP count
const mvpCount = allPersons.filter(p => p.mvp).length;
info(`MVP persons: ${mvpCount}`);

// ── 2. Entity Validation ──

console.log('\n━━━ 2. Entity Validation ━━━');
console.log(`  Total entities: ${allEntities.length}`);

const VALID_ENTITY_TYPES = ['event', 'ideology', 'movement', 'institution', 'text', 'nation', 'concept', 'tradition', 'archetype', 'art_movement', 'technology'];
const entityIds = new Set();

for (const e of allEntities) {
  if (!e.id) error(`Entity missing id: ${JSON.stringify(e).slice(0, 80)}`);
  if (!e.name?.ko) error(`Entity ${e.id}: missing name.ko`);
  if (!e.type) error(`Entity ${e.id}: missing type`);
  if (!e.summary) error(`Entity ${e.id}: missing summary`);

  if (e.id && entityIds.has(e.id)) {
    error(`Duplicate entity ID: ${e.id}`);
  }
  if (e.id) entityIds.add(e.id);

  if (e.type && !VALID_ENTITY_TYPES.includes(e.type)) {
    error(`Entity ${e.id}: invalid type "${e.type}"`);
  }
}

info(`${entityIds.size} unique entity IDs`);

// Entity type breakdown
const entityTypeBreakdown = {};
for (const e of allEntities) {
  entityTypeBreakdown[e.type] = (entityTypeBreakdown[e.type] || 0) + 1;
}
info(`Type breakdown: ${Object.entries(entityTypeBreakdown).map(([k, v]) => `${k}=${v}`).join(', ')}`);

// ── 3. ID Collision Check ──

console.log('\n━━━ 3. Cross-ID Collision Check ━━━');
const allIds = new Set([...personIds, ...entityIds]);
const collisions = [...personIds].filter(id => entityIds.has(id));
if (collisions.length > 0) {
  for (const id of collisions) {
    error(`ID collision between person and entity: "${id}"`);
  }
} else {
  info('No ID collisions between persons and entities');
}

// ── 4. Relationship Validation ──

console.log('\n━━━ 4. Relationship Validation ━━━');
console.log(`  Total relationships: ${allRelationships.length}`);
console.log(`  person-person: ${ppRels.length}, person-entity: ${peRels.length}, entity-entity: ${eeRels.length}`);

const VALID_PP_TYPES = ['influenced', 'opposed', 'developed', 'parallel', 'contextual', 'teacher_student', 'collaborated', 'contemporary'];
const VALID_PE_TYPES = ['founded', 'member_of', 'participated', 'caused', 'affected_by', 'authored', 'advocated', 'criticized', 'belongs_to'];
const VALID_EE_TYPES = ['preceded', 'caused', 'part_of', 'opposed_to', 'evolved_into', 'influenced'];

let brokenSourceCount = 0;
let brokenTargetCount = 0;
let selfRefCount = 0;
const relKeys = new Set();
let duplicateRelCount = 0;

for (const r of allRelationships) {
  // Required fields
  if (!r.source) error(`Relationship missing source`);
  if (!r.target) error(`Relationship missing target`);
  if (!r.type) error(`Relationship missing type: ${r.source} → ${r.target}`);

  // Reference integrity
  if (r.source && !allIds.has(r.source)) {
    brokenSourceCount++;
    if (brokenSourceCount <= 5) error(`Relationship source not found: "${r.source}" (→ ${r.target})`);
  }
  if (r.target && !allIds.has(r.target)) {
    brokenTargetCount++;
    if (brokenTargetCount <= 5) error(`Relationship target not found: "${r.target}" (${r.source} →)`);
  }

  // Self-reference
  if (r.source && r.source === r.target) {
    selfRefCount++;
    error(`Self-referencing relationship: ${r.source}`);
  }

  // Duplicate detection
  const key = `${r.source}|${r.target}|${r.type}`;
  if (relKeys.has(key)) {
    duplicateRelCount++;
    if (duplicateRelCount <= 5) warn(`Duplicate relationship: ${r.source} → ${r.target} (${r.type})`);
  }
  relKeys.add(key);

  // Type validity
  if (r.sourceType === 'person' && r.targetType === 'person') {
    if (r.type && !VALID_PP_TYPES.includes(r.type)) {
      warn(`Person-person relationship invalid type: "${r.type}" (${r.source} → ${r.target})`);
    }
  }
}

if (brokenSourceCount > 5) error(`... and ${brokenSourceCount - 5} more broken sources`);
if (brokenTargetCount > 5) error(`... and ${brokenTargetCount - 5} more broken targets`);
if (brokenSourceCount === 0 && brokenTargetCount === 0) info('All relationship references are valid');
if (selfRefCount === 0) info('No self-referencing relationships');
if (duplicateRelCount === 0) {
  info('No duplicate relationships');
} else {
  warn(`${duplicateRelCount} duplicate relationships found`);
}

// ── 5. Orphan Node Detection ──

console.log('\n━━━ 5. Orphan Node Detection ━━━');

const connectedIds = new Set();
for (const r of allRelationships) {
  if (allIds.has(r.source)) connectedIds.add(r.source);
  if (allIds.has(r.target)) connectedIds.add(r.target);
}

const orphanPersons = allPersons.filter(p => !connectedIds.has(p.id));
const orphanEntities = allEntities.filter(e => !connectedIds.has(e.id));

if (orphanPersons.length > 0) {
  warn(`${orphanPersons.length} persons have NO relationships:`);
  for (const p of orphanPersons.slice(0, 10)) {
    warn(`  - ${p.id} (${p.name.ko})`);
  }
  if (orphanPersons.length > 10) warn(`  ... and ${orphanPersons.length - 10} more`);
} else {
  info('All persons have at least one relationship');
}

if (orphanEntities.length > 0) {
  warn(`${orphanEntities.length} entities have NO relationships:`);
  for (const e of orphanEntities.slice(0, 10)) {
    warn(`  - ${e.id} (${e.name.ko})`);
  }
  if (orphanEntities.length > 10) warn(`  ... and ${orphanEntities.length - 10} more`);
} else {
  info('All entities have at least one relationship');
}

// ── 6. Connection Density Stats ──

console.log('\n━━━ 6. Connection Statistics ━━━');

const connectionCounts = {};
for (const r of allRelationships) {
  if (allIds.has(r.source)) connectionCounts[r.source] = (connectionCounts[r.source] || 0) + 1;
  if (allIds.has(r.target)) connectionCounts[r.target] = (connectionCounts[r.target] || 0) + 1;
}

const counts = Object.values(connectionCounts).sort((a, b) => b - a);
const avgConnections = counts.length > 0 ? (counts.reduce((a, b) => a + b, 0) / counts.length).toFixed(1) : 0;
const maxConnections = counts[0] || 0;
const medianConnections = counts[Math.floor(counts.length / 2)] || 0;

info(`Average connections per node: ${avgConnections}`);
info(`Median connections per node: ${medianConnections}`);
info(`Max connections: ${maxConnections}`);

// Top 10 most connected
const topConnected = Object.entries(connectionCounts)
  .sort(([, a], [, b]) => b - a)
  .slice(0, 10);

info('Top 10 most connected:');
for (const [id, count] of topConnected) {
  const person = allPersons.find(p => p.id === id);
  const entity = allEntities.find(e => e.id === id);
  const name = person?.name?.ko || entity?.name?.ko || id;
  console.log(`    ${count.toString().padStart(3)} connections: ${name} (${id})`);
}

// ── Summary ──

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`  Persons:       ${allPersons.length}`);
console.log(`  Entities:      ${allEntities.length}`);
console.log(`  Relationships: ${allRelationships.length}`);
console.log(`  Total nodes:   ${allIds.size}`);
console.log('');

if (errors > 0) {
  console.error(`  ✗ ${errors} ERRORS found. Fix before deploying.`);
  process.exit(1);
} else if (warnings > 0) {
  console.warn(`  ⚠ ${warnings} warnings (non-blocking).`);
  console.log('  ✓ No critical errors. Data is valid.');
  process.exit(0);
} else {
  console.log('  ✓ All data valid. No errors or warnings.');
  process.exit(0);
}
