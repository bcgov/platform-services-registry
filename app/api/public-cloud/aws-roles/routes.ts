import axios from 'axios';

interface Group {
  id: string;
  name: string;
  path: string;
  subGroups: Group[];
}

interface User {
  id: string;
  username: string;
  enabled: boolean;
  totp: boolean;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  email: string;
}

const parseError = (error: unknown): void => {
  if (error instanceof Error) {
    console.log(error.message);
  } else console.log(String(error));
};
const getToken = async (): Promise<string | undefined> => {
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

const awsRolesApiInstance = axios.create({
  baseURL: `${process.env.AWS_ROLES_BASE_URL}/admin/realms/${process.env.AWS_ROLES_REALM_NAME}`,
});

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

const getGroups: Promise<Group[] | undefined> = awsRolesApiInstance
  .get('/groups')
  .then((response) => {
    return response.data;
  })
  .catch((error: unknown) => {
    parseError(error);
  });

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

export const getMembersByGroupId = (groupId: string): Promise<Group[] | undefined> =>
  awsRolesApiInstance
    .get(`/groups/${groupId}/members`)
    .then((response) => {
      return response.data;
    })
    .catch((error: unknown) => {
      parseError(error);
    });

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

const findObjectByValue = (array: Group[], key: keyof Group, value: any): Group[] | undefined => {
  return array.filter((obj) => obj[key] === value);
};

const findObjectByValueSubstring = (array: Group[], key: keyof Group, value: any): Group[] | undefined => {
  return array.filter((obj) => obj[key].includes(value));
};

export async function getProductAWSRoles(licencePlate: string = 'eu9cfk'): Promise<Group[] | undefined> {
  const keyClockGroups = await getGroups;
  if (keyClockGroups) {
    const projectTeamGroups = findObjectByValue(keyClockGroups, 'name', 'Project Team Groups');
    if (projectTeamGroups) {
      return findObjectByValueSubstring(projectTeamGroups[0].subGroups, 'name', licencePlate);
    }
  }
}
