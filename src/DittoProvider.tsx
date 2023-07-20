import React from 'react';
import { DittoProxy } from './DittoProxy';
import { DittoContext } from './DittoContext';

interface DittoProviderProps extends React.PropsWithChildren<unknown> {
  /**
   * This is the Ditto App ID for the online playground.
   * For this experimental version of this React Native SDK,
   * we only support the online playground.
   * You can retrieve your App ID from the Ditto portal.
   */
  appId: string;
  /**
   * This is the Ditto Token for the online playground.
   * For this experimental version of this React Native SDK,
   * we only support the online playground.
   * You can retrieve your Token from the Ditto portal.
   */
  onlinePlaygroundToken: string;
}

/**
 * This is the DittoProvider component.
 * It is a React Context Provider that provides the DittoProxy instance
 * @example
 * ```tsx
 * import { DittoProvider } from '@dittolive/react-native';
 * function App() {
 *  return (
 *    <DittoProvider appId="..." onlinePlaygroundToken="...">
 *      <Text>Now I can render Ditto</Text>
 *    </DittoProvider>
 *  );
 * }
 * ```
 */
export const DittoProvider = ({
  children,
  appId,
  onlinePlaygroundToken,
}: DittoProviderProps) => {
  const dittoProxy = new DittoProxy(appId, onlinePlaygroundToken);
  return (
    <DittoContext.Provider value={dittoProxy}>{children}</DittoContext.Provider>
  );
};
