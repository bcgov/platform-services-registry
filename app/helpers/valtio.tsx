import { createContext, useContext, useState } from 'react';
import { proxy, useSnapshot } from 'valtio';

export function createValtioContext<T extends object>(initialState: T) {
  const state = proxy(initialState);

  const StateContext = createContext<typeof state>(state);

  const StateProvider = function Provider({ children }: { children: React.ReactNode }) {
    return <StateContext.Provider value={state}>{children}</StateContext.Provider>;
  };

  const useProviderState = function useProviderState() {
    const state = useContext(StateContext);
    const snapshot = useSnapshot(state);
    return { state, snapshot };
  };

  return { StateProvider, useProviderState };
}

export function createGlobalValtio<T extends object>(initialState: T) {
  const state = proxy<T>(initialState);

  const useValtioState = function useValtioState() {
    const snapshot = useSnapshot(state);
    return [state, snapshot];
  };

  return { state, useValtioState };
}

export function useValtio<T extends object>(data: T) {
  const state = useState(() => proxy<T>(data));
  const snapshot = useSnapshot(state);
  return [state, snapshot];
}
