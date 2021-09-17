/* eslint-disable no-case-declarations */
import GithubIDActionTypes from './githubID.types';

interface GithubIdBaseInterface {
  githubUser: object | null;
  inputKeyword: string | null;
  isLoading: boolean;
  everFetched: boolean;
  notFound: boolean;
}




const GithubIDBaseState = {
  githubUser: null,
  inputKeyword: '',
  isLoading: false,
  everFetched: false,
  notFound: false,
}

// IMPORTANT:  In this redux state,the first elememt (index 0) is PO, others are TL
const INITIAL_STATE: GithubIdBaseInterface[] = [GithubIDBaseState, GithubIDBaseState];

const githubIDReducer = (
  state = INITIAL_STATE,
  action: any,
) => {
  switch (action.type) {

    case GithubIDActionTypes.NEW_GITHUB_ID_ENTRY:
      return [...state, GithubIDBaseState]

    case GithubIDActionTypes.GITHUB_USERS_REQUEST:
      const newArrayForUserRequest = [...state]
      newArrayForUserRequest[action.payload] = {
        ...state[action.payload],
        isLoading: true,
        everFetched: false,
      }
      return newArrayForUserRequest


    case GithubIDActionTypes.GITHUB_USER_EXIST:
      const newArrayForUserExist = [...state]
      newArrayForUserExist[action.payload] = {
        ...state[action.payload],
        isLoading: true,
        everFetched: true,
        notFound: false,
      }
      return newArrayForUserExist

    case GithubIDActionTypes.GITHUB_USER_STORE_USER:
      const newArrayForStoreUser = [...state]
      newArrayForStoreUser[action.payload.index] = {
        ...state[action.payload.index],
        githubUser: action.payload.data,
        isLoading: false,
      }
      return newArrayForStoreUser

    case GithubIDActionTypes.GITHUB_USER_DOES_NOT_EXIST:
      const newArrayForNoneExistUser = [...state]
      newArrayForNoneExistUser[action.payload] = {
        ...state[action.payload],
        githubUser: null,
        isLoading: false,
        everFetched: true,
        notFound: true,
      }
      return newArrayForNoneExistUser

    case GithubIDActionTypes.GITHUB_USERS_INPUT:
      const newArrayForInputAction = [...state]
      newArrayForInputAction[action.payload.index] = {
        inputKeyword: action.payload.inputValue,
        githubUser: null,
        isLoading: false,
        everFetched: false,
        notFound: false,
      }
      return newArrayForInputAction

    default:
      return state
  }
};

export default githubIDReducer;
