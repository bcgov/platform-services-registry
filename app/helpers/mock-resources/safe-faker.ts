let cachedFaker: any | null | undefined;

/**
 * Tries to load @faker-js/faker at runtime.
 * Returns faker instance if it loads successfully, otherwise undefined.
 *
 * This helper is only used for mock data in email previews and jest test, so we
 * deliberately avoid depending on faker's exact TypeScript types to
 * keep it compatible across faker versions.
 */
export function getFaker(): any | undefined {
  if (cachedFaker !== undefined) {
    // already tried to load
    return cachedFaker ?? undefined;
  }

  try {
    const mod = require('@faker-js/faker');

    // Support different module shapes:
    //  - CJS:   { faker: ... }
    //  - ESM:   { default: ... }
    //  - Fallback: module itself is the faker instance
    const faker = mod?.faker ?? mod?.default ?? mod;

    cachedFaker = faker ?? null;
    return cachedFaker ?? undefined;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Failed to load @faker-js/faker, falling back to static data.', error);
    }
    cachedFaker = null;
    return undefined;
  }
}
