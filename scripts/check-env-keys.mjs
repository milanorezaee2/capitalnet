// check-env-keys.mjs
import { readFileSync } from 'fs';
const raw = readFileSync('.env', 'utf8');
const keys = [];
for (const line of raw.split('\n')) {
  const t = line.trim();
  if (!t || t.startsWith('#')) continue;
  const eq = t.indexOf('=');
  if (eq < 0) continue;
  keys.push(t.slice(0, eq).trim());
}
console.log('Keys:', keys.join(', '));
