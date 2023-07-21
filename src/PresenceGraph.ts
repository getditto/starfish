export type Address = {
  siteId: string;
  pubkey: Uint8Array;
};

export type Peer = {
  /**
   * Address to contact this peer via Ditto Bus, unique with a Ditto mesh
   * network.
   */
  address: Address;

  /**
   * The peer key is a unique identifier for a given peer, equal to or derived
   * from the cryptographic public key used to authenticate it.
   *
   * NOTE: This will be be empty when a peer is not updated to the latest
   * version of the SDK.
   */
  peerKey: Uint8Array;

  /**
   * The human-readable device name of the peer. This defaults to the hostname
   * but can be manually set by the application developer of the other peer.
   * It is not necessarily unique.
   */
  deviceName: string;

  /**
   * Currently active connections of the peer.
   */
  connections: Connection[];

  /**
   * Indicates whether the peer is connected to Ditto Cloud.
   */
  isConnectedToDittoCloud: boolean;

  /** The operating system the peer is running on, `undefined` if (yet) unknown. */
  os?: string;

  /** The Ditto SDK version the peer is running with, `undefined` if (yet) unknown. */
  dittoSDKVersion?: string;
};

// -----------------------------------------------------------------------------

/**
 * Represents the Ditto mesh network of peers and their connections between each
 * other. The `localPeer` is the entry point, all others are remote peers known
 * by the local peer (either directly or via other remote peers).
 */
export type PresenceGraph = {
  /**
   * Returns the local peer (usually the peer that is represented by the
   * currently running Ditto instance). The `localPeer` is the entry point, all
   * others are remote peers known by the local peer (either directly or via
   * other remote peers).
   */
  localPeer: Peer;

  /**
   * Returns all remote peers known by the `localPeer`, either directly or via
   * other remote peers.
   */
  remotePeers: Peer[];

  /**
   * Returns the underlying CBOR data if the presence graph has been initialized
   * with CBOR. All of Ditto API returning a presence graph has this property
   * set.
   */
  underlyingCBOR?: Uint8Array;
};

export type Connection = {
  /** Unique identifier for the connection. */
  id: string;

  /** Type of transport enabling this connection. */
  connectionType: ConnectionType;

  /** The peer key of the peer at one end of the connection. */
  peer1: Uint8Array;

  /** The peer key of the peer at one end of the connection. */
  peer2: Uint8Array;

  /*
   * Gets an estimate of distance to the remote peer. This value is inaccurate.
   * The environment, hardware, and several other factors can greatly affect
   * this value. It is currently derived from RSSI. Can be (yet) unknown and
   * therefore not set.
   */
  approximateDistanceInMeters?: number;
};

export function addressToString(address: Address) {
  return `${address.siteId}-${address.pubkey}`;
}

export type ConnectionType =
  | 'P2PWiFi'
  | 'WebSocket'
  | 'AccessPoint'
  | 'Bluetooth';
