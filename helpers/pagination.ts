export function parsePaginationParams(page: string, pageSize: string) {
  let parsedPage = parseInt(page, 10);
  let parsedPageSize = parseInt(pageSize, 10);

  if (isNaN(parsedPage) || parsedPage < 1) {
    parsedPage = 1;
  }

  if (isNaN(parsedPageSize) || parsedPageSize < 1) {
    parsedPageSize = 5;
  }

  const skip = (parsedPage - 1) * parsedPageSize;
  const take = parsedPageSize;

  return {
    page: parsedPage,
    skip,
    take,
  };
}
