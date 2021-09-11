import GithubIDActionTypes from './githubID.types';
import { Dispatch } from 'redux'
import { ActionType } from 'typesafe-actions';

export type GithubIDAction = ActionType<typeof requestGithubUsers>;

export const requestGithubUsers = (persona: string) => ({
  type: GithubIDActionTypes.GITHUB_USERS_REQUEST,
  persona,
});

export const userExist = (persona: string) => ({
  type: GithubIDActionTypes.GITHUB_USER_EXIST,
  persona,
});

export const storeUser = (persona: string, payload: object) => ({
  type: GithubIDActionTypes.GITHUB_USER_STORE_USER,
  payload,
  persona,
});

export const githubUserKeywordInput = (persona: Array<string>, payload: string) => ({
  type: GithubIDActionTypes.GITHUB_USERS_INPUT,
  payload,
  persona,
});

export const noSuchUser = (persona: string) => ({
  type: GithubIDActionTypes.GITHUB_USER_DOES_NOT_EXIST,
  persona,
});

export const searchGithubUsers = (query: string, persona: string) => (dispatch: Dispatch<GithubIDAction>) => {
  dispatch(requestGithubUsers(persona));
  fetch(`https://api.github.com/users/${query}`)
    .then(async (response) => {
      if (response.ok) {
        dispatch(userExist(persona));
        const data = await response.json();
        dispatch(storeUser(persona, data));
      } else {
        dispatch(noSuchUser(persona));
      }
    })
    .catch((err) => {
      dispatch(noSuchUser(persona));
      throw new Error('Error happened during fetching Github data!');
    });
};

export default githubUserKeywordInput;
