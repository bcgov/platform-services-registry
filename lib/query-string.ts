type QueryObject = Record<string, string | readonly string[] | number | readonly number[] | boolean>;

export function parseQueryString(queryString: string) {
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

export function stringifyQuery(query: QueryObject) {
  const queryString = Object.entries(query)
    .map(([key, value]) =>
      Array.isArray(value)
        ? value.map((item) => `${encodeURIComponent(key)}=${encodeURIComponent(item)}`).join('&')
        : `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
    )
    .join('&');

  return queryString;
}
