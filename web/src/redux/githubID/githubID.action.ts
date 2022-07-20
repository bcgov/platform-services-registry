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

// TODO: move to constants, and IDs etc. should probably be pulled from .env
const msalConfig = {
  auth: {
    clientId: "5afdfc62-637b-41cf-b186-b2de816faaf9",
    authority: "6fdb5200-3d0d-4a8a-b036-d3685e359adc",
    redirectUri: "https://localhost:8101",
  },
  cache: {
    cacheLocation: "sessionStorage", // This configures where your cache will be stored
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  }
};

export const searchIdirUsers = (query: string, persona: string, position: number, azureToken: string) => async (
  dispatch: Dispatch<GithubIDAction>,
  ) => {
    dispatch(requestGithubUsers({persona, position }));
    // right now I'm assuming we are using a scheme where the application gets permisison to access Graph, rather than the signed in IDIR user
    /**You specify the pre-configured permissions by passing https://graph.microsoft.com/.default as the value for the scope parameter 
     * in the token request */
    /* need to send a POST to the token  endpoint to get an access token  from the documentation: 
    POST https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token HTTP/1.1
    Host: login.microsoftonline.com
    Content-Type: application/x-www-form-urlencoded

    client_id=535fb089-9ff3-47b6-9bfb-4f1264799865
    &scope=https%3A%2F%2Fgraph.microsoft.com%2F.default
    &client_secret=qWgdYAmab0YSkuL1qKv5bPX
    &grant_type=client_credentials*/
  console.log("ACCESS TOKEN: " + azureToken);
  const headers = new Headers();
  const options = {
    method: "GET",
    headers: headers,
    scope: "https://graph.microsoft.com/.default"
  };
  fetch("https://graph.microsoft.com/v1.0/users/$count", options)
    .then(async (response) => {
      if(response.ok) {
        console.log(response.text);
      } else {
        console.log("handle errors better, genius.")
      }
    })
    .catch((err) => {
      dispatch(noSuchUser({ persona, position }));
      throw new Error('Something went wrong.');
    });
};

export default githubIDSearchKeyword;
