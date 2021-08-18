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
    user: null,
    inputKeyword: null,
    isLoading: false,
    everFetched: false,
    notFound: false,
  },
  FirstUpdatedTechnicalLeads: {
    user: null,
    inputKeyword: null,
    isLoading: false,
    everFetched: false,
    notFound: false,
  },
  SecondUpdatedTechnicalLeads: {
    user: null,
    inputKeyword: null,
    isLoading: false,
    everFetched: false,
    notFound: false,
  },
};

const githubIDReducer = (state = INITIAL_STATE, action: any) => {
  const GithubReduxKey = action.reduxReference;
  const NewState = state;
  switch (action.type) {
    case GithubIDActionTypes.GITHUB_USERS_REQUEST:
      NewState[GithubReduxKey] = {
        ...NewState[GithubReduxKey],
        isLoading: true,
        everFetched: false,
      };
      return NewState;

    case GithubIDActionTypes.GITHUB_USER_EXIST:
      NewState[GithubReduxKey] = {
        ...NewState[GithubReduxKey],
        isLoading: false,
        everFetched: true,
        notFound: false,
      };

      return NewState;

    case GithubIDActionTypes.GITHUB_USER_RESPONSE:
      NewState[GithubReduxKey] = {
        ...NewState[GithubReduxKey],
        user: action.payload,
      };
      return NewState;

    case GithubIDActionTypes.GITHUB_USER_DOES_NOT_EXIST:
      NewState[GithubReduxKey] = {
        ...NewState[GithubReduxKey],
        user: null,
        isLoading: false,
        everFetched: true,
        notFound: true,
      };
      return NewState;

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
