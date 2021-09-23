/* eslint-disable no-case-declarations */
import GithubIDActionTypes from './githubID.types';

interface GithubIdBaseInterface {
  githubUser: object | null;
  inputKeyword: string | null;
  isLoading: boolean;
  everFetched: boolean;
  notFound: boolean;
}

export interface GithubIDInitialState {
  productOwner: GithubIdBaseInterface[],
  technicalLeads: GithubIdBaseInterface[]
}


const GithubIDBaseState: GithubIdBaseInterface = {
  githubUser: null,
  inputKeyword: '',
  isLoading: false,
  everFetched: false,
  notFound: false,
};


// IMPORTANT:  In this redux state,the first elememt (index 0) is PO, others are TL
const INITIAL_STATE: GithubIDInitialState = {
  productOwner: [{ ...GithubIDBaseState }],
  technicalLeads: [{ ...GithubIDBaseState }, { ...GithubIDBaseState }]
};


interface GithubUserInputAction {
  type: string,
  payload: {
    persona: "productOwner" | "technicalLeads",
    inputValue: string
    position: number
  }
}
interface GithubIDUserBasicAction {
  type: string,
  payload: {
    persona: "productOwner" | "technicalLeads",
    position: number
  }
}

interface GithubIDUserStore {
  type: string,
  payload: {
    persona: "productOwner" | "technicalLeads",
    position: number
    data: object
  }
}
type Action = GithubUserInputAction & GithubIDUserBasicAction & GithubIDUserStore;

const githubIDReducer = (state = INITIAL_STATE, action: Action) => {
  switch (action.type) {

    case GithubIDActionTypes.GITHUB_USERS_REQUEST:
      const { persona: userRequestPersona, position: userRequestPosition } = action.payload;
      const newStateForUserRequest = { ...state }
      newStateForUserRequest[userRequestPersona][userRequestPosition] = {
        ...newStateForUserRequest[userRequestPersona][userRequestPosition],
        isLoading: true,
        everFetched: false,
      };

      return newStateForUserRequest;

    case GithubIDActionTypes.GITHUB_USER_EXISTS:
      const { persona: userExistPersona, position: userExistPosition } = action.payload;
      const newArrayForUserExist = { ...state };
      newArrayForUserExist[userExistPersona][userExistPosition] = {
        ...newArrayForUserExist[userExistPersona][userExistPosition],
        isLoading: true,
        everFetched: true,
        notFound: false,
      };
      return newArrayForUserExist;

    case GithubIDActionTypes.GITHUB_USER_STORE_USER:
      const { persona: userStorePersona, position: userStorePosition, data: userStoreData } = action.payload;
      const newArrayForStoreUser = { ...state };
      newArrayForStoreUser[userStorePersona][userStorePosition] = {
        ...newArrayForStoreUser[userStorePersona][userStorePosition],
        githubUser: userStoreData,
        isLoading: false,
      };
      return newArrayForStoreUser;

    case GithubIDActionTypes.GITHUB_USER_DOES_NOT_EXIST:
      const { persona: userNotExistPersona, position: userNotExistPosition, } = action.payload;
      const newArrayForNoneExistUser = { ...state };
      newArrayForNoneExistUser[userNotExistPersona][userNotExistPosition] = {
        ...newArrayForNoneExistUser[userNotExistPersona][userNotExistPosition],
        githubUser: null,
        isLoading: false,
        everFetched: true,
        notFound: true,
      };
      return newArrayForNoneExistUser;

    case GithubIDActionTypes.GITHUB_USERS_INPUT:
      const { persona: userInputPersona, position: userInputPosition, inputValue: userInputValue } = action.payload;
      const newStateForUserInput = { ...state }
      newStateForUserInput[userInputPersona][userInputPosition] = {
        inputKeyword: userInputValue,
        githubUser: null,
        isLoading: false,
        everFetched: false,
        notFound: false,
      };

      return newStateForUserInput;

    default:
      return state;
  }
};

export default githubIDReducer;
