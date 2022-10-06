import { AccountInfo, IPublicClientApplication } from '@azure/msal-browser';
import axios from 'axios';
import { url } from 'inspector';
import { Dispatch } from 'redux';
import { ActionType } from 'typesafe-actions';
import { getClusterDisplayName } from '../../utils/transformDataHelper';
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

const getUserPhoto = async (bearer: string, userId: string) => {
  const headers = new Headers();
  headers.append("ConsistencyLevel", "eventual");
  headers.append("Authorization", bearer);

  const options = {
      method: "GET",
      headers: headers,
  };
  const url = `https://graph.microsoft.com/v1.0/users/${userId}/photo/$value`;
  const data = await axios.request(
    {
    method: 'GET',
    headers: headers, 
    url: url,
    responseType: 'blob',
  }
  );
  console.log(`photData: ${JSON.stringify(data)}`);
  
  return window.URL.createObjectURL(data.data);
};

export const searchIdirUsers = (query: string, persona: string, position: number, instance: IPublicClientApplication, accounts: AccountInfo[]) => async (
  dispatch: Dispatch<GithubIDAction>,
  ) => {
    dispatch(requestGithubUsers({persona, position }));
  const request = {
    scopes: ["User.ReadBasic.All"],
    account: accounts[0],
  }
  const url = `https://graph.microsoft.com/v1.0/users?$filter=startswith(displayName,'${query}')&$orderby=displayName&$count=true&$top=1`;
  
  instance.acquireTokenSilent(request).then((response) => {
    const headers = new Headers();
    headers.append("ConsistencyLevel", "eventual");
    const bearer = `Bearer ${response.accessToken}`;
   // console.log(response.accessToken);
    headers.append("Authorization", bearer);

    const options = {
        method: "GET",
        headers: headers,
    };

    return fetch(url, options)
        .then(async response => {
          if (response.ok) {
            dispatch(userExists({ persona, position }));
            const data = await response.json();
            const photoObjectURL = await getUserPhoto(bearer, data.value[0].id);
            data.avatar_url = photoObjectURL;
            console.log(JSON.stringify(data));
            console.log(`photo object: ${photoObjectURL}`);
            dispatch(storeUser({ persona, position, data }));
          } else {
            dispatch(noSuchUser({ persona, position }));
          }
        })
        .catch(error => console.error(error));
  }).catch((e) => {
      instance.acquireTokenPopup(request).then((response) => {
        const headers = new Headers();
        const bearer = `Bearer ${response.accessToken}`;
        headers.append("Authorization", bearer);

        const options = {
            method: "GET",
            headers: headers
        };

        return fetch(url, options)
        .then(async response => {
          if (response.ok) {
            dispatch(userExists({ persona, position }));
            let data = await response.json();
            dispatch(storeUser({ persona, position, data }));
          } else {
            dispatch(noSuchUser({ persona, position }));
          }
        })
        .catch(error => console.error(error));
      });
  });
};

export default githubIDSearchKeyword;
