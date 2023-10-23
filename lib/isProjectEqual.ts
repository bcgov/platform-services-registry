import { deepStrictEqual } from 'assert';

export function checkObjectEquality(objectA: object, objectB: object): boolean {
  try {
    deepStrictEqual(objectA, objectB);
  } catch (error) {
    return false;
  }

  return true;
}
