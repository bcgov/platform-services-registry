export function formatFullName(user: { [key: string]: any } | null | undefined, lastNameFirst = false): string {
  if (!user) {
    return '';
  }

  const firstName = (user.firstName || '').trim();
  const lastName = (user.lastName || '').trim();
  const names = [firstName, lastName];

  if (lastNameFirst) return [lastName, firstName].join(', ');
  return [firstName, lastName].join(' ');
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
