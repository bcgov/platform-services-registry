import { callMsGraph, getAccessToken } from '@/msal';

export async function sendRequest(url: string) {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw Error('invalid access token');
  }

  const response = await callMsGraph(url, accessToken);
  return response;
}

// See https://learn.microsoft.com/en-us/graph/api/user-get?view=graph-rest-1.0&tabs=http
export async function getUser(idOruserPrincipalName: string) {
  const url = `https://graph.microsoft.com/v1.0/users/${idOruserPrincipalName}`;
  const res = await sendRequest(url);

  if (res.status !== 200) {
    return null;
  }

  const data = res.json();
  console.log(data);
  return data;
}
