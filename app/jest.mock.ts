export const SERVICE_ACCOUNT_DATA = {
  user: null as { email: string; authRoleNames: string[] } | null,
  team: null as { roles: string[] } | null,
};

export const DB_DATA = {
  organizations: [{ id: '', code: '', name: '' }] as { id: string; code: string; name: string }[],
};
