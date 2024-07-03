import { randomBytes } from 'crypto';

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

export function getRandomItem<T>(arr: T[]): T {
  const randomBytesBuffer = randomBytes(4);
  const randomValue = randomBytesBuffer.readUInt32BE(0);
  const randomIndex = randomValue % arr.length;
  return arr[randomIndex];
}
