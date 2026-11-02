import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import { COLORS, SIZES } from '@/constants/theme';

export interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  shadow?: boolean;
}

const baseStyles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
  },
  shadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  shadow = true,
}) => {
  const combinedStyle: StyleProp<ViewStyle> = [
    baseStyles.container,
    shadow && baseStyles.shadow,
    style,
  ];

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={combinedStyle}>
        {children}
      </Pressable>
    );
  }

  return <View style={combinedStyle}>{children}</View>;
};

export default Card;
