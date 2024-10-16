import { expect } from '@jest/globals';
import { CPU, Memory, Storage } from '@prisma/client';
import { extractNumbers } from './string';

describe('extractNumbers', () => {
  it('should extract numbers correctly from "CPU_REQUEST_8_LIMIT_16"', () => {
    const inputString = CPU.CPU_REQUEST_8_LIMIT_16;
    const expected = [8, 16];
    const result = extractNumbers(inputString);
    expect(result).toStrictEqual(expected);
  });

  it('should extract numbers correctly from "CPU_REQUEST_0_5_LIMIT_1_5"', () => {
    const inputString = CPU.CPU_REQUEST_0_5_LIMIT_1_5;
    const expected = [0.5, 1.5];
    const result = extractNumbers(inputString);
    expect(result).toStrictEqual(expected);
  });

  it('should extract numbers correctly from "MEMORY_REQUEST_16_LIMIT_32"', () => {
    const inputString = Memory.MEMORY_REQUEST_16_LIMIT_32;
    const expected = [16, 32];
    const result = extractNumbers(inputString);
    expect(result).toStrictEqual(expected);
  });

  it('should extract numbers correctly from "MEMORY_REQUEST_32_LIMIT_64"', () => {
    const inputString = Memory.MEMORY_REQUEST_32_LIMIT_64;
    const expected = [32, 64];
    const result = extractNumbers(inputString);
    expect(result).toStrictEqual(expected);
  });

  it('should extract numbers correctly from "STORAGE_64"', () => {
    const inputString = Storage.STORAGE_64;
    const expected = [64];
    const result = extractNumbers(inputString);
    expect(result).toStrictEqual(expected);
  });

  it('should return an empty array if no numbers are found', () => {
    const inputString = 'No_numbers_here';
    const expected: number[] = [];
    const result = extractNumbers(inputString);
    expect(result).toStrictEqual(expected);
  });
});
