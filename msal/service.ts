import { callMsGraph, getAccessToken } from '@/msal';

interface MsUser {
  id: string;
  onPremisesSamAccountName: string;
  userPrincipalName: string;
  extension_85cc52e9286540fcb1f97ed86114a0e5_bcgovGUID: string; // pragma: allowlist secret
  mail: string;
  displayName: string;
  givenName: string;
  surname: string;
  jobTitle: string;
}

export function processMsUser(user: MsUser) {
  return {
    id: user.id,
    onPremisesSamAccountName: user.onPremisesSamAccountName,
    userPrincipalName: user.userPrincipalName,
    idirGuid: user.extension_85cc52e9286540fcb1f97ed86114a0e5_bcgovGUID,
    mail: user.mail,
    displayName: user.displayName,
    givenName: user.givenName,
    surname: user.surname,
  };
}

export async function sendRequest(url: string) {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw Error('invalid access token');
  }

  const response = await callMsGraph(url, accessToken);
  return response;
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
  'jobTitle',
];

const userSelect = `$select=${userAttributes.join(',')}`;

// See https://learn.microsoft.com/en-us/graph/api/user-get?view=graph-rest-1.0&tabs=http
export async function getUser(idOruserPrincipalName: string) {
  const url = `https://graph.microsoft.com/v1.0/users/${idOruserPrincipalName}?${userSelect}`;
  const res = await sendRequest(url);

  if (res.status !== 200) {
    return null;
  }

  const data = await res.json();
  return processMsUser(data as MsUser);
}

// See https://learn.microsoft.com/en-us/graph/api/user-list?view=graph-rest-1.0&tabs=http
export async function listUsersByEmail(email: string) {
  const filter = `$filter=startswith(mail,'${email}')`;
  const orderby = '$orderby=userPrincipalName';
  const count = '$count=true';
  const top = '$top=25';
  const query = [filter, userSelect, orderby, count, top].join('&');

  const url = `https://graph.microsoft.com/v1.0/users?${query}`;
  const res = await sendRequest(url);

  if (res.status !== 200) {
    return [];
  }

  const data = await res.json();
  return (data as { value: MsUser[] }).value.map(processMsUser);
}
