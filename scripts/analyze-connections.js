const fs = require("fs");
const path = require("path");

const BASE = path.join(__dirname, "..", "src", "data");

const pe = JSON.parse(fs.readFileSync(path.join(BASE, "relationships", "person-entity.json"), "utf8"));
const ee = JSON.parse(fs.readFileSync(path.join(BASE, "relationships", "entity-entity.json"), "utf8"));

const entityFiles = ["archetypes","art-movements","concepts","events","ideologies","institutions","movements","technologies","texts"];
const allEntities = [];
for (const f of entityFiles) {
  const data = JSON.parse(fs.readFileSync(path.join(BASE, "entities", f + ".json"), "utf8"));
  data.forEach(e => allEntities.push({ id: e.id, type: e.type, tags: e.tags || [], name: e.name }));
}

const entityConns = {};
allEntities.forEach(e => { entityConns[e.id] = 0; });

pe.forEach(r => {
  if (entityConns[r.target] !== undefined) entityConns[r.target]++;
  if (entityConns[r.source] !== undefined) entityConns[r.source]++;
});
ee.forEach(r => {
  if (entityConns[r.source] !== undefined) entityConns[r.source]++;
  if (entityConns[r.target] !== undefined) entityConns[r.target]++;
});

const dist = {};
Object.values(entityConns).forEach(c => { dist[c] = (dist[c] || 0) + 1; });
console.log("Connection distribution:");
Object.keys(dist).sort((a,b) => Number(a)-Number(b)).forEach(k => console.log("  " + k + " connections: " + dist[k] + " entities"));

const zero = Object.entries(entityConns).filter(([k,v]) => v === 0).map(([k]) => k);
const one = Object.entries(entityConns).filter(([k,v]) => v === 1).map(([k]) => k);
const two = Object.entries(entityConns).filter(([k,v]) => v === 2).map(([k]) => k);
console.log("\n0 connections:", zero.length);
console.log("1 connection:", one.length);
console.log("2 connections:", two.length);
console.log("Total under-connected (<3):", zero.length + one.length + two.length);

// Show entity types for each group
for (const [label, arr] of [["0-conn", zero], ["1-conn", one], ["2-conn", two]]) {
  const typeCount = {};
  arr.forEach(id => {
    const e = allEntities.find(x => x.id === id);
    if (e) typeCount[e.type] = (typeCount[e.type] || 0) + 1;
  });
  console.log("\n" + label + " entities by type:");
  Object.entries(typeCount).sort((a,b) => b[1]-a[1]).forEach(([t,c]) => console.log("  " + t + ": " + c));
}
