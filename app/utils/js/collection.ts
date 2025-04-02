import { randomBytes } from 'crypto';
import _castArray from 'lodash-es/castArray';
import _compact from 'lodash-es/compact';
import _forEach from 'lodash-es/forEach';
import _trim from 'lodash-es/trim';
import _uniq from 'lodash-es/uniq';

export function arrayIntersection(arr1: string[], arr2: string[]) {
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) {
    return [];
  }
  const set2 = new Set(arr2);
  if (set2 instanceof Set) {
    const intersection = arr1.filter((value) => set2.has(value));
    return intersection;
  }

  return [];
}

export function arraysIntersect<T>(array1: T[], array2: T[]) {
  return array1.filter((item) => array2.includes(item)).length > 0;
}

export function iterateObject<T extends object>(
  obj: T,
  callback: (value: T[keyof T], key: keyof T) => boolean | void,
): void {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const shouldContinue = callback(obj[key], key);
      if (shouldContinue === false) {
        break;
      }
    }
  }
}

export async function asyncEvery<T>(arr: T[], callback: (value: T) => Promise<boolean>): Promise<boolean> {
  const results = await Promise.all(arr.map(callback));
  return results.every((result) => result);
}

export function checkArrayStringCondition(condition: string[] = [], target: string[] = []) {
  if (condition.length === 0) return true;

  const targetArr = _uniq(_compact(_castArray(target).map((str) => _trim(String(str)))));

  // Check if any condition is met in the target array
  return condition.some((orCond) => {
    if (orCond.includes(' ')) {
      // Split condition by spaces to handle AND conditions
      const andCond = orCond.split(' ').map(_trim);
      // Ensure all sub-conditions are present in the target array
      return andCond.every((subCond) => targetArr.includes(subCond));
    }

    // Ensure the single condition is present in the target array
    return targetArr.includes(orCond);
  });
}

export function getRandomItem<T>(arr: T[]): T {
  const randomBytesBuffer = randomBytes(4);
  const randomValue = randomBytesBuffer.readUInt32BE(0);
  const randomIndex = randomValue % arr.length;
  return arr[randomIndex];
}

export function getUniqueNonFalsyItems(arr: (string | null | undefined | boolean | number)[]): string[] {
  const uniqueItems: string[] = [];

  for (const item of arr) {
    if (item && typeof item === 'string') {
      if (!uniqueItems.includes(item)) {
        uniqueItems.push(item);
      }
    }
  }

  return uniqueItems;
}
