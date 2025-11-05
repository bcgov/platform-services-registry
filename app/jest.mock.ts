export const SERVICE_ACCOUNT_DATA = {
  user: null as { idirGuid: string; authRoleNames: string[] } | null,
  team: null as { roles: string[] } | null,
};

export const DB_DATA = {
  organizations: [{ id: '', code: '', name: '', isAgMinistry: false }] as {
    id: string;
    code: string;
    name: string;
    isAgMinistry: boolean;
  }[],
};
