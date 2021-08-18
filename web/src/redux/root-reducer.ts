import { combineReducers } from 'redux';
import githubIDReducer from './githubID/githubID.reducer';

export default combineReducers({
  githubID: githubIDReducer,
});
