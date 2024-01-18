export function parseQueryString(queryString: string) {
  const params = new URLSearchParams(queryString);
  const parsedParams = Object.fromEntries(params);
  return parsedParams;
}
