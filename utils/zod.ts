import _isString from 'lodash-es/isString';

export function processUpperEnumString(str?: unknown) {
  if (!str) return undefined;
  if (_isString(str)) return str.toUpperCase();
  return str;
}

export function processEnumString(str?: unknown) {
  if (!str) return undefined;
  return str;
}

export function processBoolean(str?: unknown) {
  if (!str) return false;
  return str === 'true';
}
