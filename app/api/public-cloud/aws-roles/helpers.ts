import axios from 'axios';
import prisma from '@/lib/prisma';
import { getUserById } from '@/queries/user';

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
  // [key: string]: string;
}

export type paramsURL = {
  params: { licencePlate: string; role: string };
  searchParams: { page: string; pageSize: string };
};

interface UsersTotal {
  users: Record<string, User>[];
  groupId: string;
  total: number;
}

interface PaginationOptions {
  page: number;
  pageSize: number;
}

const paginate = <T>(users: T[], options: PaginationOptions): T[] => {
  const { page, pageSize } = options;

  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  return users.slice(startIndex, endIndex);
};

const searchSubstringInArray = (searchTerm: string, users: Record<string, User>[]): Record<string, User>[] => {
  const results = new Set<Record<string, User>>();

  users.filter((userObj) =>
    Object.values(userObj).some((user) => {
      Object.values(user).forEach((value) => {
        if (typeof value === 'string' && value.toLowerCase().includes(searchTerm?.toLowerCase())) {
          results.add(userObj);
          return;
        }
      });
    }),
  );

  return Array.from(results);
};

const createUser = <V extends User>(data: Partial<V>): V => {
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

const userRole = <K extends string, V extends User>(role: K, user: V): Record<string, V> => {
  const roleUser = { [role]: createUser({ ...user }) } as Record<string, V>;
  return roleUser;
};

const roleToGroupName = (role: string): string => {
  return role.replace(/\s/g, '') + 's';
};

async function getPublicCloudProjectUsers(searchLicencePlate: string): Promise<Record<string, User>[] | undefined> {
  const result: Record<string, User>[] = [];
  const project = await prisma.publicCloudProject.findFirst({
    where: {
      licencePlate: {
        contains: searchLicencePlate,
      },
    },
  });

  if (project?.projectOwnerId) {
    const projectOwner = await getUserById(project.projectOwnerId);
    if (projectOwner !== null) result.push(userRole('Product Owner', projectOwner as unknown as User));
  }

  if (project?.primaryTechnicalLeadId) {
    const primaryTechnicalLead = await getUserById(project.primaryTechnicalLeadId);
    if (primaryTechnicalLead !== null)
      result.push(userRole('Primary Technical Lead', primaryTechnicalLead as unknown as User));
  }

  if (project?.secondaryTechnicalLeadId) {
    const secondaryTechnicalLead = await getUserById(project.secondaryTechnicalLeadId);
    if (secondaryTechnicalLead !== null)
      result.push(userRole('Secondary Technical Lead', secondaryTechnicalLead as unknown as User));
  }

  return result;
}

const parseError = (error: unknown) => {
  if (error instanceof Error) {
    console.log(error.message);
  } else console.log(String(error));
  return Promise.reject(error);
};

const awsRolesApiInstance = axios.create({
  baseURL: `${process.env.AWS_ROLES_BASE_URL}/admin/realms/${process.env.AWS_ROLES_REALM_NAME}`,
});

export const getToken = async (): Promise<string | undefined> => {
  try {
    const apiUrl = `${process.env.AWS_ROLES_BASE_URL}/realms/${process.env.AWS_ROLES_REALM_NAME}/protocol/openid-connect/token`;
    const requestBody = {
      client_id: process.env.AWS_ROLES_CLIENT_ID,
      client_secret: process.env.AWS_ROLES_CLIENT_SECRET,
      grant_type: 'client_credentials',
    };
    const response = await axios.post(apiUrl, requestBody, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data.access_token;
  } catch (error: unknown) {
    parseError(error);
  }
};

awsRolesApiInstance.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export const getGroups = async (): Promise<Group[]> => {
  const groups = await awsRolesApiInstance
    .get('/groups')
    .then((response) => {
      return response.data;
    })
    .catch((error: unknown) => {
      parseError(error);
    });
  return groups as Group[];
};

//search by substring, returns all of groups, which names includes searchParam
export const getGroupByName = (groupName: string = 'Project Team Groups'): Promise<Group[] | undefined> =>
  awsRolesApiInstance
    .get('/groups', {
      params: {
        search: groupName,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error: unknown) => {
      parseError(error);
    });

export const getUsers: Promise<Group[] | undefined> = awsRolesApiInstance
  .get('/users')
  .then((response) => {
    return response.data;
  })
  .catch((error: unknown) => {
    parseError(error);
  });

export const getMembersByGroupId = async (groupId: string): Promise<User[]> => {
  const members = await awsRolesApiInstance
    .get(`/groups/${groupId}/members`)
    .then((response) => {
      return response.data;
    })
    .catch((error: unknown) => {
      parseError(error);
    });
  return members as User[];
};

export const getUserByEmail = (email: string): Promise<User[] | undefined> =>
  awsRolesApiInstance
    .get('/users', {
      params: {
        search: email,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error: unknown) => {
      parseError(error);
    });

export const addUserToGroup = (userId: string, groupId: string) =>
  awsRolesApiInstance
    .put(`/users/${userId}/groups/${groupId}`)
    .then((response) => {
      return response.data;
    })
    .catch((error: unknown) => {
      parseError(error);
    });

export const removeUserFromGroup = (userId: string, groupId: string) =>
  awsRolesApiInstance
    .delete(`/users/${userId}/groups/${groupId}`)
    .then((response) => {
      return response.data;
    })
    .catch((error: unknown) => {
      parseError(error);
    });

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
  let result: Record<string, User>[] = [];
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
        result = [...groupsUsers.map((user) => userRole(role, user))];
      }
    }
  }
  if (role === 'Admin') {
    const registryUsers = await getPublicCloudProjectUsers(licencePlate);
    if (registryUsers) {
      result = [...registryUsers, ...result];
    }
  }

  if (searchTerm) {
    result = searchSubstringInArray(searchTerm, result);
  }

  const total = result.length;
  return { users: paginate(result, { page, pageSize }) as Record<string, User>[], groupId, total };
}

export async function addUserToGroupByEmail(userEmail: string, groupId: string) {
  const userId = await getUserByEmail(userEmail);
  if (userId) {
    await addUserToGroup(userId[0].id, groupId);
  }
}
