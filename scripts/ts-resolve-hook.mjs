/**
 * Node module-customisation hook: the src/data modules use Vite-style
 * extensionless relative imports ('./profile'). Teach Node to resolve
 * those to the sibling .ts file so the seed generator can import the
 * data modules directly.
 */
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export async function resolve(specifier, context, next) {
  try {
    return await next(specifier, context);
  } catch (err) {
    const isRelative = specifier.startsWith('./') || specifier.startsWith('../');
    const hasExtension = /\.(ts|tsx|js|mjs|cjs|json)$/.test(specifier);
    if (isRelative && !hasExtension && context.parentURL) {
      const candidate = join(dirname(fileURLToPath(context.parentURL)), `${specifier}.ts`);
      if (existsSync(candidate)) {
        return { url: pathToFileURL(candidate).href, shortCircuit: true };
      }
    }
    throw err;
  }
}
