import { applyMiddleware, createStore, EmptyObject } from 'redux';
import logger from 'redux-logger';
import { persistStore } from 'redux-persist';
import { PersistPartial } from 'redux-persist/lib/persistReducer';
import thunk from 'redux-thunk';
import rootReducer, { iRootState } from './root-reducer';

// TODO: thunk or saga?

const middlewares = [];
middlewares.push(thunk);
if (process.env.NODE_ENV === 'development') {
  middlewares.push(logger);
}

export const store = createStore<EmptyObject & PersistPartial & iRootState, any, any, any>(rootReducer, applyMiddleware(...middlewares));
export const persistor = persistStore(store);
