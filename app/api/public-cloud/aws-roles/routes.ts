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
  firstName: string | null;
  lastName: string | null;
  email: string | null;
}

export async function getPublicCloudProjectUsers(
  searchLicencePlate: string,
): Promise<Record<string, User>[] | undefined> {
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
    if (projectOwner !== null) result.push({ 'Project Owner': projectOwner });
  }

  if (project?.primaryTechnicalLeadId) {
    const primaryTechnicalLead = await getUserById(project.primaryTechnicalLeadId);
    if (primaryTechnicalLead !== null) result.push({ 'Primary Technical Lead': primaryTechnicalLead });
  }

  if (project?.secondaryTechnicalLeadId) {
    const secondaryTechnicalLead = await getUserById(project.secondaryTechnicalLeadId);
    if (secondaryTechnicalLead !== null) result.push({ 'Secondary Technical Lead': secondaryTechnicalLead });
  }

  return result;
}

const parseError = (error: unknown): void => {
  if (error instanceof Error) {
    console.log(error.message);
  } else console.log(String(error));
};

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

export const getGroups: Promise<Group[] | undefined> = awsRolesApiInstance
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

export const getMembersByGroupId = async (groupId: string): Promise<User[] | undefined> =>
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

export async function getProductAWSRoles(licencePlate: string): Promise<Group[] | undefined> {
  const keyClockGroups = await getGroups;
  if (keyClockGroups) {
    const projectTeamGroups = findObjectByValue(keyClockGroups, 'name', 'Project Team Groups');
    if (projectTeamGroups) {
      return findObjectByValueSubstring(projectTeamGroups[0].subGroups, 'name', licencePlate);
    }
  }
}

const userRole = <K extends string, V>(role: K, user: V): Record<string, V> => {
  const roleUser: Record<K, V> = {} as Record<K, V>;
  roleUser[role] = user;
  return roleUser;
};

export async function getSubGroupMembersByLicencePlateAndName(
  licencePlate: string,
  groupName: string,
  role: string,
): Promise<Record<string, User>[] | undefined> {
  const productRolesGroups: Group[] | undefined = await getProductAWSRoles(licencePlate);

  if (productRolesGroups) {
    let groupId: string = '';
    productRolesGroups[0].subGroups.map((group) => {
      if (group.name === groupName) {
        groupId = group.id;
      }
    });
    if (groupId) {
      const groupsUsers: User[] | undefined = await getMembersByGroupId(groupId);
      return groupsUsers?.map((user) => userRole(role, user));
    }
  }
  return;
}
