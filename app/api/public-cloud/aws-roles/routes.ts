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

async function getToken(): Promise<string | undefined> {
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
    if (error instanceof Error) {
      console.log(error.message);
    } else console.log(String(error));
  }
}

async function getGroups(): Promise<Group[] | undefined> {
  const accessToken = await getToken();
  try {
    const apiUrl = `${process.env.AWS_ROLES_BASE_URL}/admin/realms/${process.env.AWS_ROLES_REALM_NAME}/groups`;
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(error.message);
    } else console.log(String(error));
  }
}
//search by substring, returns all of groups, which names includes searchParam
export async function getGroupByName(groupName: string): Promise<Group[] | undefined> {
  const accessToken = await getToken();
  try {
    const apiUrl = `${process.env.AWS_ROLES_BASE_URL}/admin/realms/${process.env.AWS_ROLES_REALM_NAME}/groups`;
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        search: groupName,
      },
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(error.message);
    } else console.log(String(error));
  }
}

export async function getUsers(): Promise<User[] | undefined> {
  const accessToken = await getToken();
  try {
    const apiUrl = `${process.env.AWS_ROLES_BASE_URL}/admin/realms/${process.env.AWS_ROLES_REALM_NAME}/users`;
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(error.message);
    } else console.log(String(error));
  }
}

export async function getMembersByGroupId(groupId: string): Promise<User[] | undefined> {
  const accessToken = await getToken();
  try {
    const apiUrl = `${process.env.AWS_ROLES_BASE_URL}/admin/realms/${process.env.AWS_ROLES_REALM_NAME}/groups/${groupId}/members`;
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log(response.data);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(error.message);
    } else console.log(String(error));
  }
}
// getMembersByGroupId("734122b2-1b80-4fc4-a614-21d94773e3cb")

export async function getUserByEmail(email: string): Promise<User[] | undefined> {
  const accessToken = await getToken();
  try {
    const apiUrl = `${process.env.AWS_ROLES_BASE_URL}/admin/realms/${process.env.AWS_ROLES_REALM_NAME}/users`;
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        email: email,
      },
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(error.message);
    } else console.log(String(error));
  }
}

export async function addUserToGroup(userId: string, groupId: string) {
  const accessToken = await getToken();
  try {
    const apiUrl = `${process.env.AWS_ROLES_BASE_URL}/admin/realms/${process.env.AWS_ROLES_REALM_NAME}/users/${userId}/groups/${groupId}/`;

    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) {
      console.error('Failed to fetch data.');
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(error.message);
    } else console.log(String(error));
  }
}

export async function removeUserFromGroup(userId: string, groupId: string) {
  const accessToken = await getToken();
  try {
    const apiUrl = `${process.env.AWS_ROLES_BASE_URL}/admin/realms/${process.env.AWS_ROLES_REALM_NAME}/users/${userId}/groups/${groupId}/`;

    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) {
      console.error('Failed to fetch data.');
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(error.message);
    } else console.log(String(error));
  }
}

// removeUserFromGroup("31b8fdbf-56fa-48f6-a02d-6fb44e1d9933", "734122b2-1b80-4fc4-a614-21d94773e3cb")

const findObjectByValue = (array: Group[], key: keyof Group, value: any): Group[] | undefined => {
  return array.filter((obj) => obj[key] === value);
};

const findObjectByValueSubstring = (array: Group[], key: keyof Group, value: any): Group[] | undefined => {
  return array.filter((obj) => obj[key].includes(value));
};

export async function getProductAWSRoles(licencePlate: string = 'eu9cfk'): Promise<Group[] | undefined> {
  const keyClockGroups = await getGroups();
  if (keyClockGroups) {
    const projectTeamGroups = findObjectByValue(keyClockGroups, 'name', 'Project Team Groups');
    if (projectTeamGroups) {
      // console.log(findObjectByValueSubstring(projectTeamGroups[0].subGroups, "name", licencePlate)![0].subGroups[0].id)
      return findObjectByValueSubstring(projectTeamGroups[0].subGroups, 'name', licencePlate);
    }
  }
  return;
}
