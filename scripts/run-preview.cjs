const { spawn } = require('node:child_process');
const { resolve } = require('node:path');

const frontendRoot = resolve(__dirname, '..');
const nodeBin = process.execPath;
const nuxtBin = resolve(frontendRoot, 'node_modules', 'nuxt', 'bin', 'nuxt.mjs');

const child = spawn(nodeBin, [nuxtBin, 'preview', '--port', '3000'], {
  cwd: frontendRoot,
  stdio: 'inherit',
  env: {
    ...process.env,
    NITRO_HOST: process.env.NITRO_HOST || process.env.HOST || '0.0.0.0',
  },
});

child.on('error', (error) => {
  console.error(error);
  process.exit(1);
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
