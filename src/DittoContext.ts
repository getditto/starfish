import React, { useContext } from 'react';
import type { DittoProxy } from './DittoProxy';

export const DittoContext = React.createContext<DittoProxy | undefined>(
  undefined
);

// Custom hook to access the context
export const useDittoProxy = (): DittoProxy => {
  const context = useContext(DittoContext);
  if (!context) {
    throw new Error('useMyContext must be used within a MyContextProvider');
  }
  return context;
};
