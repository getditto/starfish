export interface Document {
  _id: unknown;
  [key: string]: unknown;
}

import { DittoProvider } from './DittoProvider';
import { DittoContext, useDittoProxy } from './DittoContext';
import {
  DittoProxy,
  useLiveQuery,
  useMutations,
  usePresence,
} from './DittoProxy';
import type { DittoDocument } from './DittoDocument';
import type {
  Connection,
  ConnectionType,
  PresenceGraph,
  Peer,
  Address,
} from './PresenceGraph';
import { addressToString } from './PresenceGraph';

export {
  DittoProvider,
  DittoContext,
  DittoProxy,
  useLiveQuery,
  useMutations,
  usePresence,
  useDittoProxy,
  addressToString,
};
export type { Connection, ConnectionType, PresenceGraph, Peer, Address };
export type { DittoDocument };
