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

export interface Document {
  _id: unknown;
  [key: string]: unknown;
}

export function multiply(a: number, b: number): Promise<number> {
  return Starfish.multiply(a, b);
}

export function createDitto(appId: string, onlinePlaygroundToken: string) {
  return Starfish.createDitto(appId, onlinePlaygroundToken);
}

export function startDitto(appId: string) {
  return Starfish.startDitto(appId);
}

export function stopDitto(appId: string) {
  return Starfish.stopDitto(appId);
}

export function subscribe(
  appId: string,
  queryParams: { [key: string]: any }
): string {
  return Starfish.subscribe(appId, queryParams);
}

export function unsubscribe(subscriptionId: string): void {
  return Starfish.unsubscribe(subscriptionId);
}

export function liveQuery(
  appId: string,
  queryParams: { [key: string]: any },
  localOnly: boolean,
  callback: (documents: Document[]) => void
): string {
  return Starfish.liveQuery(appId, queryParams, localOnly, callback);
}

export function upsert(
  appId: string,
  collection: string,
  document: { [key: string]: any }
): Promise<unknown> {
  return Starfish.upsert(appId, collection, document);
}

export function remove(
  appId: string,
  queryParameters: { [key: string]: any }
): void {
  return Starfish.remove(appId, queryParameters);
}

export function evict(
  appId: string,
  queryParameters: { [key: string]: any }
): void {
  return Starfish.remove(appId, queryParameters);
}
