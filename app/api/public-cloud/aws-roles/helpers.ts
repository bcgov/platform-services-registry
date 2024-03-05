import _startCase from 'lodash-es/startCase';
import _kebabCase from 'lodash-es/kebabCase';
import _find from 'lodash-es/find';
import _toLowerCase from 'lodash-es/lowerCase';
import { Credentials } from '@keycloak/keycloak-admin-client/lib/utils/auth';
import KcAdminClient from '@keycloak/keycloak-admin-client';
import { getUser } from '@/services/msgraph';
import {
  AWS_ROLES_BASE_URL,
  AWS_ROLES_REALM_NAME,
  AWS_ROLES_CLIENT_ID,
  AWS_ROLES_CLIENT_SECRET,
  AWS_ROLES_IDENTITY_PROVIDER,
} from '@/config';

export interface Group {
  id: string;
  name: string;
  path: string;
  subGroups: Group[];
}

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

export const getGroups = async (): Promise<Group[]> => {
  await kcAdminClient.auth(credentials);
  const groups = await kcAdminClient.groups.find();
  return groups as Group[];
};

export const getMembersByGroupId = async (groupId: string): Promise<User[]> => {
  await kcAdminClient.auth(credentials);
  const members = await kcAdminClient.groups.listMembers({ id: groupId });
  return members as User[];
};

export const getUserIdByEmail = async (email: string): Promise<string | undefined> => {
  await kcAdminClient.auth(credentials);
  const users: any[] = await kcAdminClient.users.find();
  if (!users) return;
  const user: any = _find(users, (userItem) => {
    if (_toLowerCase(userItem.email) === _toLowerCase(email)) {
      return true;
    }
  });
  return user ? user.id : undefined;
};

export const addUserToGroup = async (userId: string, groupId: string) => {
  await kcAdminClient.auth(credentials);
  await kcAdminClient.users.addToGroup({ id: userId, groupId: groupId });
};

export const createKeyCloakUser = async (userPrincipalName: string) => {
  try {
    const appUser = await getUser(userPrincipalName);
    if (!appUser) {
      console.error('createKeyCloakUser: user not found');
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
  } catch (err) {
    console.error('createKeyCloakUser:', err);
  }
};

export const removeUserFromGroup = async (userId: string, groupId: string) => {
  await kcAdminClient.auth(credentials);
  await kcAdminClient.users.delFromGroup({ id: userId, groupId: groupId });
};

const findObjectByValue = (array: Group[], key: keyof Group, value: any): Group[] => {
  return array.filter((obj) => obj[key] === value);
};

const findObjectByValueSubstring = (array: Group[], key: keyof Group, value: any): Group[] => {
  return array.filter((obj) => obj[key].includes(value));
};

async function getProductAWSRoles(licencePlate: string): Promise<Group[]> {
  const keyClockGroups = await getGroups();
  if (keyClockGroups) {
    const projectTeamGroups = findObjectByValue(keyClockGroups, 'name', 'Project Team Groups');
    if (projectTeamGroups.length > 0) {
      return findObjectByValueSubstring(projectTeamGroups[0].subGroups, 'name', licencePlate);
    }
  }
  return [];
}

export async function getSubGroupMembersByLicencePlateAndName(
  licencePlate: string,
  role: string,
  page: number,
  pageSize: number,
  searchTerm: string,
): Promise<UsersTotal> {
  const productRolesGroups: Group[] = await getProductAWSRoles(licencePlate);
  let result: User[] = [];
  let groupId: string = '';
  if (productRolesGroups.length > 0) {
    productRolesGroups[0].subGroups.forEach((group) => {
      if (group.name === roleToGroupName(role)) {
        groupId = group.id;
      }
    });
    if (groupId) {
      const groupsUsers = await getMembersByGroupId(groupId);
      if (groupsUsers) {
        result = [...groupsUsers.map((user) => createUserRole(user))];
      }
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

export async function getGroupsNamesByLicencePlate(licencePlate: string): Promise<tabName[]> {
  const productRolesGroups: Group[] = await getProductAWSRoles(licencePlate);
  if (productRolesGroups && productRolesGroups.length > 0) {
    return productRolesGroups[0].subGroups.map((subGroup) => {
      return parseGroupNameToTab(subGroup.name);
    });
  }
  return [];
}
