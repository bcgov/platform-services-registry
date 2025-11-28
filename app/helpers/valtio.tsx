import { createContext, useContext, useState } from 'react';
import { proxy, useSnapshot } from 'valtio';

export function createValtioContext<T extends object>(initialState: T) {
  const StateContext = createContext<T | null>(null);

  const StateProvider = function Provider({ children }: { children: React.ReactNode }) {
    const [state] = useState(() => proxy(initialState));
    return <StateContext.Provider value={state}>{children}</StateContext.Provider>;
  };

  const useProviderState = function useProviderState() {
    const state = useContext(StateContext);
    if (!state) {
      throw new Error('useProviderState must be used within StateProvider');
    }
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
  const [state] = useState(() => proxy<T>(data));
  const snapshot = useSnapshot(state);
  return [state, snapshot];
}
