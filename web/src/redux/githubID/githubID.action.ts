import { AccountInfo, IPublicClientApplication } from '@azure/msal-browser';
import { Dispatch } from 'redux';
import { ActionType } from 'typesafe-actions';
import GithubIDActionTypes from './githubID.types';
//import * as MSGraph from '@microsoft/msgraph-sdk-javascript'

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

export const searchGithubUsers = (query: string, persona: string, position: number) => (
  dispatch: Dispatch<GithubIDAction>,
) => {
  dispatch(requestGithubUsers({ persona, position }));
  fetch(`https://api.github.com/users/${query}`)
    .then(async (response) => {
      if (response.ok) {
        dispatch(userExists({ persona, position }));
        const data = await response.json();
        dispatch(storeUser({ persona, position, data }));
      } else {
        dispatch(noSuchUser({ persona, position }));
      }
    })
    .catch((err) => {
      dispatch(noSuchUser({ persona, position }));
      throw new Error('Error happened during fetching Github data!');
    });
};

export const searchIdirUsers = (query: string, persona: string, position: number, instance: IPublicClientApplication, accounts: AccountInfo[]) => async (
  dispatch: Dispatch<GithubIDAction>,
  ) => {
    dispatch(requestGithubUsers({persona, position }));
  const request = {
    scopes: ["User.ReadBasic.All"],
    account: accounts[0],
  }
  console.log("tring to get token...")
  instance.acquireTokenSilent(request).then((response) => {
    console.log(`token: ${response.accessToken}`);
    //callMsGraph(response.accessToken).then(response => setGraphData(response));
    const headers = new Headers();
    headers.append("ConsistencyLevel", "eventual");
    const bearer = `Bearer ${response.accessToken}`;

    headers.append("Authorization", bearer);

    const options = {
        method: "GET",
        headers: headers,
    };
    const url = `https://graph.microsoft.com/v1.0/users?$filter=startswith(displayName,'${query}')&$orderby=displayName&$count=true&$top=1`;
    return fetch(url, options)
        .then(async response => {
          if (response.ok) {
            // dispatch(userExists({ persona, position }));
            const data = await response.json();
            console.log(`data: ${JSON.stringify(data)}`);
            // dispatch(storeUser({ persona, position, data }));
          } else {
            // dispatch(noSuchUser({ persona, position }));
          }
        })
        .catch(error => console.log(error));
  }).catch((e) => {
      instance.acquireTokenPopup(request).then((response) => {
        const headers = new Headers();
        const bearer = `Bearer ${response.accessToken}`;

        headers.append("Authorization", bearer);

        const options = {
            method: "GET",
            headers: headers
        };
        return fetch("https://graph.microsoft.com/v1.0/users/oamar.kanji@gov.bc.ca", options)
        .then(response => {
          //response.json();
          console.log(response);
        })
        .catch(error => console.log(error));
      });
  });
};

export default githubIDSearchKeyword;
