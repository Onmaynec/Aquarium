const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const html = read('index.html');
const app = read('app.js');
const manifestScript = read('assets/manifest.js');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const htmlIds = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
const referencedIds = new Set([...app.matchAll(/\$\(['"]#([^'"]+)['"]\)/g)].map(match => match[1]));
const missingIds = [...referencedIds].filter(id => !htmlIds.has(id));
assert(missingIds.length === 0, `Missing HTML elements referenced by app.js: ${missingIds.join(', ')}`);

const functionNames = [...app.matchAll(/\bfunction\s+([A-Za-z_$][\w$]*)\s*\(/g)].map(match => match[1]);
const duplicates = functionNames.filter((name, index) => functionNames.indexOf(name) !== index);
assert(duplicates.length === 0, `Duplicate function declarations: ${[...new Set(duplicates)].join(', ')}`);

assert(!/\bfetch\s*\(/.test(app), 'app.js must not use fetch() so file:// launch remains portable');
assert(manifestScript.startsWith('window.AQUARIUM_MANIFEST='), 'assets/manifest.js must declare window.AQUARIUM_MANIFEST');

const embeddedImages = (manifestScript.match(/data:image\//g) || []).length;
const embeddedAudio = (manifestScript.match(/data:audio\//g) || []).length;
const externalAssets = [...new Set([...manifestScript.matchAll(/["'](assets\/[A-Za-z0-9._/-]+\.(?:svg|webp|png|ogg))["']/g)].map(match => match[1]))];
const externalImages = externalAssets.filter(file => /\.(?:svg|webp|png)$/.test(file));
const externalAudio = externalAssets.filter(file => /\.ogg$/.test(file));
assert(embeddedImages >= 10 || externalImages.length >= 10, 'Image assets are missing');
assert(embeddedAudio >= 3 || externalAudio.length >= 3, 'Audio assets are missing');
for (const file of externalAssets) assert(fs.existsSync(path.join(root, file)), `Manifest asset is missing: ${file}`);

for (const file of [
  'index.html',
  'styles.css',
  'app.js',
  'manifest.webmanifest',
  'service-worker.js',
  'START-AQUARIUM.bat',
  'assets/manifest.js',
  'assets/icon-192.png',
  'assets/icon-512.png'
]) {
  assert(fs.existsSync(path.join(root, file)), `Required file is missing: ${file}`);
}

const webmanifest = JSON.parse(read('manifest.webmanifest'));
assert(webmanifest.name.includes('V6'), 'PWA manifest version is incorrect');
assert(webmanifest.icons.some(icon => icon.sizes === '192x192'), '192x192 PWA icon is missing');
assert(webmanifest.icons.some(icon => icon.sizes === '512x512'), '512x512 PWA icon is missing');

for (const id of ['oceanLab','labModal','smartKeeper','telemetryChart','missionGrid','biomeGrid']) assert(htmlIds.has(id), `Ocean Lab element is missing: ${id}`);
assert(app.includes('Living Aquarium V6 Ocean Lab extension'), 'V6 extension is missing');
assert(app.includes('living-aquarium-v6-slot-'), 'V6 save migration is missing');
assert(app.includes('biomeDefs'), 'Biome definitions are missing');

console.log(JSON.stringify({
  ok: true,
  htmlIds: htmlIds.size,
  referencedIds: referencedIds.size,
  embeddedImages,
  embeddedAudio,
  externalImages: externalImages.length,
  externalAudio: externalAudio.length
}));
