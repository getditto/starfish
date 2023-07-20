import React, { useEffect, useState } from 'react';
import { useDittoProxy } from './DittoContext';
import type { DittoQueryParams } from './DittoQueryParams';
import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-starfish' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const Starfish = NativeModules.Starfish
  ? NativeModules.Starfish
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export interface DittoDocument {
  _id: any;
  [key: string]: any;
}

/**
 * A DittoProxy is a connection to a Ditto app.
 * It's not recommended that you use this class directly.
 * Use the hooks instead.
 * @see useMutations
 * @see useLiveQuery
 */
export class DittoProxy {
  /**
   * The app ID of the Ditto app to connect to.
   */
  appId: string;
  /**
   * The online playground token of the Ditto app to connect to.
   * Do not share this token with anyone.
   */
  onlinePlaygroundToken: string;

  /**
   * Creates a new DittoProxy.
   * @param appId The online playground token of the Ditto app to connect to.
   * @param onlinePlaygroundToken The online playground token of the Ditto app to connect to.
   */
  constructor(appId: string, onlinePlaygroundToken: string) {
    this.appId = appId;
    this.onlinePlaygroundToken = onlinePlaygroundToken;
    Starfish.createDitto(appId, onlinePlaygroundToken);
  }

  find(params: DittoQueryParams): Promise<DittoDocument[]> {
    return Starfish.find(this.appId, params);
  }

  /**
   * This will upsert a document to the specified collection.
   * If the document has an _id, it will be updated.
   * Important: all nested map will be converted to Registers.
   * @param collection the collection to upsert the document to
   * @param document a document to upsert
   * @returns The upserted document _id
   */
  upsert(
    collection: string,
    document: { [key: string]: unknown }
  ): Promise<unknown> {
    return Starfish.upsert(this.appId, collection, document);
  }

  remove(params: DittoQueryParams): void {
    return Starfish.remove(this.appId, params);
  }

  evict(params: DittoQueryParams): void {
    return Starfish.evict(this.appId, params);
  }

  liveQuery(
    params: DittoQueryParams,
    localOnly: boolean,
    callback: (documents: DittoDocument[], liveQueryId: string) => void
  ) {
    return Starfish.liveQuery(this.appId, params, localOnly, callback);
  }

  stopLiveQuery(liveQueryId: string): void {
    return Starfish.stopLiveQuery(liveQueryId);
  }

  subscribe(queryParams: DittoQueryParams): string {
    return Starfish.subscribe(this.appId, queryParams);
  }

  unsubscribe(subscriptionId: string): void {
    return Starfish.unsubscribe(subscriptionId);
  }

  startSync(): void {
    Starfish.startSync(this.appId);
  }

  stopSync(): void {
    Starfish.stopSync(this.appId);
  }

  observePresence(
    callback: (presence: { [key: string]: unknown }) => void
  ): string {
    return Starfish.observePresence(this.appId, (presenceJSON: string) => {
      try {
        const presence = JSON.parse(presenceJSON);
        callback(presence);
      } catch (e) {
        console.error('Error parsing presence', e);
      }
    });
  }

  stopObservingPresence(presenceObserverId: string): void {
    return Starfish.stopObservingPresence(presenceObserverId);
  }
}

/**
 * Creates a live query and a subscription to it.
 * If you don't want to subscribe to changes from other peers, set localOnly to true.
 * @param params query parameters for the live query
 * @param localOnly if this is true, the live query will only react to changes made
 * locally without subscribing to changes from other peers
 * @returns documents that match the query
 */
export function useLiveQuery(
  params: DittoQueryParams,
  localOnly?: boolean
): {
  documents: DittoDocument[];
} {
  const [documents, setDocuments] = useState<DittoDocument[]>([]);
  const dittoProxy = useDittoProxy();
  useEffect(() => {
    let l: string | undefined;
    dittoProxy.liveQuery(params, !!localOnly, (docs, liveQueryId) => {
      setDocuments(docs);
      l = liveQueryId;
    });
    return () => {
      if (l) {
        dittoProxy.stopLiveQuery(l);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return {
    documents,
  };
}

/**
 * This hook will return a presence object that contains the current presence state of the DittoProxy.
 * @returns presence object
 * @example
 * ```tsx
 * const { presence } = usePresence();
 * console.log(presence);
 * ```
 */
export function usePresence() {
  const dittoProxy = useDittoProxy();
  const [presence, setPresence] = React.useState({});

  useEffect(() => {
    let x = dittoProxy.observePresence((graph: { [key: string]: unknown }) => {
      setPresence(graph);
    });
    return () => {
      dittoProxy.stopObservingPresence(x);
    };
  }, [dittoProxy]);

  return {
    presence,
  };
}

/**
 * A hook for finding documents on the local disk.
 * @see useLiveQuery if you want to sync documents from other peers and observe changes
 */
export function useFind() {
  const dittoProxy = useDittoProxy();

  /**
   * Finds documents that match the query.
   * Important: this only returns documents from the local disk
   * Use useLiveQuery to get documents from the local disk and other peers
   * @param params query parameters for the find
   * @returns documents that match the query
   */
  function find(params: DittoQueryParams): Promise<DittoDocument[]> {
    return dittoProxy.find(params);
  }

  return {
    find,
  };
}

export function useMutations() {
  const dittoProxy = useDittoProxy();

  /**
   * This will upsert a document to the specified collection.
   * If the document has an _id, it will be updated.
   * If the document doesn't have an _id a UUID string will be generated and added to the document with the key _id.
   * Important: all nested map will be converted to Registers.
   * @param collection the collection to upsert the document to
   * @param document a document to upsert
   * @returns The upserted document _id
   * @example
   * ```ts
   * const { upsert } = useMutations();
   * upsert('users', { _id: '1', name: 'John' });
   * upsert('users', { _id: '1', name: 'John Doe' });
   * upsert('users', { name: 'John Doe' });
   * ```
   */
  function upsert(collection: string, document: { [key: string]: unknown }) {
    return dittoProxy.upsert(collection, document);
  }

  /**
   * Removes documents from the specified collection.
   * This will create a tombstone and sync removes to other peers.
   * @param params query parameters to remove documents
   * @returns void;
   */
  function remove(params: DittoQueryParams) {
    return dittoProxy.remove(params);
  }

  /**
   * This will evict documents from the specified collection.
   * This will not create a tombstone and will not sync removes to other peers.
   * This is useful for removing documents that are no longer needed.
   * Warning: if you have a subscription to the documents you are evicting, you will still receive updates.
   * This means that documents you have evicted may be re-added to your collection from another peer
   * Evicting is like "forgetting" documents.
   * @param params query parameters to evict documents
   * @returns void
   */
  function evict(params: DittoQueryParams) {
    return dittoProxy.evict(params);
  }

  return {
    upsert,
    evict,
    remove,
  };
}
