import React from 'react';
import { SafeAreaView, Text } from 'react-native';
import { usePresence } from 'react-native-starfish';

export function PresenceScreen() {
  const { graph } = usePresence();

  return (
    <SafeAreaView>
      <Text>{JSON.stringify(graph, null, 4)}</Text>
    </SafeAreaView>
  );
}
