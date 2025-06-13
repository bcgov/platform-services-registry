import _isNumber from 'lodash-es/isNumber';

export function parsePaginationParams(
  page: string | number,
  pageSize: string | number,
  defaultPageSize = 5,
  maxPageSize = 1000,
) {
  let parsedPage = _isNumber(page) ? page : parseInt(page, 10);
  let parsedPageSize = _isNumber(pageSize) ? pageSize : parseInt(pageSize, 10);

  if (isNaN(parsedPage) || parsedPage < 1) {
    parsedPage = 1;
  }

  if (isNaN(parsedPageSize) || parsedPageSize < 1) {
    parsedPageSize = defaultPageSize;
  }

  if (parsedPageSize > maxPageSize) {
    parsedPageSize = maxPageSize;
  }

  const skip = (parsedPage - 1) * parsedPageSize;
  const take = parsedPageSize;

  return {
    page: parsedPage,
    skip,
    take,
  };
}

export function generatePageSizes(defaultSize: number): number[] {
  const COMMON_SIZES = [10, 25, 50, 100];
  const MAX_SIZE = 100;

  const geometricProgression: number[] = [];
  let currentSize = defaultSize;

  while (currentSize <= MAX_SIZE) {
    geometricProgression.push(currentSize);
    currentSize *= 2;
  }

  return Array.from(
    new Set([defaultSize, ...geometricProgression, ...COMMON_SIZES.filter((size) => size >= defaultSize)]),
  ).sort((a, b) => a - b);
}
