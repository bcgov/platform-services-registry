export function formatFullName(user: { [key: string]: any } | null | undefined): string {
  if (!user) {
    return '';
  }

  const firstName = user.firstName || '';
  const lastName = user.lastName || '';
  return `${firstName} ${lastName}`.trim();
}
