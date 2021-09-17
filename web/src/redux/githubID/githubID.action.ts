import { Dispatch } from 'redux';
import { ActionType } from 'typesafe-actions';
import GithubIDActionTypes from './githubID.types';

export type GithubIDAction = ActionType<typeof requestGithubUsers>;

export const requestGithubUsers = (index: number) => ({
  type: GithubIDActionTypes.GITHUB_USERS_REQUEST,
  payload: index,
});

export const userExist = (index: number) => ({
  type: GithubIDActionTypes.GITHUB_USER_EXIST,
  payload: index,
});

export const storeUser = (payload: any) => ({
  type: GithubIDActionTypes.GITHUB_USER_STORE_USER,
  payload,
});

export const githubUserKeywordInput = (payload: object) => ({
  type: GithubIDActionTypes.GITHUB_USERS_INPUT,
  payload,
});

export const noSuchUser = (index: number) => ({
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
        dispatch(userExist(index));
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
