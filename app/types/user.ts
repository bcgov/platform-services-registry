import { BcgovGuidExtensionKey } from '@/constants';
import { Prisma } from '@/prisma/client';

export interface MsUserBase {
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
export type MsUser = MsUserBase & {
  [K in BcgovGuidExtensionKey]: string; // pragma: allowlist secret
};
export interface AppUser {
  id: string;
  providerUserId: string;
  upn: string;
  email: string;
  idir: string;
  idirGuid: string;
  githubAccount: { username: string; accountId: string } | null;
  isGuidValid: boolean;
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

export type AdminViewUser = Prisma.UserGetPayload<{
  include: {
    githubAccount: GitHubAccountSelection;
  };
}> & {
  roles: string[];
  privateProducts: { name: string; licencePlate: string }[];
  publicProducts: { name: string; licencePlate: string }[];
};

type GitHubAccountSelection = {
  select: {
    username: true;
    accountId: true;
  };
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
    githubAccount: GitHubAccountSelection;
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

export type UserDetailColleagues = Prisma.UserGetPayload<{
  select: {
    id: true;
    firstName: true;
    lastName: true;
    email: true;
    upn: true;
    idir: true;
    githubAccount: GitHubAccountSelection;
    idirGuid: true;
    officeLocation: true;
    jobTitle: true;
    image: true;
    ministry: true;
    archived: true;
    lastSeen: true;
  };
}>;

export type UserDetailWithColleagues = UserDetail & {
  colleagues: UserDetailColleagues[];
};

export type SearchedUser = Prisma.UserGetPayload<{
  select: {
    id: true;
    firstName: true;
    lastName: true;
    email: true;
    upn: true;
    idir: true;
    idirGuid: true;
    githubAccount: GitHubAccountSelection;
    isGuidValid: true;
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

export type Outcome = 'deleted' | 'archivedDueToError';

export type DeleteIncompleteUserResult = {
  count: number;
  deleted: number;
  archivedDueToError: number;
  results: {
    id: string;
    email: string;
    outcome: Outcome;
    error?: string;
  }[];
};

export interface GitHubApiUser {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  type: string;
}

export interface GitHubUser {
  accountId: string;
  username: string;
  displayName: string | null;
  avatarUrl: string;
  profileUrl: string;
}

export type GitHubUserValidationResult =
  | {
      valid: true;
      user: GitHubUser;
    }
  | {
      valid: false;
      message: string;
    };

export interface UpdatedGitHubUser {
  id: string;
  githubAccount: {
    username: string;
    accountId: string;
  } | null;
}

export type MsGraphAppUser = Omit<AppUser, 'githubAccount'>;
