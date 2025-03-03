import { AccountCoding } from '@prisma/client';
import _compact from 'lodash-es/compact';

export function getAccountCodingString(accountCoding: AccountCoding, separator = ' ') {
  return _compact([accountCoding.cc, accountCoding.rc, accountCoding.sl, accountCoding.stob, accountCoding.pc]).join(
    separator,
  );
}

export function splitAccountCodingString(str: string) {
  if (str.length !== 24) return null;

  const segments = [3, 5, 5, 4, 7];
  const result: string[] = [];
  let start = 0;

  for (const length of segments) {
    result.push(str.slice(start, start + length));
    start += length;
  }

  return result;
}
