# react-native-starfish

React Native Experimental Library and Example for iOS and Android for [Ditto](https://www.ditto.live)

__Important__: This only supports the online playground mode

# Requirements

1. For iOS you will need Cocoapods on your machine. [To install Cocoapods follow the instructions here](https://guides.cocoapods.org/using/getting-started.html)
2. Go to https://portal.ditto.live, create an app, and obtain 
  * appId
  * onlinePlaygroundToken 

## Installation

```sh
npm install react-native-starfish 
```

or if you have yarn 

```sh
yarn add react-native-starfish
```

## Special Installations for iOS

1. `cd` in your terminal to your iOS app's `Podfile`
2. Run `pod install --repo-update`
3. Add the following keys to your Info.plist. [A more comprehensive set of instructions are here](https://docs.ditto.live/ios/installation#platform-permissions). Essentially, you'll just need to add the following to your App's Info.plist

```xml
<key>NSBluetoothAlwaysUsageDescription</key>
<string>Uses Bluetooth to connect and sync with nearby devices</string>
<key>NSBluetoothPeripheralUsageDescription</key>
<string>Uses Bluetooth to connect and sync with nearby devices</string>
<key>NSLocalNetworkUsageDescription</key>
<string>Uses WiFi to connect and sync with nearby devices</string>
<key>NSBonjourServices</key>
<array>
  <string>_http-alt._tcp.</string>
</array>
```

## Special Instructions for Android

You need permissions for your Android app to handle P2P. [For a more comprehensive set of instructions you'll need to visit here](https://docs.ditto.live/android/installation#android-manifest-permissions)

```xml
<manifest
    xmlns:tools="http://schemas.android.com/tools"
    xmlns:android="http://schemas.android.com/apk/res/android">

<uses-permission android:name="android.permission.BLUETOOTH"
    android:maxSdkVersion="30" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN"
    android:maxSdkVersion="30" />
<uses-permission android:name="android.permission.BLUETOOTH_ADVERTISE"
    tools:targetApi="s" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT"
    tools:targetApi="s" />
<uses-permission android:name="android.permission.BLUETOOTH_SCAN"
    android:usesPermissionFlags="neverForLocation"
    tools:targetApi="s" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"
    android:maxSdkVersion="32" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"
    android:maxSdkVersion="30" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.CHANGE_NETWORK_STATE" />
<uses-permission android:name="android.permission.CHANGE_WIFI_MULTICAST_STATE" />
<uses-permission android:name="android.permission.CHANGE_WIFI_STATE" />
<uses-permission android:name="android.permission.NEARBY_WIFI_DEVICES"
    android:usesPermissionFlags="neverForLocation"
    tools:targetApi="tiramisu" />
```

## Running the example

See the example readme in (./example/README.md)

## Usage

At the most top-level component, you will need to import `<DittoProvider`> like below. Usually this will be your `<App>` component. __You cannot access the hooks outside of `<DittoProvider>`_.

```tsx
import { DittoProvider } from 'react-native-starfish';

export default function App() {
  return (
    <DittoProvider
      appId="REPLACE_ME"
      onlinePlaygroundToken="REPLACE_ME"
    >
      <SafeAreaView style={styles.container}>
        <MainPage />
      </SafeAreaView>
    </DittoProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
})
```

Now in child components you can use the Ditto hooks like so:

# Live Query

```tsx
import { useLiveQuery } from "react-native-starfish"

function MainPage() {
  const { documents } = useLiveQuery({
    collection: 'tasks',
    find: 'isCompleted == $args.x',
    args: {
      x: true
    }
  })

  return (
    <Text>{documents.length} Documents Found</Text>
  )
}
```

# Mutations

To use mutations, you have `upsert`, `remove`, and `evict`

```tsx

import { useLiveQuery, useMutations } from "react-native-starfish"

function MyComponent() {
  const { upsert, evict, remove } = useMutations()
}
```

## Commentary

* This experimental library _only supports_ Ditto's onlinePlayground mode for now
* All fields will be interpreted as `DittoRegister`, this includes maps. So 