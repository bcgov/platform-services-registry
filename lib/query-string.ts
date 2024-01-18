export function parseQueryString(queryString: string) {
  const params = new URLSearchParams(queryString);
  const parsedParams: Record<string, string | string[]> = {};

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
