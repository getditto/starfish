import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface CheckboxProps {
  isChecked: boolean;
  onChecked: () => void;
}

const CheckboxComponent = (props: CheckboxProps) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.baseline} onPress={() => props.onChecked}>
        {props.isChecked && <View style={styles.checked} />}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  baseline: {
    height: 20,
    width: 20,
    borderWidth: 1,
    borderColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checked: {
    height: 20,
    width: 20,
    backgroundColor: 'black',
  },
});

export default CheckboxComponent;
