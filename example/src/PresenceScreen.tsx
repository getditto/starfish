import React from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { usePresence, addressToString } from 'react-native-starfish';
import Label from './Label';

export function PresenceScreen() {
  const { graph } = usePresence();

  const remotePeers = graph?.remotePeers ?? [];

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Label fontWeight="bold">
          My Device: {graph?.localPeer.deviceName}
        </Label>
      </View>

      <Label fontWeight="bold">Remote Peers</Label>
      <FlatList
        style={styles.flatListStyle}
        data={remotePeers}
        renderItem={({ item }) => (
          <View>
            <Label fontWeight="bold">{item.deviceName}</Label>
            <View style={styles.connectionsContainer}>
              {item.connections.map((connection) => {
                return (
                  <Text key={connection.id}>{connection.connectionType}</Text>
                );
              })}
            </View>
          </View>
        )}
        keyExtractor={(item) => addressToString(item.address)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 20,
    marginTop: 20,
  },
  flatListStyle: {
    marginTop: 20,
  },
  connectionsContainer: {
    marginLeft: 20,
    height: 40,
  },
});
