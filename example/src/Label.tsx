import { Text } from 'react-native';
import React from 'react';

interface Props extends React.PropsWithChildren<{}> {
  fontWeight?: 'bold' | 'normal';
  variant?: 'primary' | 'secondary';
}

const Label = ({ children, fontWeight, variant }: Props) => {
  let foregroundColor: string | undefined;

  if (variant === 'primary') {
    foregroundColor = '#007AFF';
  } else if (variant === 'secondary') {
    foregroundColor = 'gray';
  }

  return (
    <Text
      // eslint-disable-next-line react-native/no-inline-styles
      style={{
        fontSize: 17,
        color: foregroundColor,
        fontWeight: fontWeight === 'bold' ? '700' : '400',
      }}
    >
      {children}
    </Text>
  );
};

export default Label;
