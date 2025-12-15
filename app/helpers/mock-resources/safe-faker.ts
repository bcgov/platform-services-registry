// app/helpers/mock-resources/safe-faker.ts
import type { faker as FakerType } from '@faker-js/faker';

let cachedFaker: typeof import('@faker-js/faker').faker | null | undefined;

/**
 * Tries to load @faker-js/faker at runtime.
 * Returns faker instance if it loads successfully, otherwise undefined.
 */
export function getFaker(): typeof import('@faker-js/faker').faker | undefined {
  if (cachedFaker !== undefined) {
    // already tried to load
    return cachedFaker ?? undefined;
  }

  try {
    const mod = require('@faker-js/faker') as typeof import('@faker-js/faker');
    cachedFaker = mod.faker;
    return cachedFaker;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Failed to load @faker-js/faker, falling back to static data.', error);
    }
    cachedFaker = null;
    return undefined;
  }
}
