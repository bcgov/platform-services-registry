import { User } from '@prisma/client';

export interface MsUser {
  id: string;
  userPrincipalName: string;
  mail: string;
  onPremisesSamAccountName: string;
  extension_85cc52e9286540fcb1f97ed86114a0e5_bcgovGUID: string; // pragma: allowlist secret
  displayName: string;
  givenName: string;
  surname: string;
  jobTitle: string;
  officeLocation: string;
}

export interface AppUser {
  providerUserId: string;
  upn: string;
  email: string;
  idir: string;
  idirGuid: string;
  displayName: string;
  firstName: string;
  lastName: string;
  ministry: string;
  jobTitle: string;
  officeLocation: string;
}

export interface AppUserWithRoles extends AppUser {
  roles: string[];
}

export type AdminViewUser = User & {
  roles: string[];
  privateProducts: { name: string; licencePlate: string }[];
  publicProducts: { name: string; licencePlate: string }[];
};
