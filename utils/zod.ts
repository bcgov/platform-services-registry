import _isBoolean from 'lodash-es/isBoolean';
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

export function processBoolean(val?: unknown) {
  if (_isBoolean(val)) return val;
  if (_isString(val)) return val === 'true';
  return false;
}

export function processBooleanPositive(val?: unknown) {
  if (_isBoolean(val)) return val;
  if (_isString(val)) return val !== 'false';
  return true;
}
