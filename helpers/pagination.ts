export function parsePaginationParams(page: string, pageSize: string, defaultPageSize = 5) {
  let parsedPage = parseInt(page, 10);
  let parsedPageSize = parseInt(pageSize, 10);

  if (isNaN(parsedPage) || parsedPage < 1) {
    parsedPage = 1;
  }

  if (isNaN(parsedPageSize) || parsedPageSize < 1) {
    parsedPageSize = defaultPageSize;
  }

  const skip = (parsedPage - 1) * parsedPageSize;
  const take = parsedPageSize;

  return {
    page: parsedPage,
    skip,
    take,
  };
}
