import React from 'react';
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';

import { COLORS, SIZES } from '@/constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline';
type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
}

const variantStyles: Record<
  ButtonVariant,
  {
    container: StyleProp<ViewStyle>;
    textColor: string;
  }
> = {
  primary: {
    container: {
      backgroundColor: COLORS.primary,
      borderColor: 'transparent',
    },
    textColor: COLORS.white,
  },
  secondary: {
    container: {
      backgroundColor: COLORS.secondary,
      borderColor: 'transparent',
    },
    textColor: COLORS.white,
  },
  outline: {
    container: {
      backgroundColor: 'transparent',
      borderColor: COLORS.primary,
    },
    textColor: COLORS.primary,
  },
};

const sizeStyles: Record<
  ButtonSize,
  {
    container: StyleProp<ViewStyle>;
    text: TextStyle;
  }
> = {
  small: {
    container: {
      paddingVertical: SIZES.padding * 0.5,
      paddingHorizontal: SIZES.padding,
    },
    text: { fontSize: SIZES.body - 2 },
  },
  medium: {
    container: {
      paddingVertical: SIZES.padding * 0.75,
      paddingHorizontal: SIZES.padding * 1.5,
    },
    text: { fontSize: SIZES.body },
  },
  large: {
    container: {
      paddingVertical: SIZES.padding,
      paddingHorizontal: SIZES.padding * 2,
    },
    text: { fontSize: SIZES.h1 },
  },
};

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
}) => {
  const isDisabled = disabled || loading;
  const { container: variantContainer, textColor } = variantStyles[variant];
  const sizeConfig = sizeStyles[size];

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.base,
        variantContainer,
        sizeConfig.container,
        isDisabled && styles.disabled,
      ]}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <Text style={[styles.text, sizeConfig.text, { color: textColor }]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: SIZES.padding * 2.5,
  },
  text: {
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.6,
  },
});

export default Button;
