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
