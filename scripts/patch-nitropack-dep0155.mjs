import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const frontendDir = resolve(scriptDir, '..')
const targetFile = resolve(frontendDir, 'node_modules/nitropack/dist/rollup/index.mjs')

if (!existsSync(targetFile)) {
  console.log('[patch-nitropack-dep0155] skipped (nitropack file not found)')
  process.exit(0)
}

const original = readFileSync(targetFile, 'utf8')

if (original.includes('const guessedSpecifier = guessedSubpath')) {
  console.log('[patch-nitropack-dep0155] already patched')
  process.exit(0)
}

const sourceSnippet = `const guessedSubpath = await lookupNodeModuleSubpath(id).catch(() => null);
          const resolvedGuess = guessedSubpath && tryResolve(join(pkgName, guessedSubpath), importer);
          if (resolvedGuess === id) {
            trackedExternals.add(resolvedGuess);
            return {
              id: join(pkgName, guessedSubpath),
              external: true
            };
          }`

const replacementSnippet = `const guessedSubpath = await lookupNodeModuleSubpath(id).catch(() => null);
          const guessedSpecifier = guessedSubpath ? join(pkgName, guessedSubpath).replace(/[\\\\/]+$/, "") : "";
          const resolvedGuess = guessedSpecifier && tryResolve(guessedSpecifier, importer);
          if (resolvedGuess === id) {
            trackedExternals.add(resolvedGuess);
            return {
              id: guessedSpecifier,
              external: true
            };
          }`

if (!original.includes(sourceSnippet)) {
  console.error('[patch-nitropack-dep0155] expected snippet not found, patch aborted')
  process.exit(1)
}

const patched = original.replace(sourceSnippet, replacementSnippet)
writeFileSync(targetFile, patched, 'utf8')

console.log('[patch-nitropack-dep0155] patched nitropack resolver to avoid trailing-slash package specifiers')
