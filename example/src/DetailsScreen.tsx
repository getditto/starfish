import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import Label from './Label';
import { useDittoProxy } from 'react-native-starfish';

export function DetailsScreen() {
  const dittoProxy = useDittoProxy();

  const [sdkVersion, setSdkVersion] = React.useState<string | undefined>();

  React.useEffect(() => {
    dittoProxy.getDittoInformation().then((info) => {
      console.log(info);
      setSdkVersion(info.sdkVersion as string);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={style.container}>
      <View>
        <Label fontWeight="bold">AppId</Label>
        <Label>{dittoProxy.appId}</Label>
      </View>
      <View>
        <Label fontWeight="bold">Ditto SDK Version</Label>
        <Label>{sdkVersion}</Label>
      </View>
    </SafeAreaView>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 16,
    marginVertical: 16,
  },
});
