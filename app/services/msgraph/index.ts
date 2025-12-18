import { logger } from '@/core/logging';
import { parseMinistryFromDisplayName } from '@/helpers/user';
import { MsUser, AppUser } from '@/types/user';
import { instance } from './axios';

export function processMsUser(user: MsUser): AppUser | null {
  const idir = user.onPremisesSamAccountName;
  const upn = user.userPrincipalName;
  const idirGuid = user.extension_85cc52e9286540fcb1f97ed86114a0e5_bcgovGUID;

  return {
    id: '',
    providerUserId: user.id,
    upn,
    email: user.mail.toLowerCase(),
    idir,
    idirGuid,
    isGuidValid: true,
    displayName: user.displayName,
    firstName: user.givenName,
    lastName: user.surname,
    ministry: parseMinistryFromDisplayName(user.displayName),
    jobTitle: user.jobTitle || '',
    officeLocation: user.officeLocation || '',
  };
}

const userAttributes = [
  'id',
  'onPremisesSamAccountName',
  'userPrincipalName',
  'extension_85cc52e9286540fcb1f97ed86114a0e5_bcgovGUID', // pragma: allowlist secret
  'mail',
  'displayName',
  'givenName',
  'surname',
  'officeLocation',
  'jobTitle',
  // 'mobilePhone',
  // 'businessPhones',
];

const userAttributeString = userAttributes.join(',');

// See https://learn.microsoft.com/en-us/graph/api/user-get?view=graph-rest-1.0&tabs=http
export async function getUser(idOrUserPrincipalName: string) {
  const result = await instance
    .get<MsUser>(`/users/${idOrUserPrincipalName}`, {
      params: {
        $select: userAttributeString,
      },
    })
    .then((res) => res.data)
    .catch((err) => {
      if (err.status === 404) {
        return null; // User not found
      }

      logger.error(`Error fetching user by UPN: ${err.message ?? String(err)}`);
      return null;
    });

  return result ? processMsUser(result) : null;
}

// See https://learn.microsoft.com/en-us/graph/api/user-list?view=graph-rest-1.0&tabs=http
export async function listUsersByEmail(email: string) {
  const result = await instance
    .get<{ value: MsUser[] }>('/users', {
      params: {
        $filter: `startswith(mail,'${email}')`,
        $orderby: 'userPrincipalName',
        $count: 'true',
        $top: '25',
        $select: userAttributeString,
      },
    })
    .then((res) => res.data)
    .catch((err) => {
      logger.error(`Error fetching users by email: ${err.message ?? String(err)}`);
      return { value: [] };
    });

  return result.value.map(processMsUser).filter((user) => !!user);
}

export async function listUsersByIdirGuid(idirGuid: string) {
  const result = await instance
    .get<{ value: MsUser[] }>('/users', {
      params: {
        $filter: `startswith(extension_85cc52e9286540fcb1f97ed86114a0e5_bcgovGUID,'${idirGuid}')`,
        $orderby: 'userPrincipalName',
        $count: 'true',
        $top: '25',
        $select: userAttributeString,
      },
    })
    .then((res) => res.data)
    .catch((err) => {
      logger.error(`Error fetching users by email: ${err.message ?? String(err)}`);
      return { value: [] };
    });

  return result.value.map(processMsUser).filter((user) => !!user);
}

export async function getUserByEmail(email: string) {
  const users = await listUsersByEmail(email);
  const matchingUsers = users.filter((user) => user.email.toLowerCase() === email.toLowerCase());
  if (matchingUsers.length === 0) return null;

  return matchingUsers[0];
}

export async function getUserByIdirGuid(idirGuid: string) {
  const users = await listUsersByIdirGuid(idirGuid);
  const matchingUsers = users.filter((user) => user.idirGuid === idirGuid);
  if (matchingUsers.length === 0) return null;

  return matchingUsers[0];
}

// See https://learn.microsoft.com/en-us/graph/api/profilephoto-get
export async function getUserPhoto(upn: string) {
  const result = await instance
    .get<ArrayBuffer>(`/users/${upn.toLowerCase()}/photo/$value`, { responseType: 'arraybuffer' })
    .then((res) => res.data)
    .catch((err) => {
      if (err.status === 404) {
        return null; // User photo not found
      }

      logger.error(`Error fetching user photo: ${err.message ?? String(err)}`);
      return null;
    });

  return result;
}
