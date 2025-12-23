export const SERVICE_ACCOUNT_DATA = {
  jwtData: null as Record<string, any> | null,

  user: null as {
    email: string;
    authRoleNames: string[];
    attributes: { idir_guid: string };
  } | null,

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
