export function formatFullName(user: { [key: string]: any } | null | undefined): string {
  if (!user) {
    return '';
  }

  const firstName = user.firstName || '';
  const lastName = user.lastName || '';
  return `${firstName} ${lastName}`.trim();
}

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
