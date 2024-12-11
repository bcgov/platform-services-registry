import _isBoolean from 'lodash-es/isBoolean';
import _isNil from 'lodash-es/isNil';
import _isNumber from 'lodash-es/isNumber';
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

export function processNumber(val?: unknown, options?: { defaultValue?: number; ignoreNaN?: boolean }) {
  const { defaultValue, ignoreNaN = false } = options ?? {};
  if (_isNil(val)) return defaultValue ?? val;

  const numval = Number(val);
  if (isNaN(numval)) {
    if (ignoreNaN) return defaultValue;
    return val;
  }

  return numval;
}
