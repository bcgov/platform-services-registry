import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // tell redux we gonna use windows storage
import githubIDReducer from './githubID/githubID.reducer';

const peresistConfig = {
  key: 'root',
  storage,
  whitelist: ['githubID'],
};
const rootReducer = combineReducers({
  githubID: githubIDReducer,
});

export default persistReducer(peresistConfig, rootReducer);
