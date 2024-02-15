import axios from 'axios';
import { AWS_ROLES_BASE_URL, AWS_ROLES_REALM_NAME, AWS_ROLES_CLIENT_ID, AWS_ROLES_CLIENT_SECRET } from '@/config';
import _startCase from 'lodash-es/startCase';
import _kebabCase from 'lodash-es/kebabCase';
import msalConfig from '@/msal//config';
import { ConfidentialClientApplication } from '@azure/msal-node';

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

export type paramsURL = {
  params: { licencePlate: string; role: string };
  searchParams: { page: string; pageSize: string };
};

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

const createUserRole = (user: User): User => {
  const roleUser = createUser({ ...user });
  return roleUser;
};

const roleToGroupName = (role: string): string => {
  return role.replace(/\s/g, '') + 's';
};

const parseError = (error: unknown) => {
  if (error instanceof Error) {
    console.log(error.message);
  } else console.log(String(error));
  return Promise.reject(error);
};

const awsRolesApiInstance = axios.create({
  baseURL: `${AWS_ROLES_BASE_URL}/admin/realms/${AWS_ROLES_REALM_NAME}`,
});

export const getToken = async (): Promise<string | undefined> => {
  try {
    const apiUrl = `${AWS_ROLES_BASE_URL}/realms/${AWS_ROLES_REALM_NAME}/protocol/openid-connect/token`;
    const requestBody = {
      client_id: AWS_ROLES_CLIENT_ID,
      client_secret: AWS_ROLES_CLIENT_SECRET,
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

const getUserGuid = async (userEmail: string) => {
  const cca = new ConfidentialClientApplication(
    msalConfig as {
      auth: {
        authority: string;
        clientId: string;
        clientSecret: string;
      };
    },
  );

  try {
    const authResult = await cca.acquireTokenByClientCredential({
      scopes: ['https://graph.microsoft.com/.default'],
    });

    if (!authResult) {
      console.error('Auth error');
      return { error: 'Auth error' };
    }

    const accessToken = authResult.accessToken;
    if (!accessToken) {
      console.error('Error fetching token');
      return { error: 'Error fetching token' };
    }

    const url = `https://graph.microsoft.com/beta/users/${userEmail}`;
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      ConsistencyLevel: 'eventual',
    };

    const response = await axios.get(url, { headers });

    if (response.status === 200) {
      const json_data = response.data;
      console.log('json_data', json_data);
      const user: {
        username: string;
        firstName: string;
        lastName: string;
      } = {
        username: '',
        firstName: json_data.givenName,
        lastName: json_data.surname,
      };
      for (const key in json_data) {
        if (key.endsWith('_bcgovGUID')) {
          user.username = json_data[key];
        }
      }
      return user;
    }
    console.error('Error fetching users');
    return { error: 'Error fetching user guid' };
  } catch (error) {
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

// search by substring, returns all of groups, which names includes searchParam
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

export const createKeyCloakUser = async (userEmail: string) => {
  const user:
    | {
        username: string;
        firstName: string;
        lastName: string;
      }
    | { error: string }
    | undefined = await getUserGuid(userEmail);
  if (user && !('error' in user)) {
    awsRolesApiInstance
      .post(`/users`, {
        email: userEmail,
        username: user.username,
        enabled: true,
        firstName: user.firstName,
        lastName: user.lastName,
      })
      .then((response) => {
        return response.data;
      })
      .catch((error: unknown) => {
        parseError(error);
      });
  } else if (user && 'error' in user) {
    console.error(user.error);
  } else {
    console.error('User data is undefined');
  }
};

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

export async function addUserToGroupByEmail(userEmail: string, groupId: string) {
  const userId = await getUserByEmail(userEmail);
  if (userId) {
    if (userId?.length === 0) {
      await createKeyCloakUser(userEmail);
    }
    if (userId[0].id) {
      await addUserToGroup(userId[0].id, groupId);
    }
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
