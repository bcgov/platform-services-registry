export const parseMinistryFromDisplayName = (displayName: string) => {
  let ministry = '';
  if (displayName && displayName.length > 0) {
    const dividedString = displayName.split(/(\s+)/);
    if (dividedString[2]) {
      ministry = dividedString[dividedString.length - 1].split(':', 1)[0];
    }
  }
  return ministry;
};
