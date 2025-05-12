import { Prisma, User } from '@/prisma/client';
import { PrivateCloudRequestDecorate } from './doc-decorate';

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
  id: string;
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

type UserDetailProduct = {
  select: { id: true; name: true; projectOwnerId: true; primaryTechnicalLeadId: true; secondaryTechnicalLeadId: true };
};
export type UserDetail = Prisma.UserGetPayload<{
  select: {
    id: true;
    providerUserId: true;
    firstName: true;
    lastName: true;
    email: true;
    upn: true;
    idir: true;
    idirGuid: true;
    officeLocation: true;
    jobTitle: true;
    image: true;
    ministry: true;
    archived: true;
    lastSeen: true;
    onboardingDate: true;
    privateCloudProjectsAsProjectOwner: UserDetailProduct;
    privateCloudProjectsAsPrimaryTechnicalLead: UserDetailProduct;
    privateCloudProjectsAsSecondaryTechnicalLead: UserDetailProduct;
    publicCloudProjectsAsProjectOwner: UserDetailProduct;
    publicCloudProjectsAsPrimaryTechnicalLead: UserDetailProduct;
    publicCloudProjectsAsSecondaryTechnicalLead: UserDetailProduct;
    publicCloudProjectsAsExpenseAuthority: UserDetailProduct;
  };
}>;

export type UserDetailColeagues = Prisma.UserGetPayload<{
  select: {
    id: true;
    firstName: true;
    lastName: true;
    email: true;
    upn: true;
    idir: true;
    idirGuid: true;
    officeLocation: true;
    jobTitle: true;
    image: true;
    ministry: true;
    archived: true;
    lastSeen: true;
  };
}>;

export type UserDetailWithColeagues = Prisma.UserGetPayload<{
  select: {
    id: true;
    providerUserId: true;
    firstName: true;
    lastName: true;
    email: true;
    upn: true;
    idir: true;
    idirGuid: true;
    officeLocation: true;
    jobTitle: true;
    image: true;
    ministry: true;
    archived: true;
    lastSeen: true;
    onboardingDate: true;
    privateCloudProjectsAsProjectOwner: UserDetailProduct;
    privateCloudProjectsAsPrimaryTechnicalLead: UserDetailProduct;
    privateCloudProjectsAsSecondaryTechnicalLead: UserDetailProduct;
    publicCloudProjectsAsProjectOwner: UserDetailProduct;
    publicCloudProjectsAsPrimaryTechnicalLead: UserDetailProduct;
    publicCloudProjectsAsSecondaryTechnicalLead: UserDetailProduct;
    publicCloudProjectsAsExpenseAuthority: UserDetailProduct;
  };
}> & { colleagues: UserDetailColeagues[] };

export type SearchedUser = Prisma.UserGetPayload<{
  select: {
    id: true;
    firstName: true;
    lastName: true;
    email: true;
    upn: true;
    idir: true;
    officeLocation: true;
    jobTitle: true;
    image: true;
    ministry: true;
    archived: true;
    createdAt: true;
    updatedAt: true;
    lastSeen: true;
  };
}>;

export type MemberUser = Omit<
  Prisma.UserGetPayload<{
    select: {
      id: true;
      firstName: true;
      lastName: true;
      displayName: true;
      email: true;
      ministry: true;
      idir: true;
      upn: true;
      roles: true;
    };
  }>,
  'displayName' | 'roles'
> & {
  displayName?: string | null;
  roles?: string[] | null;
};

type PrivateCloudRequest = Prisma.PrivateCloudRequestGetPayload<{}>;
type PrivateCloudRequestSelected = Prisma.PrivateCloudRequestGetPayload<{
  select: {
    createdBy: true;
    decisionMaker: true;
    cancelledBy: true;
    requestData: true;
    decisionData: true;
    originalData: true;
  };
}>;

export type PrivateCloudRequestOperations =
  | (PrivateCloudRequest & PrivateCloudRequestSelected & PrivateCloudRequestSelected & PrivateCloudRequestDecorate)
  | null;
