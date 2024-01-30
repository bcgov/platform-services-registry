export const extractPathSegments = (pathname: string, count: number): string => {
  return pathname.split('/').splice(0, count).join('/');
};

export const hasSegmentAtPosition = (pathname: string, targetSegment: string, position: number): boolean => {
  const pathSegments = pathname.split('/');
  if (position >= 0 && position < pathSegments.length) {
    return pathSegments[position] === targetSegment;
  }
  return false;
};

export const compareUrlsIgnoreLastSegments = (url1: string, url2: string, numSegmentsToIgnore: number = 0) => {
  // Remove trailing slashes from the URLs
  url1 = url1.replace(/\/+$/, '');
  url2 = url2.replace(/\/+$/, '');

  if (numSegmentsToIgnore === 0) return url1 === url2;

  // Split the URLs into segments
  const segments1 = url1.split('/');
  const segments2 = url2.split('/');

  // Ensure the number of segments to ignore is within bounds
  numSegmentsToIgnore = Math.min(numSegmentsToIgnore, segments1.length, segments2.length);

  // Extract base URLs (excluding the specified number of last path segments)
  const base1 = segments1.slice(0, -numSegmentsToIgnore).join('/');
  const base2 = segments2.slice(0, -numSegmentsToIgnore).join('/');

  return base1 === base2;
};

export const pathChangeTail = (currentPath: string, numSegmentsToIgnore: number | undefined, href: string): string => {
  if (numSegmentsToIgnore) {
    const currentPathArr = currentPath.split('/');
    const hrefArr = href.split('/');
    const arrLast = currentPathArr[currentPathArr.length - 1];
    const isPathDifferent = arrLast !== hrefArr[hrefArr.length - 1] && currentPathArr.length === hrefArr.length;
    if (isPathDifferent) {
      return hrefArr.slice(0, -numSegmentsToIgnore).concat(arrLast).join('/');
    }
  }
  return href;
};
