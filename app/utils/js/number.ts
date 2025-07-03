import * as crypto from 'crypto';
import _round from 'lodash-es/round';

export const roundNumber = (number: number, options?: { decimals?: number }) => {
  const { decimals = 2 } = options ?? {};
  return Number((Math.round(number * 100) / 100).toFixed(decimals));
};

export const formatNumber = (number: number, options?: { prefix?: string; suffix?: string; decimals?: number }) => {
  const { prefix = '', suffix = '', decimals = 2 } = options ?? {};
  const value = new Intl.NumberFormat('us').format(roundNumber(number, { decimals })).toString();
  return `${prefix}${value}${suffix}`;
};

export function numberToWords(number: number) {
  const ones = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
  const teens = ['eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const tens = ['ten', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  if (number >= 0 && number < 10) {
    return ones[number];
  } else if (number >= 11 && number <= 19) {
    return teens[number - 11];
  } else if (number >= 10 && number % 10 === 0) {
    return tens[number / 10 - 1];
  } else if (number >= 20 && number <= 99) {
    return tens[Math.floor(number / 10) - 1] + '-' + ones[number % 10];
  }
  return 'Number out of range';
}

export function getRandomNumberOptimally(min: number, max: number) {
  const range = max - min + 1;
  let randomNumber;
  do {
    const randomBuffer = crypto.randomBytes(4);
    randomNumber = randomBuffer.readUInt32LE(0);
  } while (randomNumber >= Math.floor(0xffffffff / range) * range);
  return min + (randomNumber % range);
}

export function toOrdinal(n: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const remainder100 = n % 100;

  // Special cases for 11, 12, 13
  if (remainder100 >= 11 && remainder100 <= 13) {
    return n + 'th';
  }

  // Determine suffix based on the last digit
  const remainder10 = n % 10;
  const suffix = suffixes[remainder10] || 'th';

  return n + suffix;
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 2,
  }).format(value);
}

// export function roundToHalfIncrement(value: number) {
//   const rounded = Math.round(value * 2) / 2;
//   return parseFloat(rounded.toFixed(1));
// }

export function roundToHalfIncrement(value: number): number {
  return _round(_round(value * 2) / 2, 1);
}
