import * as React from 'react';

import { StyleSheet, View, Text, Button } from 'react-native';
import { createDitto, multiply } from 'react-native-starfish';

export default function App() {
  const [result, setResult] = React.useState<number | undefined>();

  React.useEffect(() => {
    multiply(3, 7).then(setResult);
  }, []);

  return (
    <View style={styles.container}>
      <Text>Result: {result}</Text>
      <Button
        title="Create Ditto"
        onPress={() => {
          createDitto(
            'fbb5220f-5907-4bbf-9e0d-f7b0b1984df6',
            'bbe20e52-88e1-4d99-b4fd-60d9ed5e3401'
          );
        }}
      />
    </View>
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
