/* eslint-disable react/no-unstable-nested-components */
import * as React from 'react';
import { DittoProvider, useAndroidPermissions } from 'react-native-starfish';
import { NavigationContainer } from '@react-navigation/native';
import { Platform, StyleSheet, View, PermissionsAndroid } from 'react-native';

import { DetailsScreen } from './DetailsScreen';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from './HomeScreen';
import { DetailsButton, PresenceButton } from './Buttons';
import { PresenceScreen } from './PresenceScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const { requestMissingPermissions } = useAndroidPermissions();

  React.useEffect(() => {
    (async () => {
      const missingPermissions = requestMissingPermissions();
      console.log('missingPermissions', missingPermissions);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DittoProvider
      appId="fbb5220f-5907-4bbf-9e0d-f7b0b1984df6"
      onlinePlaygroundToken="bbe20e52-88e1-4d99-b4fd-60d9ed5e3401"
    >
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            options={{
              headerLargeTitle: true,
              headerRight: () => {
                if (Platform.OS === 'android') {
                  return (
                    <View style={styles.headerRightContainer}>
                      <DetailsButton />
                      <PresenceButton />
                    </View>
                  );
                }
                return <PresenceButton />;
              },
              headerLeft: () => {
                return Platform.OS === 'ios' ? <DetailsButton /> : undefined;
              },
            }}
            name="Tasks"
            component={HomeScreen}
          />
          <Stack.Screen name="Details" component={DetailsScreen} />
          <Stack.Screen name="Presence" component={PresenceScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </DittoProvider>
  );
}

const styles = StyleSheet.create({
  headerRightContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    minWidth: 150,
  },
});
