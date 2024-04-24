import { createContext, useContext, useRef } from 'react';
import { proxy, useSnapshot } from 'valtio';

export function createValtioContext<T extends object>(initialState: T) {
  const StateContext = createContext<T>(initialState);

  const StateProvider = function Provider({ children }: { children: React.ReactNode }) {
    const state = useRef(proxy(initialState)).current;
    return <StateContext.Provider value={state}>{children}</StateContext.Provider>;
  };

  const useProviderState = function useTableState() {
    const state = useContext(StateContext);
    const snapshot = useSnapshot(state);
    return { state, snapshot };
  };

  return { StateProvider, useProviderState };
}

export function useValtio<T extends object>(data: T) {
  const state = useRef(proxy<T>(data)).current;
  const snapshot = useSnapshot(state);
  return { state, snapshot };
}
