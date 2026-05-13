export function parseJsonField(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return JSON.parse(trimmed);
}

export function stringifyJsonField(value: unknown) {
  if (value === null || value === undefined) return '';
  return JSON.stringify(value, null, 2);
}
