import _isString from 'lodash-es/isString';
import _isEqual from 'lodash-es/isEqual';
import _isArray from 'lodash-es/isArray';
import _reduce from 'lodash-es/reduce';

type QueryObject = Record<string, string | readonly string[] | number | readonly number[] | boolean>;

/**
 * Parses a query string and returns an object representing the key-value pairs.
 * Handles duplicate keys by converting them into arrays.
 *
 * @param queryString - The input query string to be parsed.
 * @returns An object representing the parsed key-value pairs.
 */
export function parseQueryString(queryString: string | URLSearchParams) {
  const params = new URLSearchParams(queryString);
  const parsedParams: QueryObject = {};

  params.forEach((value, key) => {
    if (parsedParams[key]) {
      // If the key already exists in the parsedParams, convert it to an array
      if (!Array.isArray(parsedParams[key])) {
        parsedParams[key] = [parsedParams[key] as string];
      }
      (parsedParams[key] as string[]).push(value);
    } else {
      parsedParams[key] = value;
    }
  });

  return parsedParams;
}

/**
 * Converts a query object into a string representation suitable for a URL.
 * Filters out empty array values and undefined or null values.
 *
 * @param query - The input query object to be converted.
 * @returns A string representation of the query object suitable for a URL.
 */
export function stringifyQuery(query: QueryObject) {
  const queryString = Object.entries(query)
    .filter(([_, value]) => (_isArray(value) ? value.length > 0 : !!value))
    .map(([key, value]) =>
      Array.isArray(value)
        ? value.map((item) => `${encodeURIComponent(key)}=${encodeURIComponent(item)}`).join('&')
        : `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
    )
    .join('&');

  return queryString;
}

/**
 * Omits fields with empty array values from a query object.
 *
 * @param obj - The input query object to be processed.
 * @returns A new query object with empty array fields omitted.
 */
function omitEmptyArrayField(obj: QueryObject) {
  return _reduce(
    obj,
    (ret: QueryObject, val, key: string) => {
      if (!val) return ret;
      if (_isArray(val) && val.length === 0) return ret;

      ret[key] = val;
      return ret;
    },
    {},
  );
}

/**
 * Compares two search queries for equality, ignoring empty array fields.
 *
 * @param queryOrQueryString1 - The first query object or query string.
 * @param queryOrQueryString2 - The second query object or query string.
 * @returns True if the queries are equal, false otherwise.
 */
export function isSearchQueryEqual(
  queryOrQueryString1: QueryObject | string,
  queryOrQueryString2: QueryObject | string,
) {
  const obj1 = _isString(queryOrQueryString1) ? parseQueryString(queryOrQueryString1) : queryOrQueryString1;
  const obj2 = _isString(queryOrQueryString2) ? parseQueryString(queryOrQueryString2) : queryOrQueryString2;

  return _isEqual(omitEmptyArrayField(obj1), omitEmptyArrayField(obj2));
}
