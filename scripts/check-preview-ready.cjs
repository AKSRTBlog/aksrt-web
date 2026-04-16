const { existsSync } = require('node:fs');
const { resolve } = require('node:path');

const outputEntry = resolve(__dirname, '..', '.output', 'server', 'index.mjs');

if (!existsSync(outputEntry)) {
  console.error('Nuxt preview requires an existing build. Run `npm run build` first.');
  process.exit(1);
}
