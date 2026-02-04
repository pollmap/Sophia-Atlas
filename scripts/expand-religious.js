const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'data', 'persons', 'religious-figures.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Load all expansion parts
const parts = [];
for (let i = 1; i <= 10; i++) {
  const partPath = path.join(__dirname, `expand-part${i}.json`);
  if (fs.existsSync(partPath)) {
    const partData = JSON.parse(fs.readFileSync(partPath, 'utf8'));
    Object.assign(parts, partData); // merge
    for (const [id, fields] of Object.entries(partData)) {
      const entry = data.find(d => d.id === id);
      if (entry) {
        if (fields.summary) entry.summary = fields.summary;
        if (fields.detailed) entry.detailed = fields.detailed;
      } else {
        console.error(`Entry not found: ${id}`);
      }
    }
  }
}

// Validate
data.forEach((entry, i) => {
  const sLen = entry.summary.length;
  const dLen = entry.detailed.length;
  const sOk = sLen >= 140 && sLen <= 260;
  const dOk = dLen >= 750 && dLen <= 1550;
  if (!sOk) console.log(`WARN summary ${entry.id}: ${sLen} chars`);
  if (!dOk) console.log(`WARN detailed ${entry.id}: ${dLen} chars`);
});

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('Done! Updated', data.length, 'entries');
