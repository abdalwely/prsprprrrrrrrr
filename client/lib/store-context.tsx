import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Store } from './firestore';

interface StoreContextType {
  store: Store | null;
  setStore: (store: Store | null) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [store, setStore] = useState<Store | null>(null);

  return (
    <StoreContext.Provider value={{ store, setStore }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};