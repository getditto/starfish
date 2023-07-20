import { Text } from 'react-native';
import React from 'react';

interface Props extends React.PropsWithChildren<{}> {
  fontWeight?: 'bold' | 'normal';
}

const Label = ({ children, fontWeight }: Props) => {
  return (
    <Text
      // eslint-disable-next-line react-native/no-inline-styles
      style={{
        fontSize: 17,
        fontWeight: fontWeight === 'bold' ? '700' : '400',
      }}
    >
      {children}
    </Text>
  );
};

export default Label;
