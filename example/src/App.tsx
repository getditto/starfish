/* eslint-disable react/no-unstable-nested-components */
import * as React from 'react';
import { DittoProvider } from 'react-native-starfish';
import { NavigationContainer } from '@react-navigation/native';

import { DetailsScreen } from './DetailsScreen';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from './HomeScreen';
import { DetailsButton, PresenceButton } from './Buttons';
import { PresenceScreen } from './PresenceScreen';

const Stack = createNativeStackNavigator();

export default function App() {
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
              headerRight: () => <PresenceButton />,
              headerLeft: () => <DetailsButton />,
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
