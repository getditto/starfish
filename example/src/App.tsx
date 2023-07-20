import * as React from 'react';

import { SafeAreaView, StyleSheet } from 'react-native';
import { DittoProvider } from 'react-native-starfish';
import MainPage from './MainPage';

export default function App() {
  return (
    <DittoProvider
      appId="fbb5220f-5907-4bbf-9e0d-f7b0b1984df6"
      onlinePlaygroundToken="bbe20e52-88e1-4d99-b4fd-60d9ed5e3401"
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
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
