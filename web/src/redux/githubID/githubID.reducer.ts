/* eslint-disable no-case-declarations */
import GithubIDActionTypes from './githubID.types';
// TODO (BILLY), try to use interface instead of any

interface GithubIdBaseInterface {
  githubUser: object | null;
  inputKeyword: string | null;
  isLoading: boolean;
  everFetched: boolean;
  notFound: boolean;
}

// interface ProductOwnerGithubIDInterface extends GithubIdBaseInterface {}

interface GithubIdInitialState {
  updatedProductOwner: GithubIdBaseInterface;
  FirstUpdatedTechnicalLeads: GithubIdBaseInterface;
  SecondUpdatedTechnicalLeads: GithubIdBaseInterface;
}

const INITIAL_STATE: GithubIdInitialState = {
  updatedProductOwner: {
    githubUser: null,
    inputKeyword: null,
    isLoading: false,
    everFetched: false,
    notFound: false,
  },
  FirstUpdatedTechnicalLeads: {
    githubUser: null,
    inputKeyword: null,
    isLoading: false,
    everFetched: false,
    notFound: false,
  },
  SecondUpdatedTechnicalLeads: {
    githubUser: null,
    inputKeyword: null,
    isLoading: false,
    everFetched: false,
    notFound: false,
  },
};

const githubIDReducer = (
  state = INITIAL_STATE,
  action: any,
) => {
  const persona = action.persona as keyof GithubIdInitialState;
  switch (action.type) {
    case GithubIDActionTypes.GITHUB_USERS_REQUEST:
      return {
        ...state,
        [persona]: {
          ...state[persona],
          isLoading: true,
          everFetched: false,
        },
      };

    case GithubIDActionTypes.GITHUB_USER_EXIST:
      return {
        ...state,
        [persona]: {
          ...state[persona],
          isLoading: true,
          everFetched: true,
          notFound: false,
        },
      };

    case GithubIDActionTypes.GITHUB_USER_STORE_USER:
      return {
        ...state,
        [persona]: {
          ...state[persona],
          githubUser: action.payload,
          isLoading: false,
        },
      };
    case GithubIDActionTypes.GITHUB_USER_DOES_NOT_EXIST:
      return {
        ...state,
        [persona]: {
          ...state[persona],
          githubUser: null,
          isLoading: false,
          everFetched: true,
          notFound: true,
        },
      };

    case GithubIDActionTypes.GITHUB_USERS_INPUT:
      return {
        ...state,
        [persona]: {
          inputKeyword: action.payload,
          user: null,
          isLoading: false,
          everFetched: false,
          notFound: false,
        },
      };
    default:
      return state;
  }
};

export default githubIDReducer;
