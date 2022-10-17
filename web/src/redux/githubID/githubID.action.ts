import { AccountInfo, IPublicClientApplication } from '@azure/msal-browser';
import { Dispatch } from 'redux';
import { ActionType } from 'typesafe-actions';
import GithubIDActionTypes from './githubID.types';

export type GithubIDAction = ActionType<typeof requestGithubUsers>;
interface GithubIDActionPayload {
  persona: string;
  position: number;
}
const requestGithubUsers = (payload: GithubIDActionPayload) => ({
  type: GithubIDActionTypes.GITHUBID_USERS_REQUEST,
  payload,
});

const userExists = (payload: GithubIDActionPayload) => ({
  type: GithubIDActionTypes.GITHUBID_USER_EXISTS,
  payload,
});

const storeUser = (payload: any) => ({
  type: GithubIDActionTypes.GITHUBID_STORE_USER,
  payload,
});

export const githubIDSearchKeyword = (payload: object) => ({
  type: GithubIDActionTypes.GITHUBID_USERS_INPUT_SEARCH_KEY,
  payload,
});

const noSuchUser = (payload: GithubIDActionPayload) => ({
  type: GithubIDActionTypes.GITHUBID_USER_DOES_NOT_EXIST,
  payload,
});

export const createNewTechnicalLeads = () => ({
  type: GithubIDActionTypes.NEW_GITHUB_ID_ENTRY,
});

async function getUserPhoto(bearer: string, userId: string) {
  const url = `https://graph.microsoft.com/v1.0/users/${userId}/photo/$value`;
  const headers = new Headers();
  headers.append('ConsistencyLevel', 'eventual');
  headers.append('Authorization', bearer);

  const response = await fetch(url, {
    method: 'GET',
    headers,
  });
  if (response.ok) {
    return window.URL.createObjectURL(await response.blob());
  }
  return '';
}

export const searchIdirUsers = (
  query: string,
  persona: string,
  position: number,
  instance: IPublicClientApplication,
  accounts: AccountInfo[],
  graphToken: string,
) => async (dispatch: Dispatch<GithubIDAction>) => {
  console.log(`searching for ${query}`);
  dispatch(requestGithubUsers({ persona, position }));
  // use this to search by email (future work): `https://graph.microsoft.com/v1.0/users?$filter=startswith(mail,'${query}')&$orderby=userPrincipalName&$count=true&$top=1`;
  const url = `https://graph.microsoft.com/v1.0/users?$filter=startswith(displayName,'${query}')
  &$orderby=displayName&$count=true
  &$top=1
  &$select=onPremisesSamAccountName,
  id,
  mail,
  displayName`;
  const headers = new Headers();
  headers.append('ConsistencyLevel', 'eventual');
  const bearer = `Bearer ${graphToken}`;
  headers.append('Authorization', bearer);

  const options = {
    method: 'GET',
    headers,
  };

  return fetch(url, options)
    .then(async (response) => {
      if (response.ok) {
        dispatch(userExists({ persona, position }));
        const data = await response.json();
       // console.log(JSON.stringify(data));
        const photoObjectURL = await getUserPhoto(bearer, data.value[0].id);
        data.avatar_url = photoObjectURL;
        dispatch(storeUser({ persona, position, data }));
      } else {
        dispatch(noSuchUser({ persona, position }));
      }
    })
    .catch((error) => console.error(error));
};

export default githubIDSearchKeyword;
