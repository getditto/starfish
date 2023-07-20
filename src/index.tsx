export interface Document {
  _id: unknown;
  [key: string]: unknown;
}

import { DittoProvider } from './DittoProvider';
import { DittoContext } from './DittoContext';
import {
  DittoProxy,
  useLiveQuery,
  useMutations,
  usePresence,
} from './DittoProxy';
import type { DittoDocument } from './DittoDocument';

export {
  DittoProvider,
  DittoContext,
  DittoProxy,
  useLiveQuery,
  useMutations,
  usePresence,
};
export type { DittoDocument };
