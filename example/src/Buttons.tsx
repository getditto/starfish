import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { Button } from 'react-native';

export function PresenceButton() {
  const navigation = useNavigation();
  return (
    <Button
      title="Presence"
      //@ts-ignore
      onPress={() => navigation.navigate('Presence')}
    />
  );
}

export function DetailsButton() {
  const navigation = useNavigation();
  return (
    <Button
      title="Details"
      //@ts-ignore
      onPress={() => navigation.navigate('Details')}
    />
  );
}
