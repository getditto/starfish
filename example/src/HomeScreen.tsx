import React from 'react';
import { Button, SafeAreaView, Text } from 'react-native';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';

interface HomeScreenProps extends NativeStackScreenProps<{}> {}

export function HomeScreen({ navigation }: HomeScreenProps) {

  

  return (
    <SafeAreaView style={styles.container}>
      <Text>Home</Text>
      <Button
        title="Go to Details"
        onPress={() => navigation.navigate('Details')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
