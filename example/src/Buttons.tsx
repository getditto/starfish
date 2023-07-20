import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { Pressable } from 'react-native';
import Label from './Label';

export function PresenceButton() {
  const navigation = useNavigation();
  return (
    <Pressable
      onPress={() =>
        //@ts-ignore
        navigation.navigate('Presence')
      }
    >
      <Label variant="primary">Presence</Label>
    </Pressable>
  );
}

export function DetailsButton() {
  const navigation = useNavigation();
  return (
    <Pressable
      onPress={() =>
        //@ts-ignore
        navigation.navigate('Details')
      }
    >
      <Label variant="primary">Details</Label>
    </Pressable>
  );
}
