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

You'll need to ask Android for permissions when your app starts. An _easy_ way would be to use the `requestMissingPermissions` which is part of the `useAndroidPermissions` hook at the first render of the app. This is a one time call, so you can decide to call it whenever. 

```tsx
// other imports omitted for brevity
import React, { useEffect } from "react"
import { useAndroidPermissions } from "react-native-starfish"

function App() {
  const { requestMissingPermissions } = useAndroidPermissions();

  useEffect(() => {
    // this will request missing permissions if there are any
    requestMissingPermissions
      .then(permissionStatuses => console.log(permissionStatuses))
  }, [])
  
  return (
    <DittoProvider {/* ... omitted for brevity */}>
    </DittProvider>
  )
}
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
* All fields will be interpreted as `DittoRegister`, this includes maps. This means each document is an `AddWinsMap`, every nested value will become a `DittoRegister`
* This does not support `DittoAttachment` 