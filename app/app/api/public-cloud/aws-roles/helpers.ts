import KcAdminClient from '@keycloak/keycloak-admin-client';
import { Credentials } from '@keycloak/keycloak-admin-client/lib/utils/auth';
import _kebabCase from 'lodash-es/kebabCase';
import _startCase from 'lodash-es/startCase';
import {
  AWS_ROLES_BASE_URL,
  AWS_ROLES_REALM_NAME,
  AWS_ROLES_CLIENT_ID,
  AWS_ROLES_CLIENT_SECRET,
  AWS_ROLES_IDENTITY_PROVIDER,
} from '@/config';
import { logger } from '@/core/logging';
import { getUser } from '@/services/msgraph';

const PROJECT_GROUP = 'Project Team Groups';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface UsersTotal {
  users: User[];
  groupId: string;
  total: number;
}

export type tabName = {
  name: string;
  href: string;
};

interface PaginationOptions {
  page: number;
  pageSize: number;
}

const kcAdminClient = new KcAdminClient({
  baseUrl: AWS_ROLES_BASE_URL,
  realmName: AWS_ROLES_REALM_NAME,
});

const credentials: Credentials = {
  grantType: 'client_credentials',
  clientId: AWS_ROLES_CLIENT_ID,
  clientSecret: AWS_ROLES_CLIENT_SECRET,
};

const paginate = <T>(users: T[], options: PaginationOptions): T[] => {
  const { page, pageSize } = options;

  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  return users.slice(startIndex, endIndex);
};

// aws group name format is "XxxxZzzz" or "Yyyyy",
// for Tab we need name as "Xxxx Zzzz" or "Yyyyy",
// and href as "xxxx-zzzz" or "yyyyy"
const parseGroupNameToTab = (name: string): tabName => {
  return {
    name: _startCase(name),
    href: _kebabCase(name),
  };
};

const searchSubstringInArray = (searchTerm: string, users: User[]): User[] => {
  const results = new Set<User>();

  users.forEach((user) =>
    Object.values(user).forEach((value) => {
      if (typeof value === 'string' && value.toLowerCase().includes(searchTerm?.toLowerCase())) {
        results.add(user);
        return;
      }
    }),
  );

  return Array.from(results);
};

const generateUser = <V extends User>(data: Partial<V>): V => {
  const newUser = {
    id: '',
    firstName: '',
    lastName: '',
    email: '',
  } as V;

  for (const key in data) {
    if (key in newUser) {
      newUser[key as keyof V] = data[key] as V[keyof V];
    }
  }
  return newUser;
};

const createUserRole = (user: User): User => {
  const roleUser = generateUser({ ...user });
  return roleUser;
};

const roleToGroupName = (role: string): string => {
  return role.replace(/\s/g, '') + 's';
};

export const getMembersByGroupId = async (groupId: string): Promise<User[]> => {
  await kcAdminClient.auth(credentials);
  const members = await kcAdminClient.groups.listMembers({ id: groupId });
  return members as User[];
};

// See https://www.keycloak.org/docs-api/21.1.0/rest-api/index.html#_getusers
export const getUserIdByEmail = async (email: string): Promise<string | undefined> => {
  await kcAdminClient.auth(credentials);
  const users: any[] = await kcAdminClient.users.find({ exact: true, email });
  return users.length > 0 ? users[0].id : undefined;
};

export const addUserToGroup = async (userId: string, groupId: string) => {
  await kcAdminClient.auth(credentials);
  await kcAdminClient.users.addToGroup({ id: userId, groupId: groupId });
};

export const createKeyCloakUser = async (userPrincipalName: string) => {
  try {
    const appUser = await getUser(userPrincipalName);
    if (!appUser) {
      logger.error(`createKeyCloakUser: user not found with ${userPrincipalName}`);
      return;
    }

    const userIdirGuid = appUser.idirGuid.toLowerCase();
    await kcAdminClient.auth(credentials);
    const userRes = await kcAdminClient.users.create({
      email: appUser.email,
      username: `${userIdirGuid}@${AWS_ROLES_IDENTITY_PROVIDER}`,
      enabled: true,
      firstName: appUser.firstName,
      lastName: appUser.lastName,
    });

    await kcAdminClient.users.addToFederatedIdentity({
      id: userRes.id!,
      federatedIdentityId: AWS_ROLES_IDENTITY_PROVIDER,
      federatedIdentity: {
        identityProvider: AWS_ROLES_IDENTITY_PROVIDER,
        userId: `${userIdirGuid}@${AWS_ROLES_IDENTITY_PROVIDER}`,
        userName: `${userIdirGuid}@${AWS_ROLES_IDENTITY_PROVIDER}`,
      },
    });
  } catch (error) {
    logger.error('createKeyCloakUser:', error);
  }
};

export const removeUserFromGroup = async (userId: string, groupId: string) => {
  await kcAdminClient.auth(credentials);
  await kcAdminClient.users.delFromGroup({ id: userId, groupId: groupId });
};

async function findParentGroup(groupName = PROJECT_GROUP) {
  await kcAdminClient.auth(credentials);
  const groups = await kcAdminClient.groups.find({ search: groupName });

  if (groups.length === 0) return null;
  return groups.find((group) => group.name === groupName);
}

async function getProductRoleGroups(licencePlate: string) {
  const projectTeamGroup = await findParentGroup();
  if (!projectTeamGroup) return [];
  if (projectTeamGroup.subGroups?.length === 0) return [];

  const productGroup = projectTeamGroup.subGroups?.find((group) => group.name?.startsWith(licencePlate));
  const productGroupWithChildren = await kcAdminClient.groups.findOne({ id: productGroup?.id as string });
  if (!productGroupWithChildren) return [];

  return productGroupWithChildren.subGroups ?? [];
}

export async function getSubGroupMembersByLicencePlateAndName(
  licencePlate: string,
  role: string,
  page: number,
  pageSize: number,
  searchTerm: string,
): Promise<UsersTotal> {
  const productRoleGroups = await getProductRoleGroups(licencePlate);

  let result: User[] = [];
  let groupId: string = '';

  productRoleGroups.forEach((group) => {
    if (group.name === roleToGroupName(role)) {
      groupId = group.id as string;
    }
  });

  if (groupId) {
    const groupsUsers = await getMembersByGroupId(groupId);
    if (groupsUsers) {
      result = [...groupsUsers.map((user) => createUserRole(user))];
    }
  }

  if (searchTerm) {
    result = searchSubstringInArray(searchTerm, result);
  }
  const total = result.length;
  return { users: paginate(result, { page, pageSize }) as User[], groupId, total };
}

export async function addUserToGroupByEmail(userPrincipalName: string, userEmail: string, groupId: string) {
  let userId = await getUserIdByEmail(userEmail);

  if (!userId) {
    await createKeyCloakUser(userPrincipalName);
    userId = await getUserIdByEmail(userEmail);
    if (userId) await addUserToGroup(userId, groupId);
  } else if (userId) {
    await addUserToGroup(userId, groupId);
  }
}

export async function getGroupsNamesByLicencePlate(licencePlate: string) {
  const productRoleGroups = await getProductRoleGroups(licencePlate);
  return productRoleGroups.map((group) => parseGroupNameToTab(group.name as string));
}
