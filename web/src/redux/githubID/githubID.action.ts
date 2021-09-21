import { Dispatch } from 'redux';
import { ActionType } from 'typesafe-actions';
import GithubIDActionTypes from './githubID.types';

export type GithubIDAction = ActionType<typeof requestGithubUsers>;

const requestGithubUsers = (index: number) => ({
  type: GithubIDActionTypes.GITHUB_USERS_REQUEST,
  payload: index,
});

const userExists = (index: number) => ({
  type: GithubIDActionTypes.GITHUB_USER_EXISTS,
  payload: index,
});

const storeUser = (payload: any) => ({
  type: GithubIDActionTypes.GITHUB_USER_STORE_USER,
  payload,
});

export const githubUserKeywordInput = (payload: object) => ({
  type: GithubIDActionTypes.GITHUB_USERS_INPUT,
  payload,
});

const noSuchUser = (index: number) => ({
  type: GithubIDActionTypes.GITHUB_USER_DOES_NOT_EXIST,
  payload: index,
});

export const createNewTechnicalLeads = () => ({
  type: GithubIDActionTypes.NEW_GITHUB_ID_ENTRY,
});

export const searchGithubUsers = (query: string, index: number) => (
  dispatch: Dispatch<GithubIDAction>,
) => {
  dispatch(requestGithubUsers(index));
  fetch(`https://api.github.com/users/${query}`)
    .then(async (response) => {
      if (response.ok) {
        dispatch(userExists(index));
        const data = await response.json();
        dispatch(storeUser({ index, data }));
      } else {
        dispatch(noSuchUser(index));
      }
    })
    .catch((err) => {
      dispatch(noSuchUser(index));
      throw new Error('Error happened during fetching Github data!');
    });
};

export default githubUserKeywordInput;
