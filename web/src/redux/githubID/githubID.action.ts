import GithubIDActionTypes from './user.types';

export const requestGithubUsers = (reduxReference: string) => ({
  type: GithubIDActionTypes.GITHUB_USERS_REQUEST,
  reduxReference,
});

export const userExist = (reduxReference: string) => ({
  type: GithubIDActionTypes.GITHUB_USER_EXIST,
  reduxReference,
});

export const storeUser = (payload: any, reduxReference: string) => ({
  type: GithubIDActionTypes.GITHUB_USER_RESPONSE,
  payload,
  reduxReference,
});

export const githubUserKeywordInput = (reduxReference: Array<string>, payload: any) => ({
  type: GithubIDActionTypes.GITHUB_USERS_INPUT,
  payload,
  reduxReference,
});

export const noSuchUser = (reduxReference: string) => ({
  type: GithubIDActionTypes.GITHUB_USER_DOES_NOT_EXIST,
  reduxReference,
});

export const searchGithubUsers = (query: string, reduxReference: string) => (dispatch: any) => {
  dispatch(requestGithubUsers(reduxReference));
  fetch(`https://api.github.com/users/${query}`)
    .then(async (response) => {
      if (response.ok) {
        dispatch(userExist(reduxReference));
        const data = await response.json();
        dispatch(storeUser(data, reduxReference));
      } else {
        dispatch(noSuchUser(reduxReference));
      }
    })
    .catch((err) => {
      dispatch(noSuchUser(reduxReference));
      throw new Error('Error happened during fetching Github data!');
    });
};

export default githubUserKeywordInput;
