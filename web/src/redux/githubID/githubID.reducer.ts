/* eslint-disable no-case-declarations */
import GithubIDActionTypes from './user.types';
// TODO (BILLY), try to use interface instead of any

// interface GithubIdBaseInterface {
//   user: object | null;
//   inputKeyword: string | null;
//   isLoading: boolean;
//   fetched: boolean;
//   notFound: boolean;
// }

// interface ProductOwnerGithubIDInterface extends GithubIdBaseInterface {
//   productOwnerGithubID: {};
// }
// interface TechnicalLeadInitialState extends Array<GithubIdBaseInterface> {
//   technicalLeads: {};
// }
// interface GithubIdInitialState extends ProductOwnerGithubIDInterface, TechnicalLeadInitialState {}

const INITIAL_STATE: any = {
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

const githubIDReducer = (state = INITIAL_STATE, action: any) => {
  const GithubReduxKey = action.reduxReference;
  switch (action.type) {
    case GithubIDActionTypes.GITHUB_USERS_REQUEST:
      return {
        ...state,
        [GithubReduxKey]: {
          ...state[GithubReduxKey],
          isLoading: true,
          everFetched: false,
        },
      };

    case GithubIDActionTypes.GITHUB_USER_EXIST:
      return {
        ...state,
        [GithubReduxKey]: {
          ...state[GithubReduxKey],
          isLoading: true,
          everFetched: true,
          notFound: false,
        },
      };

    case GithubIDActionTypes.GITHUB_USER_STORE_USER:
      return {
        ...state,
        [GithubReduxKey]: {
          ...state[GithubReduxKey],
          githubUser: action.payload,
          isLoading: false,
        },
      };
    case GithubIDActionTypes.GITHUB_USER_DOES_NOT_EXIST:
      return {
        ...state,
        [GithubReduxKey]: {
          ...state[GithubReduxKey],
          githubUser: null,
          isLoading: false,
          everFetched: true,
          notFound: true,
        },
      };

    case GithubIDActionTypes.GITHUB_USERS_INPUT:
      return {
        ...state,
        [GithubReduxKey]: {
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
