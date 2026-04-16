const { rmSync } = require('node:fs');
const { resolve } = require('node:path');

const frontendRoot = resolve(__dirname, '..');

for (const dirName of ['.nuxt', '.output']) {
  rmSync(resolve(frontendRoot, dirName), {
    recursive: true,
    force: true,
  });
}
